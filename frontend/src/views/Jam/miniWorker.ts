interface MiniWorkerOptions {
  initial?: boolean;
  id?: string;
}

const ids: Map<string, MiniWorker | null> = new Map();

export class MiniWorker {
  #intervalId: any;
  fn: CallableFunction;
  id?: string;

  constructor(
    intervalSec: number = 60,
    fn: CallableFunction,
    { initial, id }: MiniWorkerOptions = {},
  ) {
    this.fn = fn;
    if (id && ids.has(id)) {
      return ids.get(id) as MiniWorker;
    }

    if (id) {
      this.id = id;
      ids.set(id, this);
    }
    this.#intervalId = setInterval(() => this.#interval(), intervalSec * 1000);
    if (initial) {
      this.fn();
    }
  }

  terminate() {
    console.log('worker terminated');
    if (this.id) {
      ids.set(this.id, null);
    }
    clearInterval(this.#intervalId);
  }

  #interval() {
    console.log('calling worker');
    this.fn();
  }
}
