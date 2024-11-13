// import React from 'react';
// import ReactDom from 'react-dom';

// 真正实现是通过单向链表来 实现 useState 的


function Counter() {
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

let stateArray: any[] = [];
let cursor = 0;

function useState<T>(initialState: T): [T, (newState: T) => void] {
    const currentCursor = cursor
    stateArray[currentCursor] = stateArray[currentCursor] || initialState;

    function setState(newState: T) {
        stateArray[currentCursor] = newState;
        // render(); 渲染
    }

    // 索引更新
    ++cursor;

    return [state, setState]
}

function render() {
    // render DOM
    // ReactDOM.render()


    cursor = 0;
}
