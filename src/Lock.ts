import IWaitClient from "./IWaitClient";

let debug = require('debug')('dwc:Lock')


export interface LockOptions {
  AskForFinishInterval: number
  AskForFinishTimeout: number
}

export default class Lock {

  private client: IWaitClient;
  private readonly options: LockOptions;
  private readonly _key: string;
  private readonly _timeout: number;
  private readonly _id: number;
  private _keyTaken: boolean = false;
  private _locked: boolean = false;
  private _timeOuted: boolean = false;
  private lockWatcher: NodeJS.Timeout | undefined;


  constructor(client: IWaitClient, key: string, timeout: number, options: LockOptions = {
    AskForFinishInterval: 5000,
    AskForFinishTimeout: 90000
  }) {
    this._id = Math.floor(Math.random() * 100000000000);
    this.client = client;
    this._key = key;
    this._timeout = timeout;
    this.options = options;
  }

  public async lock() {
    debug(this._id, 'Trying to lock')
    this._locked = true;

    try {
      await this.client.lock(this);
      await this.setTimeoutCleanup();

      debug(this._id, 'Locked')
    } catch (e) {
      debug(this._id, 'Key is busy, wait for finishing task')
      this._keyTaken = true;

      await this.waitForUnlocking();
      debug(this._id, 'Task finished')
      this._locked = false;
    }
  }

  public async unlock() {
    debug(this._id, 'Unlocking')

    if (this.lockWatcher)
      clearInterval(this.lockWatcher);

    if (this._locked) {
      this._locked = false;
      await this.client.unlock(this);
    }

    debug(this._id, 'Unlocking done')
  }

  public async canLock(): Promise<boolean> {
    return this.client.canLock(this);
  }

  private async setTimeoutCleanup() {
    this.lockWatcher = setTimeout(() => {
      debug(this._id, 'Unlock due to timeout')
      this._timeOuted = true;
      this.unlock()
    }, this._timeout);
  }

  private async waitForUnlocking() {
    return new Promise((resolve, reject) => {
      let started = new Date().getTime();

      let looper = setInterval(async () => {
        debug(this._id, 'Check if locking is done')

        if (await this.canLock()) {
          clearInterval(looper);
          resolve(true);
        } else if (new Date().getTime() - started > this.options.AskForFinishTimeout) {
          clearInterval(looper);
          reject('Wait for unlocking timeout')
        }
      }, this.options.AskForFinishInterval)
    })
  }

  get key(): string {
    return this._key;
  }

  get timeout(): number {
    return this._timeout;
  }

  get locked(): boolean {
    return this._locked;
  }

  get timeOuted(): boolean {
    return this._timeOuted;
  }

  get isPrimary(): boolean {
    return !this._keyTaken;
  }
}
