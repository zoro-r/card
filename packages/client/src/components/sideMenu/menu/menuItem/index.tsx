import { useRef } from 'react';
import { MenuDataItem } from '@ant-design/pro-layout';
import * as AntdIcons from '@ant-design/icons';
import { PieChartOutlined } from '@ant-design/icons';

import { Menu, Tooltip, Popover } from 'antd';

import classNames from 'classnames';

import If from '@/components/If';

import styles from './index.less';

interface MenuIconProps {
  className?: string;
  icon?: string;
  style?: React.CSSProperties;
}

function MenuIcon(props: MenuIconProps) {
  const { className, style, icon } = props;
  
  // 根据icon字符串获取对应的图标组件
  let IconComponent: any = PieChartOutlined; // 默认图标
  
  if (icon && AntdIcons[icon as keyof typeof AntdIcons]) {
    IconComponent = AntdIcons[icon as keyof typeof AntdIcons] as React.ComponentType<any>;
  }
  
  return (
    <div className={className}>
      <div style={style} className={styles['item']}>
        <div className={styles['icon']} >
          <IconComponent />
        </div>
      </div>
    </div>
  );
}

export interface MenuItemProps extends MenuDataItem {
  showIcon?: boolean;
  icon?: string;
  children?: MenuItemProps[];
  onSelect?: (item: Omit<MenuDataItem, 'children' | 'icon' | 'style'>) => void;
  onClick?: (item: Omit<MenuDataItem, 'children' | 'icon' | 'style'>) => void;
  onOpenChange?: (item: Omit<MenuDataItem, 'children' | 'icon' | 'style'>) => void;
}

/**
 * 缩略起来的数据
 */
function InlineMenu(props: MenuItemProps) {
  const {
    onClick,
    path,
    label,
    icon,
    children = [],
    style,
    className,
  } = props;

  const hasChildren = Array.isArray(children) && children.length > 0 && children.some((item) => !item.hideInMenu);

  // 如果子项 则进行右侧的展示处理
  if (hasChildren) {
    return (
      <Popover
        placement="rightTop"
        classNames={{
          root: styles.popover,
        }}
        style={{
          padding: '0'
        }}
        styles={{
          body: {
            padding: 0,
          }
        }}
        content={
          <Menu
            onClick={(e) => {
              const { key } = e;
              // 通过key进行匹配内容
              const selectItem = children.find((child) => child.key === key || child.path === key);
              onClick && selectItem && onClick(selectItem);
            }}
            items={children.map(item => {
              return {
                label: item.label || item.name,
                key: `${item.key || item.path}`,
              };
            })}
          />
        }
      >
        <div>
          <MenuIcon className={className} style={style} icon={icon} />
        </div>
      </Popover>
    )
  }

  return (
    <Tooltip
      color="#fff"
      placement="right"
      title={label}
      overlayClassName={style.tooltip}
      overlayInnerStyle={{
        color: '#000',
      }}
    >
      <div
        title={label}
        onClick={() => {
          onClick && onClick({
            path,
            label,
          });
        }}
      >
        <MenuIcon className={className} style={style} icon={icon} />
      </div>
    </Tooltip>
  );
}

function MenuItem(props: MenuItemProps) {
  const {
    onOpenChange,
    onClick,
    selectedKeys = [],
    path = '',
    name,
    icon,
    children = [],
    openKeys = [],
    style,
    mode,
    inlineCollapsed = false,
    showIcon,
    ...rest
  } = props;

  // 是否为父节点
  const isNode = children.length > 0 && children.some((item) => !item.hideInMenu);
  const menuItemRef = useRef<HTMLDivElement>(null);

  // 是否打开菜单页面
  const openChildren = openKeys.includes(path);
  const selected = selectedKeys.some((itemPath: string) => {
    if(!path || !itemPath) return false
    return itemPath.split('?')[0] === path.split('?')[0];
  });

  const cls = classNames({
    [`${styles['menu-item']}`]: true,
    [`${styles['open']}`]: openChildren,
    [`${styles['selected']}`]: selected,
  });

  if (inlineCollapsed) {
    return (
      <div className={classNames(styles['menu-item-box'], styles[mode])}>
        <InlineMenu style={{ fontSize: 18 }} {...props} className={cls} />
      </div>
    );
  }

  return (
    <div className={classNames(styles['menu-item-box'], styles[mode])}>
      <div
        ref={menuItemRef}
        className={cls}
        onClick={() => {
          if (!isNode) {
            onClick?.({
              ...rest,
              name,
              path,
            });
          } else {
            onOpenChange?.({
              ...rest,
              name,
              path,
            });
          }
        }}
      >
        <div style={style} className={styles['item']}>
          <If show={showIcon}>
            <MenuIcon className={styles['icon']} icon={icon} />
          </If>
          <div className={styles['text']}>{name}</div>
        </div>
        <If show={isNode}>
          <i
            className={classNames(styles['down-up-icon'], {
              [`${styles['up']}`]: openChildren && mode === 'vertical',
            })}
          />
        </If>
      </div>
      <If show={mode === 'vertical' && children.length > 0}>
        <div
          className={classNames(styles['children'], {
            [`${styles['open']}`]: openChildren,
          })}
        >
          {children.map((child, index) => {
            const { hideInMenu } = child;
            if (hideInMenu) {
              return null;
            }
            return (
              <MenuItem
                showIcon={false}
                inlineCollapsed={inlineCollapsed}
                mode={mode}
                openKeys={openKeys}
                onOpenChange={onOpenChange}
                selectedKeys={selectedKeys}
                {...child}
                key={`${index}`}
                onClick={onClick}
                style={{ paddingLeft: '28px' }} // 32px 原始padding + 28px 图标宽度
              />
            );
          })}
        </div>
      </If>
    </div>
  );
}

export default MenuItem;
