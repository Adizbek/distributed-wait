import IWaitClient from "../src/IWaitClient";
import Lock from "../src/Lock";

export class FakeWaitClient implements IWaitClient {
  locks = new Map<string, Lock>();

  async canLock(lock: Lock): Promise<boolean> {
    return !this.locks.has(lock.key);
  }

  async lock(lock: Lock): Promise<Lock> {
    if (this.locks.has(lock.key)) {
      throw new Error("Lock already exists on this key")
    }

    this.locks.set(lock.key, lock)

    return lock;
  }

  async unlock(lock: Lock): Promise<void> {
    this.locks.delete(lock.key)
  }
}
