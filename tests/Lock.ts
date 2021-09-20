import sinon from "sinon";
import Lock, {LockOptions} from '../src/Lock'
import {FakeWaitClient} from "./FakeWaitClient";

require('chai').should()

function createLock(client: FakeWaitClient, options: LockOptions | {}= {}): Lock {
  let localOptions = Object.assign({
    AskForFinishInterval: 1,
    AskForFinishTimeout: 20000,
  }, options)

  return new Lock(client, 'key1', 20000, localOptions)
}

describe('Test Lock.ts', function () {
  it('should lock successfully', async function () {
    let client = new FakeWaitClient();
    let spy = sinon.spy(client);

    let lock = createLock(client);

    await lock.lock();

    lock.locked.should.be.true
    lock.isPrimary.should.be.true
    lock.timeOuted.should.be.false
    lock.key.should.be.eq('key1')
    lock.timeout.should.be.eq(20000)

    spy.lock.called.should.be.true

    await lock.unlock();
  });

  it('should wait for lock if lock already acquired', function (done) {
    let timer = sinon.useFakeTimers(new Date().getTime())

    let client = new FakeWaitClient();
    let spy = sinon.spy(client);


    let lock1 = createLock(client);
    let lock2 = createLock(client);

    lock1.lock().then(() => {
      lock2.lock().then(() => {
        lock1.isPrimary.should.be.true
        lock2.isPrimary.should.be.false

        lock1.locked.should.be.false
        lock2.locked.should.be.false

        spy.lock.called.should.be.true

        done();
      });


      // perform task
      setTimeout(() => {
        timer.restore()

        lock1.unlock();
        // task here
      }, 6000)

      timer.tick(10000)
    })
  });


  it('should timeout after time reach it\'s duration', function (done) {
    let timer = sinon.useFakeTimers(new Date().getTime())

    let client = new FakeWaitClient();
    let lock = createLock(client);

    lock.lock().then(() => {
      timer.tick(30000)

      lock.timeOuted.should.be.true

      timer.restore();

      done();
    })
  });

  it('should throw error after wait timeout is reached', function (done) {
    let client = new FakeWaitClient();
    let lock = createLock(client);
    let lock2 = createLock(client, {
      AskForFinishTimeout: 1
    });

    lock.lock().then(() => {
      lock2.lock().catch((err) => {
        done();
      })
    })
  });
});
