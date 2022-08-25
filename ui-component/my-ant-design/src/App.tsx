import React, {ReactNode, useState} from 'react';
import './App.css';
// import Hello from "./components/Hello";
import useMousePosition from "./hooks/useMousePosition";
import useURLLoader from "./hooks/useURLLoader";
import Button, {ButtonSize, ButtonType} from "./components/Button/button";
import Menu from "./components/Menu/menu";
import MenuItem from "./components/Menu/menuItem";
import SubMenu from "./components/Menu/subMenu";
import Transition from "./components/Transition";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
// @ts-ignore
library.add(fas)

const App: React.FC = () => {
  const [show, setShow] = useState(false);
  // const position = useMousePosition();
  // const [data, loading] = useURLLoader('https://dog.ceo/api/breeds/image/random', []);

  // const dogResult = data as IShowResult;

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    console.log(e);
  }

  return (
    <div className="App">
      {/*<FontAwesomeIcon icon={faCoffee} />*/}
      <Button size={'lg'} onClick={() => setShow(!show)}>
        Toggle
      </Button>
      <Transition in={show} timeout={300} animation={'zoom-in-left'} >
        <div>
          <p>123123</p>
          <Button size={'lg'} onClick={() => setShow(!show)}>
            Toggle
          </Button>
        </div>
      </Transition>
      <Menu defaultOpenSubMenus={['2']} mode={'horizontal'} defaultIndex={'0'}>
        <MenuItem>
          cool link
        </MenuItem>
        <MenuItem disabled={true}>
          cool link 2
        </MenuItem>
        <SubMenu title={'dropdown'}>
          <MenuItem>dropdown1</MenuItem>
          <MenuItem>dropdown2</MenuItem>
        </SubMenu>
        <MenuItem>
          cool link 3
        </MenuItem>
      </Menu>
    </div>
  );
}

export default App;
