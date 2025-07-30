import { Dropdown } from 'antd';

import MenuItem, { MenuItemProps } from './menuItem';

import styles from './index.less';

export interface MenuProps extends MenuItemProps {
  items: MenuItemProps[];
  inlineCollapsed?: boolean;
}

function Menu(props: MenuProps) {
  const {
    style,
    mode = 'vertical',
    items,
    openKeys,
    selectedKeys,
    onClick,
    onOpenChange,
    inlineCollapsed,
  } = props;

  if (items.length > 6 && mode === 'horizontal') {
    console.warn('顶部菜单请勿超过6个');
  }

  if (mode === 'horizontal') {
    return (
      <div style={style} className={styles[mode]}>
        {
          items.map((item) => {
            const { children = [], hideInMenu } = item;
            if (hideInMenu) {
              return null;
            }

            if (children.length === 0) {
              return (
                <MenuItem
                  mode={mode}
                  openKeys={openKeys}
                  onOpenChange={onOpenChange}
                  selectedKeys={selectedKeys}
                  {...item}
                  onClick={onClick}
                />
              );
            }

            return (
              <Dropdown
                overlay={
                  <Menu
                    style={{
                      background: '#fff',
                      'box-shadow': '0 2px 40px 0 rgba(0, 0, 0, 0.1)',
                    }}
                    items={children}
                    onClick={onClick}
                  />
                }
              >
                <div>
                  <MenuItem
                    mode={mode}
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                    selectedKeys={selectedKeys}
                    onClick={onClick}
                    {...item}
                  />
                </div>
              </Dropdown>
            );
          })
        }
      </div>
    );
  }

  return (
    <div style={style} className={styles[mode]}>
      {
        items.map((item, key) => {
          const { hideInMenu } = item;
          if (hideInMenu) {
            return null;
          }
          return (
            <MenuItem
              showIcon
              inlineCollapsed={inlineCollapsed}
              mode={mode}
              openKeys={openKeys}
              onOpenChange={onOpenChange}
              selectedKeys={selectedKeys}
              {...item}
              key={`${key}`}
              onClick={onClick}
            />
          );
        })
      }
    </div>
  )
}

export default Menu;
