### 控制请求并发的数量，例如有8个请求需要发送，如何控制同时只能并行发送2个？

以下是几种 JavaScript 实现控制并发请求数量的方法：

### 方法一：使用 Promise 和队列管理
通过维护一个任务队列，每次只执行指定数量的任务，完成后自动从队列中取出下一个任务执行。

```js
class ConcurrencyControl {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    addTask(task) {
        return new Promise((resolve, reject) => {
            const wrappedTask = () => {
                this.running++;
                task()
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                        this.running--;
                        this._runNext();
                    });
            };

            if (this.running < this.concurrency) {
                wrappedTask();
            } else {
                this.queue.push(wrappedTask);
            }
        });
    }

    _runNext() {
        if (this.queue.length > 0 && this.running < this.concurrency) {
            const nextTask = this.queue.shift();
            nextTask();
        }
    }
}

// 使用示例
const urls = Array.from({ length: 8 }, (_, i) => `https://api.example.com/data/${i + 1}`);
const controller = new ConcurrencyControl(2);

urls.forEach(url => {
    controller.addTask(() => {
        console.log(`开始请求: ${url}`);
        return fetch(url)
            .then(res => res.text())
            .then(data => {
                console.log(`完成请求: ${url}`);
                return data;
            });
    });
});
```


### 方法二：使用 async/await 和 Promise.all
通过创建固定数量的执行线程，每个线程持续从任务数组中取出任务执行。

```js
async function controlConcurrency(tasks, concurrency) {
    const results = Array(tasks.length).fill(null);
    let currentIndex = 0;

    const workers = Array(concurrency).fill().map(async () => {
        while (currentIndex < tasks.length) {
            const index = currentIndex++;
            const task = tasks[index];
            try {
                results[index] = await task();
            } catch (error) {
                results[index] = error;
            }
        }
    });

    await Promise.all(workers);
    return results;
}

// 使用示例
const fetchData = (id) => {
    console.log(`开始请求: ${id}`);
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`完成请求: ${id}`);
            resolve(`Data ${id}`);
        }, Math.random() * 1000);
    });
};

const tasks = Array.from({ length: 8 }, (_, i) => () => fetchData(i + 1));

controlConcurrency(tasks, 2).then(results => {
    console.log('所有请求完成:', results);
}); 
```


### 方法三：使用第三方库 p-limit
`p-limit` 是一个轻量级的库，专门用于控制 Promise 的并发数量。

```js
const pLimit = require('p-limit');

const limit = pLimit(2);
const urls = Array.from({ length: 8 }, (_, i) => `https://api.example.com/data/${i + 1}`);

const tasks = urls.map(url => {
    return limit(() => {
        console.log(`开始请求: ${url}`);
        return fetch(url)
            .then(res => res.text())
            .then(data => {
                console.log(`完成请求: ${url}`);
                return data;
            });
    });
});

Promise.all(tasks).then(results => {
    console.log('所有请求完成:', results);
});
```


### 核心思路
1. **队列管理**：将所有任务放入队列，每次只执行指定数量的任务，一个任务完成后再从队列中取出下一个。
2. **固定线程**：创建固定数量的执行线程，每个线程持续从任务数组中获取任务执行，直到所有任务完成。
3. **状态跟踪**：记录当前正在执行的任务数量，确保不超过设定的并发限制。

以上实现都能确保最多只有 2 个请求同时执行，适合用于控制数据库写入、API 请求等需要限制并发的场景。
