export class Semaphore {
  private readonly max: number;
  private current = 0;
  private readonly queue: Array<() => void> = [];

  constructor(max: number) {
    if (!Number.isInteger(max) || max <= 0) {
      throw new Error(`Invalid semaphore size: ${max}`);
    }
    this.max = max;
  }

  async acquire() {
    if (this.current < this.max) {
      this.current += 1;
      return () => this.release();
    }

    return new Promise<() => void>((resolve) => {
      this.queue.push(() => {
        this.current += 1;
        resolve(() => this.release());
      });
    });
  }

  private release() {
    this.current -= 1;
    if (this.current < 0) {
      this.current = 0;
    }
    const next = this.queue.shift();
    if (next) next();
  }
}
