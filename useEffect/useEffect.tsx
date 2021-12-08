// import { useState } React from 'react';
// import ReactDom from 'react-dom';

// 真正实现是通过单向链表来 实现 useState 的

function Counter() {
    let effectCursor = 0; // 清空 回滚到第一位
    const [count, setCount] = useState(0);

    const onClick = () => {
        setCount(count + 1)
    }

    return (
        <div>
            <div>{count}</div>
            <button onclick={onClick}>点击</button>
        </div>
    )
}

const allDeps: Array<any[] | undefined> = [];
let effectCursor: number = 0;

function useEffect(callback: () => void, depArray?: any[]) {
    if (!depArray) {
        callback()
        allDeps[effectCursor] = depArray;
        effectCursor++;
        return
    }

    // [1, 2, 3] 旧的 state 数组
    const deps = allDeps[effectCursor];

    // [1, 2, 4]
    const hasChanged = deps ? depArray.some((el, i) => el !== deps[i]) : true;

    if (hasChanged) {
        callback();
        allDeps[effectCursor] = depArray;
    }

    // effect 下标++
    effectCursor++;
}

function render() {
    // render DOM
    // ReactDOM.render()


    // cursor = 0;
}
