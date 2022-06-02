import React from "react";
import {render, RenderResult} from "@testing-library/react";

import Menu, {MenuProps} from './menu'
import MenuItem from './menuItem'
// import SubMenu from './subMenu'

const testProps: MenuProps = {
  defaultIndex: 0,
  onSelect: jest.fn(),
  className: 'test-menu',
}

const testVerProps: MenuProps = {
  defaultIndex: 0,
  mode: 'vertical',
  // defaultOpenSubMenus: ['4']
}

const generateMenu = (props: MenuProps) => {
  return (
    <Menu {...props}>
      <MenuItem index={0}>
        active
      </MenuItem>
      <MenuItem index={1} disabled>
        disabled
      </MenuItem>
      <MenuItem index={2}>
        xyz
      </MenuItem>
      {/*<SubMenu title="dropdown">*/}
      {/*  <MenuItem>*/}
      {/*    drop1*/}
      {/*  </MenuItem>*/}
      {/*</SubMenu>*/}
      {/*<SubMenu title="opened">*/}
      {/*  <MenuItem>*/}
      {/*    opened1*/}
      {/*  </MenuItem>*/}
      {/*</SubMenu>*/}
    </Menu>
  )
}

let wrapper: RenderResult, menuElement: HTMLElement, activeElement: HTMLElement, disabledElement: HTMLElement

describe('test Menu and Menu Item', () => {
  beforeEach(() => {
    wrapper = render(generateMenu(testProps))
    menuElement= wrapper.getByTestId('test-menu')
    activeElement = wrapper.getByText('active')
    disabledElement = wrapper.getByText('disabled')
  })
  it('should render correct Menu and Menu Item base on default props', () => {
    expect(menuElement).toBeInTheDocument()
    expect(menuElement).toHaveClass('poloma-menu')
    expect(menuElement.querySelectorAll(':scope > li').length).toEqual(5)
    expect(activeElement).toHaveClass('menu-item is-active')
    expect(disabledElement).toHaveClass('menu-item is-disabled')
  })

  it('click item should change active and call the right callback', () => {

  })
})
