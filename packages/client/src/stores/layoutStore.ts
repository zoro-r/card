import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LayoutConfig {
  // 侧边栏配置
  siderCollapsed: boolean;
  siderWidth: number;
  siderCollapsedWidth: number;
  
  // 主题配置
  theme: 'light' | 'dark';
  primaryColor: string;
  
  // 响应式配置
  isMobile: boolean;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

interface LayoutStore extends LayoutConfig {
  // 动作方法
  setSiderCollapsed: (collapsed: boolean) => void;
  toggleSiderCollapsed: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
  setIsMobile: (isMobile: boolean) => void;
  setBreakpoint: (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => void;
  resetToDefault: () => void;
}

const defaultConfig: LayoutConfig = {
  // 侧边栏配置
  siderCollapsed: false,
  siderWidth: 256,
  siderCollapsedWidth: 64,
  
  // 主题配置
  theme: 'light',
  primaryColor: '#1890ff',
  
  // 响应式配置
  isMobile: false,
  breakpoint: 'lg',
};

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      ...defaultConfig,
      
      setSiderCollapsed: (collapsed: boolean) => 
        set({ siderCollapsed: collapsed }),
        
      toggleSiderCollapsed: () => 
        set({ siderCollapsed: !get().siderCollapsed }),
        
      setTheme: (theme: 'light' | 'dark') => 
        set({ theme }),
        
      toggleTheme: () => 
        set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
        
      setPrimaryColor: (color: string) => 
        set({ primaryColor: color }),
        
      setIsMobile: (isMobile: boolean) => 
        set({ isMobile }),
        
      setBreakpoint: (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => 
        set({ breakpoint }),
        
      resetToDefault: () => 
        set(defaultConfig),
    }),
    {
      name: 'layout-config',
      partialize: (state) => ({
        siderCollapsed: state.siderCollapsed,
        theme: state.theme,
        primaryColor: state.primaryColor,
      }),
    }
  )
);