import React, {useState} from 'react';
import './App.css';
// import Hello from "./components/Hello";
import useMousePosition from "./hooks/useMousePosition";
import useURLLoader from "./hooks/useURLLoader";
import Button, {ButtonSize, ButtonType} from "./components/Button/button";
import Menu from "./components/Menu/menu";
import MenuItem from "./components/Menu/menuItem";


const App: React.FC = () => {
  // const position = useMousePosition();
  // const [data, loading] = useURLLoader('https://dog.ceo/api/breeds/image/random', []);

  // const dogResult = data as IShowResult;

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    console.log(e);
  }

  return (
    <div className="App">
      <Menu defaultIndex={0} onSelect={(value) => alert(value)}>
        <MenuItem index={0}>
          cool link
        </MenuItem>
        <MenuItem index={1} disabled={true}>
          cool link 2
        </MenuItem>
        <MenuItem index={2}>
          cool link 3
        </MenuItem>
      </Menu>
      <Button className={'custom'} onClick={(e) => handleClick(e)} size={ButtonSize.Small} btnType={ButtonType.Primary}>点击</Button>
      <Button btnType={ButtonType.Danger}>点击</Button>
      <Button>点击</Button>
      <Button size={ButtonSize.Large} btnType={ButtonType.Link} disabled={true} href={'https://baidu.com'}>跳转到百度</Button>
    </div>
  );
}

export default App;
