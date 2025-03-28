# React 18 新特性

## 状态管理

- 状态机
    - 无数据
    - 输入中
    - 提交中
    - 成功时
    - 失败时

- 触发状态更新

- 人为
- 计算机输入

empty -> start typing -> press submit -> submitting -> success/fail

## state 构建原则

1. 合并关联 state

```js
const [x, setX] = useState(0)
const [y, setY] = useState(0)

const [position, setPosition] = useState({x: 0, y: 0}); // 定义变量更加语意化
```

2. 避免互相矛盾的 state

```js

```