import React, { Suspense } from 'react';
import { useOutlet, useLocation } from '@umijs/max';
import { Layout, ConfigProvider, theme } from 'antd';
import { useLayoutStore } from '@/stores/layoutStore';
import useResponsive from '@/hooks/useResponsive';
import useUser from '@/hooks/useUser';

import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import PageLoading from '@/components/PageLoading';
import LayoutSettings from '@/components/LayoutSettings';

import './index.less';

const { Sider, Content } = Layout;

// 无需布局的页面路径
const NO_LAYOUT_PATHS = ['/login', '/admin/login', '/404', '/403', '/500', '/login/first-time-change-password'];

const AppLayout: React.FC = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const { menus, loading: userLoading } = useUser();

  // 使用全局配置
  const {
    theme: layoutTheme,
    primaryColor,
    siderCollapsed,
    siderWidth,
    siderCollapsedWidth,
    isMobile,
    toggleSiderCollapsed,
  } = useLayoutStore();

  // 响应式处理
  useResponsive();

  // 判断是否需要显示布局
  const shouldShowLayout = !NO_LAYOUT_PATHS.some(path =>
    location.pathname === path || location.pathname.startsWith(path)
  );

  // 动态设置CSS变量
  React.useEffect(() => {
    document.documentElement.style.setProperty('--ant-primary-color', primaryColor);
    
    // 计算主题色的透明度变体
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const rgb = hexToRgb(primaryColor);
    if (rgb) {
      document.documentElement.style.setProperty('--ant-primary-color-hover', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
      document.documentElement.style.setProperty('--ant-primary-color-active', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
      document.documentElement.style.setProperty('--ant-primary-color-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);
    }
  }, [primaryColor]);

  // 如果是无布局页面，直接返回内容
  if (!shouldShowLayout) {
    return (
      <ConfigProvider
        theme={{
          algorithm: layoutTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: primaryColor,
          },
        }}
      >
        <div data-theme={layoutTheme}>
          {outlet}
        </div>
      </ConfigProvider>
    );
  }

  // 显示用户信息加载中
  if (userLoading) {
    return <PageLoading tip="加载用户信息中..." />;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: layoutTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
        },
      }}
    >
      <div data-theme={layoutTheme} className="app-layout">
        <Layout className="layout-container">
          {/* 固定顶部导航栏 */}
          <Layout.Header className="layout-header">
            <Header />
          </Layout.Header>

          <Layout className="layout-body">
            {/* 左侧边栏 */}
            <Sider
              className="layout-sider"
              width={siderWidth}
              collapsedWidth={siderCollapsedWidth}
              collapsed={siderCollapsed}
              trigger={null}
              theme={layoutTheme}
            >
              <SideMenu
                items={menus}
                inlineCollapsed={siderCollapsed}
                onCollapse={toggleSiderCollapsed}
                theme={layoutTheme}
              />
            </Sider>

            {/* 右侧内容区域 */}
            <Layout className="layout-content-wrapper">
              <Content
                className="layout-content"
              >

                {/* 页面内容 */}
                <div className="page-content">
                  <Suspense fallback={<PageLoading />}>
                    <div style={{ padding: 15 }}>
                      {outlet}
                    </div>
                  </Suspense>
                </div>
              </Content>
            </Layout>
          </Layout>
        </Layout>

        {/* 移动端遮罩层 */}
        {isMobile && !siderCollapsed && (
          <div
            className="layout-mask"
            onClick={toggleSiderCollapsed}
          />
        )}

        {/* 布局设置面板 */}
        <LayoutSettings />
      </div>
    </ConfigProvider>
  );
};

export default AppLayout;
