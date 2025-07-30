import React, { useState } from 'react';
import { 
  Drawer, 
  ColorPicker, 
  Divider, 
  Button,
  Space,
  Typography,
  message 
} from 'antd';
import { 
  SettingOutlined, 
  SunOutlined
} from '@ant-design/icons';
import { useLayoutStore } from '@/stores/layoutStore';
import './index.less';

const { Title, Text } = Typography;

const LayoutSettings: React.FC = () => {
  const [visible, setVisible] = useState(false);
  
  const {
    theme,
    primaryColor,
    
    setTheme,
    setPrimaryColor,
    resetToDefault,
  } = useLayoutStore();

  const handleReset = () => {
    resetToDefault();
    message.success('布局设置已重置为默认值');
  };

  const presetColors = [
    '#1890ff', // 默认蓝色
    '#722ed1', // 紫色
    '#13c2c2', // 青色
    '#52c41a', // 绿色
    '#fa541c', // 橙色
    '#f5222d', // 红色
    '#fa8c16', // 金色
    '#eb2f96', // 粉色
  ];

  return (
    <>
      {/* 设置触发按钮 */}
      <div 
        className="layout-settings-trigger"
        onClick={() => setVisible(true)}
      >
        <SettingOutlined />
      </div>

      {/* 设置抽屉 */}
      <Drawer
        title="布局配置"
        placement="right"
        width={320}
        onClose={() => setVisible(false)}
        open={visible}
        className="layout-settings-drawer"
        footer={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={handleReset}>
              重置默认
            </Button>
            <Button type="primary" onClick={() => setVisible(false)}>
              确定
            </Button>
          </Space>
        }
      >
        <div className="layout-settings-content">
          {/* 主题设置 */}
          <div className="settings-section">
            <Title level={5}>
              <SunOutlined /> 主题模式
            </Title>
            <div className="theme-selector">
              <div 
                className={`theme-item ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className="theme-preview light">
                  <div className="theme-header"></div>
                  <div className="theme-body">
                    <div className="theme-sider"></div>
                    <div className="theme-content"></div>
                  </div>
                </div>
                <Text>浅色主题</Text>
              </div>
              <div 
                className={`theme-item ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className="theme-preview dark">
                  <div className="theme-header"></div>
                  <div className="theme-body">
                    <div className="theme-sider"></div>
                    <div className="theme-content"></div>
                  </div>
                </div>
                <Text>深色主题</Text>
              </div>
            </div>
          </div>

          <Divider />

          {/* 主题色设置 */}
          <div className="settings-section">
            <Title level={5}>主题色</Title>
            <div className="color-selector">
              {presetColors.map(color => (
                <div
                  key={color}
                  className={`color-item ${primaryColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setPrimaryColor(color)}
                />
              ))}
              <ColorPicker
                value={primaryColor}
                onChange={(color) => setPrimaryColor(color.toHexString())}
                trigger="hover"
              >
                <div className="color-item custom">
                  <SettingOutlined />
                </div>
              </ColorPicker>
            </div>
          </div>

          <Divider />
        </div>
      </Drawer>
    </>
  );
};

export default LayoutSettings;