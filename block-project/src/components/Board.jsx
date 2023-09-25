import React, { useState, useEffect } from 'react';
import Block from './Block';

const ROWS = 20;
const COLUMNS = 10;
const EMPTY_BLOCK = 'white';

const Board = () => {
  const [board, setBoard] = useState(Array(ROWS).fill(Array(COLUMNS).fill(EMPTY_BLOCK)));
  const [currentTetromino, setCurrentTetromino] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 });

  // 处理键盘事件
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        // 左移
        moveLeft();
      } else if (event.key === 'ArrowRight') {
        // 右移
        moveRight();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // 仅在组件挂载时添加和移除事件监听器

  // 左移方块
  const moveLeft = () => {
    // 检查是否可以左移
    if (!canMove('left')) return;

    // 更新当前位置
    setCurrentPosition({ ...currentPosition, col: currentPosition.col - 1 });
  };

  // 右移方块
  const moveRight = () => {
    // 检查是否可以右移
    if (!canMove('right')) return;

    // 更新当前位置
    setCurrentPosition({ ...currentPosition, col: currentPosition.col + 1 });
  };

  // 检查是否可以移动
  const canMove = (direction) => {
    // 根据方向计算新的位置
    const newCol = direction === 'left' ? currentPosition.col - 1 : currentPosition.col + 1;

    // 检查是否越界
    if (newCol < 0 || newCol + currentTetromino[0].length > COLUMNS) {
      return false;
    }

    // TODO: 添加碰撞检测逻辑，检查是否与其他方块碰撞

    return true;
  };

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} style={{ display: 'flex' }}>
        {row.map((color, colIndex) => (
          <Block key={colIndex} color={color} />
        ))}
      </div>
    ));
  };

  return (
    <div>
      <div>俄罗斯方块游戏</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{renderBoard()}</div>
    </div>
  );
};

export default Board;
