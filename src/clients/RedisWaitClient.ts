import IWaitClient from "../IWaitClient";
import Redlock from "redlock";
import Lock from "../Lock";

let debug = require('debug')('dwc:RedisWaitClient')

export default class RedisWaitClient implements IWaitClient {
  private redlock: Redlock;

  private lockedKeys = new Map<Lock, Redlock.Lock>();

  constructor(redlock: Redlock) {
    this.redlock = redlock;
  }

  async lock(lock: Lock): Promise<Lock> {
    debug('Acquiring lock')
    const redlockLock = await this.redlock.acquire([lock.key], lock.timeout);
    this.lockedKeys.set(lock, redlockLock);

    debug('Lock acquired')
    return lock;
  }

  async unlock(lock: Lock): Promise<void> {
    debug('Unlocking')

    let redlockLock = this.lockedKeys.get(lock);

    if (redlockLock) {
      try {
        await redlockLock.unlock()
      } catch (e) {
      }
    }

    debug('Unlocking done')
  }

  async canLock(lock: Lock): Promise<boolean> {
    debug('Check if can lock')

    try {
      let locked = await this.redlock.lock(lock.key, 100);
      return locked.expiration > new Date().getTime();
    } catch (e) {
      return false;
    }
  }

}
