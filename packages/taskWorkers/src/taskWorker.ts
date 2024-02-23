import { PrismaClient, WorkerTask } from "@prisma/client";
import { getLoggerWithData } from "./logging";
import { isAfter, add } from "date-fns";
import os from "node:os";
import { tasks } from "./tasks";

const prisma = new PrismaClient();

export class TaskWorker {
  interval: number;
  isStarted: boolean;
  #intervalId: NodeJS.Timeout | null;
  #currentTask: WorkerTask | null;
  isPerformingTask: boolean;
  lockName: string | null;
  #_id: string;
  blocking: boolean; // whether or not to wait until the task completes before trying another
  log: ReturnType<typeof getLoggerWithData>;

  constructor({ interval = 60, blocking = true }) {
    this.interval = interval;
    this.isStarted = false;
    this.isPerformingTask = false;
    this.#intervalId = null;
    this.#currentTask = null;
    this.#_id = `${os.hostname()}:${process.pid}`;
    this.blocking = blocking;
    this.log = getLoggerWithData({ workerId: this.#_id });
    this.lockName = null;
  }
  get id() {
    return this.#_id;
  }

  start(initial = true) {
    this.log.info("Starting up worker");
    if (this.isStarted) {
      return;
    }
    this.isStarted = true;
    if (initial) {
      this.log.info("Initial task starting");
      this._getNewTask();
    }
    this.#intervalId = setInterval(
      this._getNewTask.bind(this),
      this.interval * 1000,
    );
  }

  stop() {
    if (!this.isStarted) {
      return;
    }
    this.isStarted = false;
    this.#intervalId && clearInterval(this.#intervalId);
  }

  async _getNewTask(_retry = 0): Promise<void> {
    this.log.info("Getting new task");
    const now = new Date();
    const task = await prisma.workerTask
      .findFirst({
        where: {
          OR: [
            {
              taken: false,
              not_before: { lt: now },
            },
            {
              taken: false,
              not_before: null,
            },
          ],
        },
        orderBy: {
          id: "asc",
        },
      })
      .catch((e) => console.log("ERRRROORR", e));
    if (!task) {
      this.log.info("No tasks in queue");
      return;
    }
    const TASK_KEY = `workerTask:${task?.id}`;

    try {
      await prisma.workerLocks.create({
        data: {
          key: `workerTask:${task?.id}`,
          issued_to: this.id,
        },
      });
      this.lockName = `workerTask:${task?.id}`;
    } catch (e) {
      const takenLock = await prisma.workerLocks.findUnique({
        where: {
          key: TASK_KEY,
        },
      });
      if (!takenLock) {
        this.log.warn("Lock seems to have disappeared. Trying again.", {
          workerId: this.id,
        });
        if (_retry < 3) {
          return this._getNewTask(++_retry);
        }
        return;
      }
      if (takenLock.exp && isAfter(now, takenLock.exp)) {
        this.log.info("Encounter expired taken lock. Force-releasing it.", {
          workerId: this.id,
          lockTakenBy: takenLock.issued_to,
        });
        await prisma.$transaction([
          prisma.workerLocks.delete({
            where: {
              id: takenLock.id,
            },
          }),
          prisma.workerTask.update({
            where: {
              id: task.id,
            },
            data: {
              taken: false,
            },
          }),
        ]);
        if (_retry < 3) {
          return this._getNewTask(++_retry);
        }
      }
      this.log.error("Lock already taken", {
        workerId: this.id,
        task: task.id,
      });
      return;
    }

    // got lock
    await prisma.workerTask.update({
      where: { id: task.id },
      data: {
        taken: true,
      },
    });
    this.#currentTask = task;
    this._performTask();
  }

  async _performTask() {
    const currentTask = this.#currentTask;
    if (this.isPerformingTask) {
      this.log.error("Tried to perform task when already working", {
        workerId: this.id,
        currentTask: this.#currentTask?.id,
      });
      return;
    }
    this.log.info("Performing a task!!!", {
      currentTask: this.#currentTask?.id,
      taskName: this.#currentTask?.task_name,
    });

    this.isPerformingTask = true;
    try {
      const handler = tasks[currentTask?.task_name ?? ""];
      console.log({ handler });
      if (!handler) {
        this.log.error("No handler for task name", {
          taskName: currentTask?.task_name,
        });
        throw Error("No handler for task name");
      }
      await handler(currentTask?.data);
      this.log.info("Completed task successfully", { currentTask });
      await prisma.workerTask.delete({
        where: {
          id: currentTask?.id,
        },
      });
    } catch (e) {
      console.error({ error: e });
    } finally {
      if (this.lockName) {
        await prisma.workerLocks.delete({
          where: {
            key: this.lockName,
          },
        });
      }

      this.isPerformingTask = false;
      if (currentTask?.respawn) {
        const taskCopy: Omit<WorkerTask, "id"> = { ...currentTask };
        delete (taskCopy as Partial<WorkerTask>).id;
        await prisma.workerTask.create({
          data: {
            task_name: currentTask.task_name,
            not_before: add(new Date(), {
              seconds: currentTask.respawn,
            }),
            ttl: currentTask.ttl,
            respawn: currentTask.respawn,
            data: currentTask.data ?? {},
          },
        });
        await prisma.workerTask.delete({
          where: { id: currentTask.id },
        });
      }
    }
  }
}
