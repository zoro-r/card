import React from 'react';
import type { ReactNode, CSSProperties } from 'react';
import classNames from 'classnames';
import { Avatar, Dropdown, Space, Button, message } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined, 
  BellOutlined,
  QuestionCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import useUser from '@/hooks/useUser';
import { useLayoutStore } from '@/stores/layoutStore';
import styles from './index.less';

interface HeaderProps {
  className?: string;
  content?: ReactNode;
  style?: CSSProperties;
}

// Logo组件
export function Logo(props: { open?: boolean; }) {
  const { open = true } = props;
  const { theme, primaryColor } = useLayoutStore();

  if (!open) {
    return (
      <div className={classNames(styles.left, { [styles.dark]: theme === 'dark' })}>
        <AppstoreOutlined 
          className={styles.icon} 
          style={{ color: primaryColor }}
        />
      </div>
    );
  }

  return (
    <div className={classNames(styles.left, { [styles.dark]: theme === 'dark' })}>
      <AppstoreOutlined 
        className={styles.icon} 
        style={{ color: primaryColor }}
      />
      <span className={styles.title}>智慧名片系统</span>
    </div>
  );
}

// 用户下拉菜单
function UserDropdown() {
  const navigate = useNavigate();
  const user = useUser();
  const { theme, primaryColor } = useLayoutStore();
  const [fullscreen, setFullscreen] = React.useState(false);

  // 切换全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      user.logout();
      message.success('退出登录成功');
    } catch (error) {
      message.error('退出登录失败');
    }
  };

  // 个人中心
  const handleProfile = () => {
    navigate('/profile');
  };

  // 系统设置
  const handleSettings = () => {
    navigate('/settings');
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: handleProfile,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: handleSettings,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  if (!user.uuid) {
    return (
      <div className={classNames(styles.right, { [styles.dark]: theme === 'dark' })}>
        <Button type="link" onClick={() => navigate('/login')}>
          登录
        </Button>
      </div>
    );
  }

  return (
    <div className={classNames(styles.right, { [styles.dark]: theme === 'dark' })}>
      <Space size="middle">
        {/* 全屏按钮 */}
        <Button
          type="text"
          icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleFullscreen}
          title={fullscreen ? '退出全屏' : '全屏'}
          className={theme === 'dark' ? styles.darkButton : ''}
        />
        
        {/* 消息通知 */}
        <Button
          type="text"
          icon={<BellOutlined />}
          title="消息通知"
          onClick={() => message.info('暂无新消息')}
          className={theme === 'dark' ? styles.darkButton : ''}
        />
        
        {/* 帮助文档 */}
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          title="帮助文档"
          onClick={() => window.open('/docs', '_blank')}
          className={theme === 'dark' ? styles.darkButton : ''}
        />
        
        {/* 用户头像和下拉菜单 */}
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className={classNames(styles.userInfo, { [styles.dark]: theme === 'dark' })}>
            <Avatar 
              src={user.avatar} 
              icon={<UserOutlined />}
              size="small"
              style={{ backgroundColor: primaryColor }}
            />
            <span className={styles.userName}>{user.nickname || user.loginName}</span>
          </div>
        </Dropdown>
      </Space>
    </div>
  );
}

// 主Header组件
function Header(props: HeaderProps) {
  const { className, content, style } = props;
  const { theme } = useLayoutStore();

  return (
    <header 
      style={style} 
      className={classNames(styles.header, className, { [styles.dark]: theme === 'dark' })}
      data-theme={theme}
    >
      <Logo />
      {content && <div className={styles.content}>{content}</div>}
      <UserDropdown />
    </header>
  );
}

export default Header;
