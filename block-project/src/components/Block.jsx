import React from 'react';

const Block = ({ color }) => {
  const style = {
    backgroundColor: color,
    border: '1px solid #333',
    width: '30px',
    height: '30px',
  };

  return <div style={style}></div>;
};

export default Block;
