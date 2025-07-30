import { Menu, IMenu } from '../models/menu';

// 获取菜单列表
export async function getMenuList(params: {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: string;
  status?: string;
  platformId?: string;
}) {
  const { page = 1, pageSize = 10, name, type, status, platformId } = params;
  const skip = (page - 1) * pageSize;

  const query: any = {};
  if (name) {
    query.name = new RegExp(name, 'i');
  }
  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }
  if (platformId) {
    query.platformId = platformId;
  }

  const [menus, total] = await Promise.all([
    Menu.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ sort: 1, createdAt: -1 }),
    Menu.countDocuments(query)
  ]);

  return {
    list: menus,
    total,
    page,
    pageSize
  };
}

// 获取菜单树结构
export async function getMenuTree(platformId?: string) {
  const query: any = { status: 'active' };
  if (platformId) {
    query.platformId = platformId;
  }

  const menus = await Menu.find(query).sort({ sort: 1 });
  return buildMenuTree(menus);
}

// 构建菜单树
function buildMenuTree(menus: any[]): any[] {
  const menuMap = new Map();
  const roots: any[] = [];

  // 先创建所有菜单项的映射
  menus.forEach(menu => {
    menuMap.set(menu.uuid, {
      ...menu.toObject(),
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

// 根据ID获取菜单详情
export async function getMenuById(uuid: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  return await Menu.findOne(query);
}

// 创建菜单
export async function createMenu(menuData: Partial<IMenu>) {
  const menu = new Menu(menuData);
  return await menu.save();
}

// 更新菜单
export async function updateMenu(uuid: string, menuData: Partial<IMenu>, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  return await Menu.findOneAndUpdate(
    query,
    { ...menuData, updatedAt: new Date() },
    { new: true }
  );
}

// 删除菜单
export async function deleteMenu(uuid: string, platformId?: string) {
  const query: any = { uuid };
  if (platformId) {
    query.platformId = platformId;
  }
  
  // 检查是否有子菜单
  const childCount = await Menu.countDocuments({ parentId: uuid });
  if (childCount > 0) {
    throw new Error('该菜单下有子菜单，不能删除');
  }
  
  return await Menu.findOneAndDelete(query);
}

// 批量删除菜单
export async function batchDeleteMenus(uuids: string[], platformId?: string) {
  const query: any = { uuid: { $in: uuids } };
  if (platformId) {
    query.platformId = platformId;
  }
  
  // 检查是否有子菜单
  for (const uuid of uuids) {
    const childCount = await Menu.countDocuments({ parentId: uuid });
    if (childCount > 0) {
      const menu = await Menu.findOne({ uuid });
      throw new Error(`菜单"${menu?.name}"下有子菜单，不能删除`);
    }
  }
  
  return await Menu.deleteMany(query);
}