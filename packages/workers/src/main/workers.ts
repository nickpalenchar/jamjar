const workers: Record<string, (NodeJS.Timeout | number)[]> = {};
let numWorkers: number = 0;
const WORKER_CAP = 100;

const workerControler = {
  createWorker(workerId: string) {
    if (numWorkers >= WORKER_CAP) {
      throw new Error("No workers left.");
    }
    if (workers[workerId]) {
      throw new Error("Worker with id already exists.");
    }
    workers[workerId] = [];
  },

  setInterval(workerId: string, callback: CallableFunction, timeout: number) {
    if (!workers[workerId]) {
      throw new Error("Worker with given id does not exist");
    }
    workers[workerId].push(setInterval(callback, timeout));
  },

  setTimeout(workerId: string, callback: CallableFunction, timeout: number) {
    if (!workers[workerId]) {
      throw new Error("Worker with given id does not exist");
    }
    workers[workerId].push(setTimeout(callback, timeout));
  },
};
