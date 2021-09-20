import DistributedWait from "../src";
import {FakeWaitClient} from "./FakeWaitClient";
import sinon, {spy} from "sinon";

require('chai').should()

describe('Test DistributedWait.ts', function () {
  it('should acquire lock', async function () {
    let client = new FakeWaitClient();
    let spyClient = sinon.spy(client)

    let dw = new DistributedWait(client);

    let lock = await dw.acquire('key1', 10000)

    spyClient.lock.calledOnce.should.be.true

    await dw.release(lock)

    spyClient.unlock.calledOnce.should.be.true
  });

  it('should wait for lock', async function () {
    let client = new FakeWaitClient();

    let spyClient = sinon.spy(client)

    let dw = new DistributedWait(client);

    let handler = async () => {
      console.log('Task is done')
      // Some stuff;
    }

    let spyHandler = spy(handler);

    let lock = await dw.waitFor('key1', 10000, spyHandler)

    spyClient.lock.calledOnce.should.be.true
    spyHandler.called.should.be.true
    spyClient.unlock.calledOnce.should.be.true

  });
});
