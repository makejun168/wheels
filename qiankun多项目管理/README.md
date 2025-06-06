# Qiankun 多项目管理 Demo

## 简介
Qiankun 是一个基于 [single-spa](https://single-spa.js.org/) 的微前端框架，支持多个子项目的集成与管理。本示例展示如何使用 Qiankun 管理多个子项目。

## 快速开始

### 主应用配置

1. 安装依赖：
    ```bash
    npm install qiankun
    ```

2. 主应用代码示例：
    ```javascript
    import { registerMicroApps, start } from 'qiankun';

    // 注册子应用
    registerMicroApps([
      {
         name: 'app1', // 子应用名称
         entry: '//localhost:8081', // 子应用入口
         container: '#subapp-container', // 子应用挂载容器
         activeRule: '/app1', // 激活规则
      },
      {
         name: 'app2',
         entry: '//localhost:8082',
         container: '#subapp-container',
         activeRule: '/app2',
      },
    ]);

    // 启动 qiankun
    start();
    ```

3. 主应用 HTML 示例：
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Qiankun 主应用</title>
    </head>
    <body>
      <div id="subapp-container"></div>
      <script src="./main.js"></script>
    </body>
    </html>
    ```

### 子应用配置

1. 安装依赖：
    ```bash
    npm install single-spa
    ```

2. 子应用代码示例：
    ```javascript
    import './set-public-path';
    import { registerApplication, start } from 'single-spa';

    // 注册子应用
    registerApplication({
      name: 'app1',
      app: () => System.import('app1'),
      activeWhen: '/app1',
    });

    start();
    ```

3. 子应用需要导出生命周期函数：
    ```javascript
    export async function bootstrap() {
      console.log('子应用启动');
    }

    export async function mount() {
      console.log('子应用挂载');
    }

    export async function unmount() {
      console.log('子应用卸载');
    }
    ```

## 运行项目

1. 启动主应用：
    ```bash
    npm start
    ```

2. 启动子应用：
    ```bash
    npm start
    ```

3. 访问主应用地址，例如 `http://localhost:8080`，切换路由即可加载对应的子应用。

## 参考文档
- [Qiankun 官方文档](https://qiankun.umijs.org/zh)

## 项目结构示例

```
qiankun-demo/
├── main-app/         # 主应用
│   ├── src/
│   └── package.json
├── sub-app1/         # 子应用1
│   ├── src/
│   └── package.json
├── sub-app2/         # 子应用2
│   ├── src/
│   └── package.json
└── README.md
```

每个子应用和主应用都可以独立开发、运行和部署。

## 常见问题

- **端口冲突**：确保主应用和各子应用运行在不同端口。
- **资源隔离**：建议子应用使用独立的作用域和样式前缀，避免样式冲突。
- **通信机制**：可通过 `qiankun` 的全局状态或自定义事件实现主子应用间通信。

## License

MIT