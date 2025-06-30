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

## 使用 Qiankun 的微前端应用实例

### 应用场景

假设你有一个大型企业门户网站，需要集成多个业务系统（如用户管理、订单管理、报表分析等），这些系统由不同团队独立开发、部署和维护。传统的单体前端架构难以满足团队协作和独立发布的需求，此时微前端架构可以很好地解决这些问题。

### 实例说明

#### 1. 主应用（Portal）

主应用负责整体布局、导航栏、统一认证和子应用的加载。它通过 `qiankun` 注册和管理多个子应用。

**主应用核心代码：**

```javascript
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'user-app',
    entry: '//localhost:7101',
    container: '#subapp-viewport',
    activeRule: '/user',
  },
  {
    name: 'order-app',
    entry: '//localhost:7102',
    container: '#subapp-viewport',
    activeRule: '/order',
  },
]);

start();
```

**主应用 HTML：**

```html
<div id="navbar">
  <a href="/user">用户管理</a>
  <a href="/order">订单管理</a>
</div>
<div id="subapp-viewport"></div>
```

#### 2. 子应用（如用户管理）

每个子应用是一个独立的前端项目，可以使用不同的技术栈（如 React、Vue、Angular），只需暴露生命周期函数（bootstrap、mount、unmount）即可被主应用加载。

**子应用导出生命周期：**

```javascript
export async function bootstrap() {
  // 初始化逻辑
}
export async function mount(props) {
  // 渲染子应用
}
export async function unmount() {
  // 卸载子应用
}
```

#### 3. 通信机制

主应用和子应用之间可以通过 qiankun 的全局状态管理或自定义事件进行通信。例如，主应用可以向子应用传递用户信息，子应用可以通知主应用某些操作完成。

**示例：**

```javascript
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({ user: 'admin' });

actions.onGlobalStateChange((state, prev) => {
  // 监听全局状态变化
});
```

### 原理解析

- **沙箱隔离**：qiankun 利用 JS 沙箱和样式隔离机制，保证各子应用之间互不影响。
- **路由劫持**：主应用通过监听路由变化，决定何时加载/卸载对应的子应用。
- **生命周期管理**：每个子应用需实现 bootstrap、mount、unmount 等生命周期函数，主应用根据路由动态调用这些函数，实现子应用的动态挂载与卸载。
- **独立部署**：每个子应用可独立开发、测试和部署，主应用只需配置入口地址即可集成。

### 适用场景

- 多团队协作开发大型前端项目
- 需要渐进式重构老系统
- 不同业务线需要独立发布和部署
- 希望复用已有项目或技术栈

通过 qiankun 实现微前端，可以极大提升前端项目的可维护性、可扩展性和团队协作效率。

