import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import { 
  getMenuList,
  getMenuTree,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  batchDeleteMenus
} from '@/service/menu';

// 获取菜单列表
export async function getMenuListAPI(ctx: Context) {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      name, 
      type, 
      status, 
      platformId = 'default' 
    } = ctx.request.query as any;

    const result = await getMenuList({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      name,
      type,
      status,
      platformId
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 获取菜单树结构
export async function getMenuTreeAPI(ctx: Context) {
  try {
    const { platformId = 'default' } = ctx.request.query as any;
    
    const result = await getMenuTree(platformId);
    
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 获取菜单详情
export async function getMenuByIdAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const { platformId = 'default' } = ctx.request.query as any;

    const menu = await getMenuById(uuid, platformId);
    
    if (!menu) {
      ctx.body = fail('菜单不存在');
      return;
    }

    ctx.body = success(menu);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 创建菜单
export async function createMenuAPI(ctx: Context) {
  try {
    const menuData = ctx.request.body as any;
    const { name, platformId = 'default' } = menuData;

    // 验证必填字段
    if (!name) {
      ctx.body = fail('菜单名称不能为空');
      return;
    }

    const menu = await createMenu({
      ...menuData,
      platformId
    });

    ctx.body = success(menu, '菜单创建成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 更新菜单
export async function updateMenuAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const menuData = ctx.request.body as any;
    const { platformId = 'default' } = menuData;

    // 防止将菜单设置为自己的子菜单
    if (menuData.parentId === uuid) {
      ctx.body = fail('不能将菜单设置为自己的子菜单');
      return;
    }

    const menu = await updateMenu(uuid, menuData, platformId);
    
    if (!menu) {
      ctx.body = fail('菜单不存在');
      return;
    }

    ctx.body = success(menu, '菜单更新成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 删除菜单
export async function deleteMenuAPI(ctx: Context) {
  try {
    const { uuid } = ctx.params;
    const { platformId = 'default' } = ctx.request.query as any;

    const menu = await deleteMenu(uuid, platformId);
    
    if (!menu) {
      ctx.body = fail('菜单不存在');
      return;
    }

    ctx.body = success(null, '菜单删除成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

// 批量删除菜单
export async function batchDeleteMenusAPI(ctx: Context) {
  try {
    const { uuids } = ctx.request.body as any;
    const { platformId = 'default' } = ctx.request.query as any;

    if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
      ctx.body = fail('请提供要删除的菜单ID列表');
      return;
    }

    await batchDeleteMenus(uuids, platformId);
    
    ctx.body = success(null, '菜单批量删除成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}