# Distributed wait

### Supported clients
- Redis via redlock


### Why do we need distributed wait ?
Situation:
Assume that we have N (in our case 4) containers with shared volume. To perform X task we need Y file.
If task producer produces N number of X tasks simultaneously. All worker get X task and to complete it they need Y file, but if all workers download Y file, it will be wasteful and not efficient. 

Solution: Only one worker should download Y file at the same time and other worker should wait for it. To perform this we create **distributed wait** and lock downloading Y file for other workers.
                                    
![Diagram](https://raw.githubusercontent.com/Adizbek/distributed-wait/main/docs/DistributedWaitDiagram.png)

### Example
```js
// create redis client
const redis = new RedisClient({host: "localhost"});

// create wait client
const redisClient = new RedisWaitClient(new Redlock([redis]));

// Create wait manager
const waitManager = new DistributedWait(redisClient);

const task = async () => {
  await waitManager.waitFor('downloadY', 60000, async () => {
    // only the worker which got the task first downloads file. Other workers just wait and skip downloading phase

    // downloading logic here
  })

  //   
  // complete X task
}

task();
```
