import { useEffect } from 'react';
import { useLayoutStore } from '@/stores/layoutStore';

// 响应式断点
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export const useResponsive = () => {
  const { setIsMobile, setBreakpoint, setSiderCollapsed } = useLayoutStore();

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      
      // 确定当前断点
      let currentBreakpoint: keyof typeof breakpoints = 'xs';
      Object.entries(breakpoints).forEach(([key, value]) => {
        if (width >= value) {
          currentBreakpoint = key as keyof typeof breakpoints;
        }
      });
      
      const isMobile = width < breakpoints.md;
      
      setIsMobile(isMobile);
      setBreakpoint(currentBreakpoint);
      
      // 移动端自动收起侧边栏
      if (isMobile) {
        setSiderCollapsed(true);
      }
    };

    // 初始化
    updateSize();

    // 监听窗口大小变化
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [setIsMobile, setBreakpoint, setSiderCollapsed]);
};

export default useResponsive;