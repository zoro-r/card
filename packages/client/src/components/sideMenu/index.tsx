import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import classNames from 'classnames';
import { useNavigate, useLocation } from '@umijs/max';
import { useLocalStorageState } from 'ahooks';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import If from '@/components/If';
import Menu, { MenuProps } from './menu';
import { useLayoutStore } from '@/stores/layoutStore';

import styles from './index.less';

const OPEN_KEYS = 'menu-open-keys';

interface SideMenuProps extends Partial<Pick<MenuProps, 'mode' | 'items' | 'inlineCollapsed'>> {
  className?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  style?: CSSProperties;
  onCollapse?: () => void;
}

function SideMenu(props: SideMenuProps) {
  const {
    className,
    mode = 'vertical',
    inlineCollapsed = false,
    items = [],
    style,
    theme = 'light',
    onCollapse,
  } = props;

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isMobile } = useLayoutStore();

  // openKeys
  const [openKeys = [], setOpenKeys] = useLocalStorageState<string[]>(OPEN_KEYS, {
    defaultValue: [],
  });

  let selectedKeys = [pathname];

  // 构建菜单树
  const menuTree = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    // 如果items已经是树形结构，直接返回
    if (items.some(item => item.children)) {
      return items;
    }

    // 如果是扁平结构，构建树形结构
    const menuMap: Record<string, any> = {};
    const tree: any[] = [];
    
    items.forEach(menu => {
      menuMap[menu.uuid] = { 
        ...menu, 
        key: menu.path || menu.uuid, 
        label: menu.name,
        name: menu.name,
        icon: menu.icon,
        children: [] 
      };
    });

    items.forEach(menu => {
      if (menu.parentId && menuMap[menu.parentId]) {
        menuMap[menu.parentId].children.push(menuMap[menu.uuid]);
      } else {
        tree.push(menuMap[menu.uuid]);
      }
    });

    return tree;
  }, [items]);

  const handleMenuClick = (menuItem: any) => {
    const { path } = menuItem;
    if (path) {
      navigate(path);
    }
  };

  const handleOpenChange = (item: any) => {
    const { path } = item;
    if (!openKeys.includes(path)) {
      setOpenKeys([...openKeys, path]);
    } else {
      setOpenKeys(openKeys.filter(p => p !== path));
    }
  };

  return (
    <aside
      style={style}
      className={classNames(className, styles['layout-menu'], styles[mode], {
        [styles.collapsed]: inlineCollapsed,
        [styles.dark]: theme === 'dark',
      })}
    >
      {/* Logo区域 */}
      {/* <div className={styles.logo}>
        <div className={styles['logo-content']}>
          {!inlineCollapsed && (
            <span className={styles['logo-text']}>管理后台</span>
          )}
        </div>
      </div> */}

      {/* 菜单区域 */}
      <div className={styles.menu}>
        <Menu
          inlineCollapsed={inlineCollapsed}
          mode={mode}
          selectedKeys={selectedKeys}
          openKeys={inlineCollapsed ? [] : openKeys}
          onOpenChange={handleOpenChange}
          style={{ width: '100%' }}
          items={menuTree}
          onClick={handleMenuClick}
          theme={theme}
        />
      </div>

      {/* 折叠按钮 */}
      {/* <If show={mode === 'vertical' && !isMobile}>
        <div className={styles.trigger} onClick={onCollapse}>
          {inlineCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </If> */}
    </aside>
  );
}

export default SideMenu;
