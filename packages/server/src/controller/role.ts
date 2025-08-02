import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import { 
  getRoleList,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  batchDeleteRoles,
  checkRoleCodeExists,
  updateRoleMenus,
  getRoleMenus
} from '@/service/role';
import { getDefaultPlatformId } from '@/utils/platform';

// 获取角色列表
export async function getRoleListAPI(ctx: Context) {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      name, 
      code, 
      status, 
      platformId = getDefaultPlatformId() 
    } = ctx.request.query as any;

    const result = await getRoleList({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      name,
      code,
      status,
      platformId
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 获取角色详情
export async function getRoleByIdAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const { platformId = getDefaultPlatformId() } = ctx.request.query as any;

    const role = await getRoleById(uuid, platformId);
    
    if (!role) {
      ctx.body = fail('角色不存在');
      return;
    }

    ctx.body = success(role);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 创建角色
export async function createRoleAPI(ctx: Context) {
  try {
    const roleData = ctx.request.body as any;
    const { name, code, menuIds, platformId = getDefaultPlatformId() } = roleData;

    // 验证必填字段
    if (!name || !code) {
      ctx.body = fail('角色名称和代码不能为空');
      return;
    }

    // 检查角色代码是否已存在
    const codeExists = await checkRoleCodeExists(code, undefined, platformId);
    if (codeExists) {
      ctx.body = fail('角色代码已存在');
      return;
    }

    // 创建角色
    const role = await createRole({
      name,
      code,
      description: roleData.description,
      status: roleData.status || 'active',
      platformId
    });

    // 如果有菜单ID，创建角色菜单关系
    if (menuIds && menuIds.length > 0) {
      await updateRoleMenus(role.uuid, menuIds, platformId);
    }

    ctx.body = success(role, '角色创建成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 更新角色
export async function updateRoleAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const roleData = ctx.request.body as any;
    const { code, menuIds, platformId = getDefaultPlatformId() } = roleData;

    // 检查角色代码是否已存在（排除当前角色）
    if (code) {
      const codeExists = await checkRoleCodeExists(code, uuid, platformId);
      if (codeExists) {
        ctx.body = fail('角色代码已存在');
        return;
      }
    }

    // 更新角色基本信息
    const role = await updateRole(uuid, {
      name: roleData.name,
      code: roleData.code,
      description: roleData.description,
      status: roleData.status
    }, platformId);
    
    if (!role) {
      ctx.body = fail('角色不存在');
      return;
    }

    // 更新角色菜单关系
    if (menuIds !== undefined) {
      await updateRoleMenus(uuid, menuIds, platformId);
    }

    ctx.body = success(role, '角色更新成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 删除角色
export async function deleteRoleAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const { platformId = getDefaultPlatformId() } = ctx.request.query as any;

    const role = await deleteRole(uuid, platformId);
    
    if (!role) {
      ctx.body = fail('角色不存在');
      return;
    }

    ctx.body = success(null, '角色删除成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 批量删除角色
export async function batchDeleteRolesAPI(ctx: Context) {
  try {
    const { uuids } = ctx.request.body as any;
    const { platformId = getDefaultPlatformId() } = ctx.request.query as any;

    if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
      ctx.body = fail('请提供要删除的角色ID列表');
      return;
    }

    await batchDeleteRoles(uuids, platformId);
    
    ctx.body = success(null, '角色批量删除成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 获取角色菜单
export async function getRoleMenusAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const { platformId = getDefaultPlatformId() } = ctx.request.query as any;

    const menuIds = await getRoleMenus(uuid, platformId);
    
    ctx.body = success({ menuIds });
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 更新角色菜单
export async function updateRoleMenusAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const { menuIds } = ctx.request.body as any;
    const { platformId = getDefaultPlatformId() } = ctx.request.query as any;

    if (!Array.isArray(menuIds)) {
      ctx.body = fail('菜单ID列表格式错误');
      return;
    }

    await updateRoleMenus(uuid, menuIds, platformId);
    
    ctx.body = success(null, '角色菜单更新成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}