import { useMemo } from 'react';
import useUser from './useUser';
import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isSuperAdmin } from '@/utils/permission';

interface UsePermissionReturn {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  isSuperAdmin: () => boolean;
}

export function usePermission(): UsePermissionReturn {
  const user = useUser();
  
  const userPermissions = useMemo(() => {
    return user.permissions || [];
  }, [user.permissions]);
  
  const userRoles = useMemo(() => {
    return user.roles?.map((role: any) => role.code) || [];
  }, [user.roles]);
  
  return {
    hasPermission: (permission: string) => hasPermission(userPermissions, permission),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(userPermissions, permissions),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(userPermissions, permissions),
    hasRole: (role: string) => hasRole(userRoles, role),
    isSuperAdmin: () => isSuperAdmin(userRoles),
  };
}

export default usePermission;