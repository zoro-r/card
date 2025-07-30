import { AdminUser, IAdminUser } from '../models/user';
import { Role } from '../models/role';
import { UserRole } from '../models/userRole';
import { Menu } from '../models/menu';
import { RoleMenu } from '../models/roleMenu';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 密码加密
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证密码
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// 生成JWT Token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 验证JWT Token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 用户登录
export async function login(loginName: string, password: string, platformId: string) {
  const user = await AdminUser.findOne({ 
    loginName, 
    platformId,
    status: 'active' 
  });
  
  if (!user) {
    throw new Error('用户不存在或已被禁用');
  }

  if (!verifyPassword(password, user.password!)) {
    throw new Error('密码错误');
  }

  // 更新最后登录时间
  user.lastLoginAt = new Date();
  await user.save();

  // 获取用户角色
  const userRoles = await UserRole.find({ userId: user.uuid });
  const roleIds = userRoles.map(ur => ur.roleId);
  let roles: any[] = [];
  let permissions: string[] = [];
  
  if (roleIds.length > 0) {
    roles = await Role.find({
      uuid: { $in: roleIds },
      status: 'active'
    });

    // 通过角色菜单关系获取权限
    permissions = await getUserPermissionsByRoles(roleIds, platformId);
  }

  // 获取用户菜单
  const menus = await getUserMenus(user.uuid, platformId);

  const userInfo = {
    uuid: user.uuid,
    nickname: user.nickname,
    loginName: user.loginName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    platformId: user.platformId,
    roles,
    permissions,
    menus
  };

  const token = generateToken({ 
    uuid: user.uuid, 
    loginName: user.loginName,
    platformId: user.platformId 
  });

  return { token, userInfo };
}

// 通过角色获取用户权限
export async function getUserPermissionsByRoles(roleIds: string[], platformId: string): Promise<string[]> {
  // 获取角色菜单关系
  const roleMenus = await RoleMenu.find({
    roleId: { $in: roleIds },
    platformId,
    status: 'active'
  });

  const menuIds = roleMenus.map(rm => rm.menuId);
  
  if (menuIds.length === 0) {
    return [];
  }

  // 获取菜单权限
  const menus = await Menu.find({
    uuid: { $in: menuIds },
    platformId,
    status: 'active',
    permission: { $exists: true, $ne: null }
  });

  // 去重并返回权限列表
  const permissions = [...new Set(menus.map(menu => menu.permission).filter(Boolean))] as string[];
  return permissions;
}

// 获取用户菜单
export async function getUserMenus(userUuid: string, platformId: string) {
  // 获取用户角色
  const userRoles = await UserRole.find({ userId: userUuid });
  const roleIds = userRoles.map(ur => ur.roleId);
  
  if (roleIds.length === 0) {
    return [];
  }

  // 获取角色菜单关系
  const roleMenus = await RoleMenu.find({
    roleId: { $in: roleIds },
    platformId,
    status: 'active'
  });

  const menuIds = roleMenus.map(rm => rm.menuId);
  
  if (menuIds.length === 0) {
    return [];
  }

  // 获取菜单
  const menus = await Menu.find({
    uuid: { $in: menuIds },
    platformId,
    status: 'active'
  }).sort({ sort: 1 });

  // 构建菜单树
  return buildMenuTree(menus);
}

// 构建菜单树
function buildMenuTree(menus: any[]): any[] {
  const menuMap = new Map();
  const roots: any[] = [];

  // 先创建所有菜单项的映射
  menus.forEach(menu => {
    menuMap.set(menu.uuid, {
      uuid: menu.uuid,
      name: menu.name,
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      type: menu.type,
      permission: menu.permission,
      sort: menu.sort,
      children: []
    });
  });

  // 构建树形结构
  menus.forEach(menu => {
    const menuItem = menuMap.get(menu.uuid);
    if (menu.parentId && menuMap.has(menu.parentId)) {
      menuMap.get(menu.parentId).children.push(menuItem);
    } else {
      roots.push(menuItem);
    }
  });

  return roots;
}

// 获取用户列表
export async function getUserList(params: {
  page?: number;
  pageSize?: number;
  nickname?: string;
  loginName?: string;
  email?: string;
  phone?: string;
  status?: string;
  platformId?: string;
}) {
  const { page = 1, pageSize = 10, nickname, loginName, email, phone, status, platformId } = params;
  const skip = (page - 1) * pageSize;

  const query: any = {};
  if (nickname) {
    query.nickname = new RegExp(nickname, 'i');
  }
  if (loginName) {
    query.loginName = new RegExp(loginName, 'i');
  }
  if (email) {
    query.email = new RegExp(email, 'i');
  }
  if (phone) {
    query.phone = new RegExp(phone, 'i');
  }
  if (status) {
    query.status = status;
  }
  if (platformId) {
    query.platformId = platformId;
  }

  const [users, total] = await Promise.all([
    AdminUser.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('-password'),
    AdminUser.countDocuments(query)
  ]);

  // 获取用户角色信息（通过中间表）
  const usersWithRoles = await Promise.all(
    users.map(async (user) => {
      const userObj = user.toObject() as any;
      // 查找用户所有角色
      const userRoles = await UserRole.find({ userId: userObj.uuid });
      const roleIds = userRoles.map(ur => ur.roleId);
      if (roleIds.length > 0) {
        const roles = await Role.find({
          uuid: { $in: roleIds },
          status: 'active'
        });
        userObj.roles = roles.map(role => ({
          uuid: role.uuid,
          name: role.name,
          code: role.code,
          description: role.description,
          status: role.status
        }));
      } else {
        userObj.roles = [];
      }
      return userObj;
    })
  );

  return {
    list: usersWithRoles,
    total,
    page,
    pageSize
  };
}

// 根据ID获取用户详情
export async function getUserById(uuid: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  const user = await AdminUser.findOne(query).select('-password');
  if (!user) return null;

  const userObj = user.toObject() as any;
  // 查找用户所有角色
  const userRoles = await UserRole.find({ userId: userObj.uuid });
  const roleIds = userRoles.map(ur => ur.roleId);
  if (roleIds.length > 0) {
    const roles = await Role.find({
      uuid: { $in: roleIds },
      status: 'active'
    });
    userObj.roles = roles.map(role => ({
      uuid: role.uuid,
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status
    }));
  } else {
    userObj.roles = [];
  }
  return userObj;
}

// 创建用户
export async function createUser(userData: Partial<IAdminUser>) {
  const user = new AdminUser(userData);
  return await user.save();
}

// 更新用户
export async function updateUser(uuid: string, userData: Partial<IAdminUser>, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  const user = await AdminUser.findOneAndUpdate(
    query,
    { ...userData, updatedAt: new Date() },
    { new: true }
  ).select('-password');

  if (!user) return null;

  const userObj = user.toObject() as any;
  // 查找用户所有角色
  const userRoles = await UserRole.find({ userId: userObj.uuid });
  const roleIds = userRoles.map(ur => ur.roleId);
  if (roleIds.length > 0) {
    const roles = await Role.find({
      uuid: { $in: roleIds },
      status: 'active'
    });
    userObj.roles = roles.map(role => ({
      uuid: role.uuid,
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status
    }));
  } else {
    userObj.roles = [];
  }
  return userObj;
}

// 更新用户角色（重置为新角色集）
export async function updateUserRoles(uuid: string, roleIds: string[], platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  const user = await AdminUser.findOne(query);
  if (!user) return null;
  // 先删除原有角色（本平台）
  await UserRole.deleteMany({ userId: uuid, platformId });
  // 再插入新角色
  if (roleIds && roleIds.length > 0) {
    await UserRole.insertMany(roleIds.map(roleId => ({
      userId: uuid,
      roleId,
      platformId,
      status: 'active',
    })));
  }
  // 返回用户详情
  return getUserById(uuid, platformId);
}

// 删除用户
export async function deleteUser(uuid: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  // 删除用户角色关联
  await UserRole.deleteMany({ userId: uuid });
  return await AdminUser.findOneAndDelete(query);
}

// 批量删除用户
export async function batchDeleteUsers(uuids: string[], platformId?: string) {
  const query: any = { uuid: { $in: uuids } };
  if (platformId) {
    query.platformId = platformId;
  }
  // 删除用户角色关联
  await UserRole.deleteMany({ userId: { $in: uuids } });
  return await AdminUser.deleteMany(query);
}

// 检查登录名是否存在
export async function checkLoginNameExists(loginName: string, excludeUuid?: string, platformId?: string) {
  const query: any = { loginName };
  if (excludeUuid) {
    query.uuid = { $ne: excludeUuid };
  }
  if (platformId) {
    query.platformId = platformId;
  }
  const user = await AdminUser.findOne(query);
  return !!user;
}

// 检查邮箱是否存在
export async function checkEmailExists(email: string, excludeUuid?: string, platformId?: string) {
  const query: any = { email };
  if (excludeUuid) {
    query.uuid = { $ne: excludeUuid };
  }
  if (platformId) {
    query.platformId = platformId;
  }
  const user = await AdminUser.findOne(query);
  return !!user;
}

// 检查手机号是否存在
export async function checkPhoneExists(phone: string, excludeUuid?: string, platformId?: string) {
  const query: any = { phone };
  if (excludeUuid) {
    query.uuid = { $ne: excludeUuid };
  }
  if (platformId) {
    query.platformId = platformId;
  }
  const user = await AdminUser.findOne(query);
  return !!user;
}

// 重置用户密码
export async function resetUserPassword(uuid: string, newPassword: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  
  const hashedPassword = hashPassword(newPassword);
  
  const user = await AdminUser.findOneAndUpdate(
    query,
    { 
      password: hashedPassword,
      updatedAt: new Date()
    },
    { new: true }
  ).select('-password');

  return user;
}

// 用户修改自己的密码
export async function changeUserPassword(uuid: string, oldPassword: string, newPassword: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }

  // 首先获取用户信息（包括密码）来验证旧密码
  const user = await AdminUser.findOne(query);
  if (!user) {
    throw new Error('用户不存在');
  }

  // 验证旧密码
  if (!verifyPassword(oldPassword, user.password!)) {
    throw new Error('当前密码错误');
  }

  // 更新为新密码
  const hashedNewPassword = hashPassword(newPassword);
  const updatedUser = await AdminUser.findOneAndUpdate(
    query,
    { 
      password: hashedNewPassword,
      updatedAt: new Date()
    },
    { new: true }
  ).select('-password');

  return updatedUser;
}

// 用户更新自己的个人信息
export async function updateUserProfile(uuid: string, profileData: Partial<IAdminUser>, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }

  // 如果更新邮箱，需要检查邮箱是否已被其他用户使用
  if (profileData.email) {
    const emailExists = await checkEmailExists(profileData.email, uuid, platformId);
    if (emailExists) {
      throw new Error('邮箱已被其他用户使用');
    }
  }

  // 如果更新手机号，需要检查手机号是否已被其他用户使用
  if (profileData.phone) {
    const phoneExists = await checkPhoneExists(profileData.phone, uuid, platformId);
    if (phoneExists) {
      throw new Error('手机号已被其他用户使用');
    }
  }

  // 过滤掉不允许用户自己修改的字段
  const allowedFields = ['nickname', 'email', 'phone', 'gender', 'birthday', 'address', 'remark'];
  const filteredData: any = {};
  
  Object.keys(profileData).forEach(key => {
    if (allowedFields.includes(key) && profileData[key as keyof IAdminUser] !== undefined) {
      filteredData[key] = profileData[key as keyof IAdminUser];
    }
  });

  // 添加更新时间和更新者
  filteredData.updatedAt = new Date();
  filteredData.updatedBy = uuid; // 用户自己更新

  const updatedUser = await AdminUser.findOneAndUpdate(
    query,
    filteredData,
    { new: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('用户不存在');
  }

  return updatedUser;
}
