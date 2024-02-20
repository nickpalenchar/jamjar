import { PrismaClient, WorkerTask } from "@prisma/client";
import { getLogger } from "./logging";
import { isAfter, add } from "date-fns";
import os from "node:os";
const log = getLogger();

const prisma = new PrismaClient();
export class Worker {
  interval: number;
  isStarted: boolean;
  #intervalId: NodeJS.Timeout | null;
  #currentTask: WorkerTask | null;
  isPerformingTask: boolean;
  #_id: string;
  blocking: boolean; // whether or not to wait until the task completes before trying another

  constructor({ interval = 60, blocking = true }) {
    this.interval = interval;
    this.isStarted = false;
    this.isPerformingTask = false;
    this.#intervalId = null;
    this.#currentTask = null;
    this.#_id = `${os.hostname()}:${process.pid}`;
    this.blocking = blocking;
  }
  get id() {
    return this.#_id;
  }

  start(initial = true) {
    if (this.isStarted) {
      return;
    }
    this.isStarted = true;
    if (initial) {
      this._getNewTask();
    }
    this.#intervalId = setInterval(this._getNewTask, this.interval * 1000);
  }

  stop() {
    if (!this.isStarted) {
      return;
    }
    this.isStarted = false;
    this.#intervalId && clearInterval(this.#intervalId);
  }

  async _getNewTask(_retry = 0): Promise<void> {
    const now = new Date();
    const task = await prisma.workerTask.findFirst({ where: { taken: false } });
    if (!task) {
      log.info("No tasks in queue");
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
    } catch (e) {
      const takenLock = await prisma.workerLocks.findUnique({
        where: {
          key: TASK_KEY,
        },
      });
      if (!takenLock) {
        log.warn("Lock seems to have disappeared. Trying again.", {
          workerId: this.id,
        });
        if (_retry < 3) {
          return this._getNewTask(++_retry);
        }
        return;
      }
      if (takenLock.exp && isAfter(now, takenLock.exp)) {
        log.info("Encounter expired taken lock. Force-releasing it.", {
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
      log.error("Lock already taken", { workerId: this.id, task: task.id });
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

  _performTask() {
    if (this.isPerformingTask) {
      log.error("Tried to perform task when already working", {
        workerId: this.id,
        currentTask: this.#currentTask?.id,
      });
      return;
    }
    this.isPerformingTask = true;
    try {
    } catch (e) {
    } finally {
      this.isPerformingTask = false;
    }
  }
}
