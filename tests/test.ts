import DistributedWait from "../src/DistributedWait";
import RedisWaitClient from "../src/clients/RedisWaitClient";
import Redlock from "redlock";
import RedisClient from 'ioredis';

const redis = new RedisClient({host: "localhost"});

const redisClient = new RedisWaitClient(new Redlock([redis]));

const DWait1 = new DistributedWait(redisClient);

// const DWait2 = new DistributedWait(fileClient);

async function wait() {

  await DWait1.waitFor('download2', 55000, async () => {
    return new Promise(resolve => {
      console.log('Starting task')
      setTimeout(resolve, 50000)

    })
  })

  console.log('Done')
  redis.disconnect()

  // setTimeout(() => {
  //   console.log('Should be unlocked')
  //     lock.unlock()
  // }, 15000)

  // setTimeout(() => {
  //   lock.unlock()
  //   console.log("Unlocked")
  // }, 60000)
}

console.log("Starting")
wait();
// DWait2.acquire("key2", 1000)
