import React from 'react';
import ReactDOM from 'react-dom/client';
import { makeObservable, observable, action } from 'mobx';
import { observer } from 'mobx-react';

// 定义一个 MobX 存储类
class CounterStore {
  // 定义可观察状态
  count = 0;

  constructor() {
    // 使状态可观察，并定义动作
    makeObservable(this, {
      count: observable,
      increment: action,
      decrement: action
    });
  }

  // 定义增加计数器的动作
  increment = () => {
    this.count++;
  };

  // 定义减少计数器的动作
  decrement = () => {
    this.count--;
  };
}

// 创建存储实例
const counterStore = new CounterStore();

// 创建一个观察者组件
const Counter = observer(() => {
  return (
    <div>
      <h1>计数器: {counterStore.count}</h1>
      <button onClick={counterStore.increment}>增加</button>
      <button onClick={counterStore.decrement}>减少</button>
    </div>
  );
});

// 渲染组件到 DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
