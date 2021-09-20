import Lock from "./Lock";

export default interface IWaitClient {

  lock(lock: Lock): Promise<Lock>;

  canLock(lock: Lock): Promise<boolean>;

  unlock(lock: Lock): Promise<void>;
}
