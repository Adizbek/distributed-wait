import IWaitClient from "./IWaitClient";
import Lock from "./Lock";

export default class DistributedWait {
  private readonly client: IWaitClient;

  constructor(client: IWaitClient) {
    this.client = client;
  }

  async waitFor(key: string, timeout: number, handler: Function) {
    let lock = await this.acquire(key, timeout)

    if (lock.isPrimary) {
      await handler();
    }

    await this.release(lock);
  }

  async acquire(key: string, timeout: number): Promise<Lock> {
    const lock = new Lock(this.client, key, timeout)

    await lock.lock();

    return lock;
  }

  async release(lock: Lock): Promise<void> {
    await lock.unlock();
  }
}
