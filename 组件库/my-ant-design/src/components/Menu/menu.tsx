import React, { useState, createContext } from 'react';
import classNames from 'classnames';
import {MenuItemProps} from "./menuItem";

type MenuMode = 'horizontal' | 'vertical';
type SelectCallback = (selectIndex?: string) => void;

export interface MenuProps {
  defaultIndex?: string;
  className?: string;
  mode?: MenuMode;
  style?: React.CSSProperties;
  onSelect?: SelectCallback;
  id?: string;
  disabled?: boolean;
  defaultOpenSubMenus?: string[];
}

interface IMenuContext {
  index: string;
  onSelect?: (index?: string) => void;
  mode?: MenuMode;
  defaultOpenSubMenus?: string[];
}

export const MenuContext = createContext<IMenuContext>({index: '0'});


const Menu: React.FC<MenuProps> = (props) => {
  const { className, mode, style, children, defaultIndex, onSelect, disabled, defaultOpenSubMenus } = props;
  const [ currentActive, setActive ] = useState(defaultIndex);
  const classes = classNames('poloma-menu', className, {
    'menu-vertical': mode === 'vertical',
    'menu-horizontal': mode !== 'vertical'
  })

  const handleClick = (index?: string) => {
    setActive(index);
    if (onSelect && index && !disabled) {
      onSelect(index);
    }
  }
  const passedContext: IMenuContext = {
    index: currentActive ? currentActive : '0',
    onSelect: handleClick,
    mode,
    defaultOpenSubMenus
  }

  const renderChildren = () => {
    return React.Children.map(children, ((child, index) => {
      const childElement = child as React.FunctionComponentElement<MenuItemProps>
      const { name } = childElement.type
      if (name === 'MenuItem' || name === 'SubMenu') {
        return React.cloneElement(childElement, {
          index: index.toString()
        })
      } else {
        console.error('warning Menu has a child which is not MenuItem Component')
      }
    }))
  }

  return (
    <ul className={classes} style={style}>
      <MenuContext.Provider value={passedContext}>
        {renderChildren()}
      </MenuContext.Provider>
    </ul>
  )
}

Menu.defaultProps = {
  defaultIndex: '0',
  mode: 'horizontal',
  defaultOpenSubMenus: []
}

export default Menu;
