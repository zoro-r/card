import { usePermission } from './usePermission';

/**
 * Access 权限控制 Hook
 * 提供统一的权限检查接口
 */
export function useAccess() {
  const { hasPermission, isSuperAdmin } = usePermission();

  return {
    // 企业管理权限
    canCreate: (resource: string) => hasPermission(`${resource}:create`) || isSuperAdmin(),
    canRead: (resource: string) => hasPermission(`${resource}:read`) || isSuperAdmin(),
    canUpdate: (resource: string) => hasPermission(`${resource}:update`) || isSuperAdmin(),
    canDelete: (resource: string) => hasPermission(`${resource}:delete`) || isSuperAdmin(),
    
    // 特定权限检查
    canManageCompany: () => hasPermission('company:manage') || isSuperAdmin(),
    canManageEmployee: () => hasPermission('employee:manage') || isSuperAdmin(),
    canViewStats: () => hasPermission('stats:read') || isSuperAdmin(),
    
    // 系统管理权限
    canManageUsers: () => hasPermission('user:manage') || isSuperAdmin(),
    canManageRoles: () => hasPermission('role:manage') || isSuperAdmin(),
    canManageMenus: () => hasPermission('menu:manage') || isSuperAdmin(),
    canManageSystem: () => hasPermission('system:manage') || isSuperAdmin(),
    
    // 微信管理权限
    canManageWechat: () => hasPermission('wechat:manage') || isSuperAdmin(),
    canManageWechatUsers: () => hasPermission('wechat_user:manage') || isSuperAdmin(),
    canManageWechatPayments: () => hasPermission('wechat_payment:manage') || isSuperAdmin(),
    
    // 订单管理权限
    canManageOrders: () => hasPermission('order:manage') || isSuperAdmin(),
    canManageProducts: () => hasPermission('product:manage') || isSuperAdmin(),
    
    // 文件管理权限
    canManageFiles: () => hasPermission('file:manage') || isSuperAdmin(),
    
    // 超级管理员
    isSuperAdmin,
  };
}

export default useAccess;