/**
 * 检查用户是否有指定权限
 * @param userPermissions 用户权限列表
 * @param requiredPermission 需要的权限
 * @returns 是否有权限
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  // 超级管理员权限
  if (userPermissions.includes('*')) {
    return true;
  }
  
  return userPermissions.includes(requiredPermission);
}

/**
 * 检查用户是否有任意一个权限
 * @param userPermissions 用户权限列表
 * @param requiredPermissions 需要的权限列表
 * @returns 是否有权限
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  // 超级管理员权限
  if (userPermissions.includes('*')) {
    return true;
  }
  
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * 检查用户是否有所有权限
 * @param userPermissions 用户权限列表
 * @param requiredPermissions 需要的权限列表
 * @returns 是否有权限
 */
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  // 超级管理员权限
  if (userPermissions.includes('*')) {
    return true;
  }
  
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * 检查用户角色
 * @param userRoles 用户角色列表
 * @param requiredRole 需要的角色
 * @returns 是否有角色
 */
export function hasRole(userRoles: string[], requiredRole: string): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  
  return userRoles.includes(requiredRole);
}

/**
 * 检查用户是否是超级管理员
 * @param userRoles 用户角色列表
 * @returns 是否是超级管理员
 */
export function isSuperAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, 'super_admin');
}