import { Role, IRole } from '../models/role';
import { RoleMenu } from '../models/roleMenu';

// 获取角色列表
export async function getRoleList(params: {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: string;
  platformId?: string;
}) {
  const { page = 1, pageSize = 10, name, code, status, platformId } = params;
  const skip = (page - 1) * pageSize;

  const query: any = {};
  if (name) {
    query.name = new RegExp(name, 'i');
  }
  if (code) {
    query.code = new RegExp(code, 'i');
  }
  if (status) {
    query.status = status;
  }
  if (platformId) {
    query.platformId = platformId;
  }

  const [roles, total] = await Promise.all([
    Role.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    Role.countDocuments(query)
  ]);

  // 为每个角色获取关联的菜单数量
  const rolesWithMenuCount = await Promise.all(
    roles.map(async (role) => {
      const roleObj = role.toObject() as any;
      const menuCount = await RoleMenu.countDocuments({
        roleId: role.uuid,
        status: 'active'
      });
      roleObj.menuCount = menuCount;
      return roleObj;
    })
  );

  return {
    list: rolesWithMenuCount,
    total,
    page,
    pageSize
  };
}

// 根据ID获取角色详情
export async function getRoleById(uuid: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  const role = await Role.findOne(query);
  
  if (!role) {
    return null;
  }

  const roleObj = role.toObject() as any;
  
  // 获取角色关联的菜单IDs
  const roleMenus = await RoleMenu.find({
    roleId: role.uuid,
    status: 'active'
  });
  
  roleObj.menuIds = roleMenus.map(rm => rm.menuId);
  
  return roleObj;
}

// 创建角色
export async function createRole(roleData: Partial<IRole>) {
  const role = new Role(roleData);
  return await role.save();
}

// 更新角色
export async function updateRole(uuid: string, roleData: Partial<IRole>, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  return await Role.findOneAndUpdate(
    query,
    { ...roleData, updatedAt: new Date() },
    { new: true }
  );
}

// 删除角色
export async function deleteRole(uuid: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  
  // 删除角色菜单关联
  await RoleMenu.deleteMany({ roleId: uuid });
  
  return await Role.findOneAndDelete(query);
}

// 批量删除角色
export async function batchDeleteRoles(uuids: string[], platformId?: string) {
  const query: any = { uuid: { $in: uuids } };
  if (platformId) {
    query.platformId = platformId;
  }
  
  // 删除角色菜单关联
  await RoleMenu.deleteMany({ roleId: { $in: uuids } });
  
  return await Role.deleteMany(query);
}

// 检查角色代码是否存在
export async function checkRoleCodeExists(code: string, excludeUuid?: string, platformId?: string) {
  const query: any = { code };
  if (excludeUuid) {
    query.uuid = { $ne: excludeUuid };
  }
  if (platformId) {
    query.platformId = platformId;
  }
  const role = await Role.findOne(query);
  return !!role;
}

// 更新角色菜单关系
export async function updateRoleMenus(roleId: string, menuIds: string[], platformId: string) {
  // 先删除原有关系
  await RoleMenu.deleteMany({ 
    roleId, 
    platformId 
  });
  
  // 插入新的关系
  if (menuIds && menuIds.length > 0) {
    const roleMenus = menuIds.map(menuId => ({
      roleId,
      menuId,
      platformId,
      status: 'active',
      createdBy: 'system',
      updatedBy: 'system'
    }));
    
    await RoleMenu.insertMany(roleMenus);
  }
  
  return true;
}

// 获取角色的菜单列表
export async function getRoleMenus(roleId: string, platformId?: string) {
  const query: any = { roleId, status: 'active' };
  if (platformId) {
    query.platformId = platformId;
  }
  
  const roleMenus = await RoleMenu.find(query);
  return roleMenus.map(rm => rm.menuId);
}