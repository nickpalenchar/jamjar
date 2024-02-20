import { PrismaClient } from "@prisma/client";
import { TaskWorker } from "./taskWorker";
const prisma = new PrismaClient();

const MAX_WORKERS = 1;
const INTERVAL = 15;

async function start(): Promise<never> {
  for (let i = 0; i < MAX_WORKERS; i++) {
    const task = new TaskWorker({
      interval: INTERVAL,
    });
    // the first task gets an initial start
    task.start(i === 0);
  }
  while (true) {}
}

start();
