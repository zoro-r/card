import { defineConfig } from '@umijs/max';

export default defineConfig({
  // 移除base配置，或者设置为空字符串
  base: 'admin',
  esbuildMinifyIIFE: true,  // 修复esbuild helpers冲突问题
  // 启用全局样式
  styles: [
    'src/global.less'
  ],
  antd: {
    theme: {
      token: {
        colorPrimary: '#1890ff',  // 主题色：专业的蓝色
        colorSuccess: '#52c41a',   // 成功色：用于涨幅
        colorError: '#ff4d4f',     // 错误色：用于跌幅
        colorTextBase: '#2c3e50',  // 基础文字颜色
        borderRadius: 4,           // 统一圆角
        colorBgContainer: '#ffffff' // 容器背景色
      },
      components: {
        Layout: {
          siderBg: '#fff',      // 侧边栏背景
          bodyBg: '#f0f2f5',       // 浅灰色背景
          headerBg: '#ffffff'       // 白色顶栏
        },
        Table: {
          headerBg: '#fafafa',     // 表格头部背景
          headerColor: '#1f2937',   // 表格头部文字颜色
          rowHoverBg: '#e6f7ff'    // 表格行悬浮颜色
        }
      }
    }
  },
  npmClient: 'pnpm',
});
