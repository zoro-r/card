import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  requireAll?: boolean; // 是否需要所有权限，默认false（只需要任意一个权限）
  fallback?: React.ReactNode; // 没有权限时显示的内容
}

const Permission: React.FC<PermissionProps> = ({
  children,
  permission,
  permissions,
  role,
  requireAll = false,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isSuperAdmin } = usePermission();

  // 如果是超级管理员，直接显示内容
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // 检查角色权限
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // 检查单个权限
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // 检查多个权限
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default Permission;