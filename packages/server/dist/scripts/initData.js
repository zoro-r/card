"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const menu_1 = require("../models/menu");
const userRole_1 = require("../models/userRole");
const roleMenu_1 = require("../models/roleMenu");
const user_2 = require("../service/user");
function initData() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        try {
            yield (0, database_1.connectDB)();
            const platformId = 'default';
            console.log('开始初始化数据...');
            // 1. 创建角色（不包含permissions字段）
            const roles = [
                {
                    name: '超级管理员',
                    code: 'super_admin',
                    description: '系统超级管理员，拥有所有权限'
                },
                {
                    name: '系统管理员',
                    code: 'admin',
                    description: '系统管理员，拥有大部分权限'
                },
                {
                    name: '普通用户',
                    code: 'user',
                    description: '普通用户，只有基本权限'
                }
            ];
            const createdRoles = {};
            for (const roleData of roles) {
                const existingRole = yield role_1.Role.findOne({ code: roleData.code, platformId });
                if (!existingRole) {
                    const role = yield role_1.Role.create(Object.assign(Object.assign({}, roleData), { platformId, status: 'active', createdBy: 'system', updatedBy: 'system' }));
                    createdRoles[roleData.code] = role;
                    console.log(`✓ 创建角色"${roleData.name}"成功`);
                }
                else {
                    createdRoles[roleData.code] = existingRole;
                    console.log(`- 角色"${roleData.name}"已存在`);
                }
            }
            // 2. 创建菜单
            const menus = [
                // 一级菜单
                {
                    name: '仪表盘',
                    path: '/dashboard',
                    component: './pages/dashboard',
                    icon: 'DashboardOutlined',
                    type: 'menu',
                    sort: 0,
                    permission: 'dashboard:read',
                    parentId: null
                },
                {
                    name: '系统管理',
                    path: '/system',
                    icon: 'SettingOutlined',
                    type: 'menu',
                    sort: 1,
                    permission: 'system:read',
                    parentId: null
                },
                // 系统管理子菜单
                {
                    name: '用户管理',
                    path: '/system/users',
                    component: './pages/system/users',
                    icon: 'UserOutlined',
                    type: 'menu',
                    sort: 1,
                    permission: 'user:manage',
                    parentKey: 'system'
                },
                {
                    name: '角色管理',
                    path: '/system/roles',
                    component: './pages/system/roles',
                    icon: 'TeamOutlined',
                    type: 'menu',
                    sort: 2,
                    permission: 'role:manage',
                    parentKey: 'system'
                },
                {
                    name: '菜单管理',
                    path: '/system/menus',
                    component: './pages/system/menus',
                    icon: 'MenuOutlined',
                    type: 'menu',
                    sort: 3,
                    permission: 'menu:manage',
                    parentKey: 'system'
                }
            ];
            const createdMenus = {};
            const menuKeyMap = {
                'system': '系统管理',
                'user': '用户管理',
                'role': '角色管理',
                'menu': '菜单管理'
            };
            // 先创建一级菜单
            for (const menuData of menus.filter(m => !m.parentKey)) {
                const existingMenu = yield menu_1.Menu.findOne({
                    name: menuData.name,
                    platformId
                });
                if (!existingMenu) {
                    const menu = yield menu_1.Menu.create(Object.assign(Object.assign({}, menuData), { platformId, status: 'active', createdBy: 'system', updatedBy: 'system' }));
                    createdMenus[menuData.name] = menu;
                    console.log(`✓ 创建菜单"${menuData.name}"成功`);
                }
                else {
                    createdMenus[menuData.name] = existingMenu;
                    console.log(`- 菜单"${menuData.name}"已存在`);
                }
            }
            // 再创建子菜单
            for (const menuData of menus.filter(m => m.parentKey)) {
                const parentMenuName = menuKeyMap[menuData.parentKey];
                const parentMenu = createdMenus[parentMenuName];
                if (!parentMenu) {
                    console.log(`⚠️ 找不到父菜单"${parentMenuName}"，跳过创建"${menuData.name}"`);
                    continue;
                }
                const existingMenu = yield menu_1.Menu.findOne({
                    name: menuData.name,
                    platformId
                });
                if (!existingMenu) {
                    const menu = yield menu_1.Menu.create(Object.assign(Object.assign({}, menuData), { parentId: parentMenu.uuid, platformId, status: 'active', createdBy: 'system', updatedBy: 'system' }));
                    createdMenus[menuData.name] = menu;
                    console.log(`✓ 创建子菜单"${menuData.name}"成功`);
                }
                else {
                    // 更新父菜单ID
                    yield menu_1.Menu.updateOne({ uuid: existingMenu.uuid }, { parentId: parentMenu.uuid });
                    createdMenus[menuData.name] = existingMenu;
                    console.log(`- 子菜单"${menuData.name}"已存在`);
                }
            }
            // 3. 创建角色菜单关系
            const roleMenuMappings = {
                'super_admin': Object.values(createdMenus).map((menu) => menu.uuid), // 超级管理员拥有所有菜单
                'admin': [
                    (_a = createdMenus['仪表盘']) === null || _a === void 0 ? void 0 : _a.uuid,
                    (_b = createdMenus['系统管理']) === null || _b === void 0 ? void 0 : _b.uuid,
                    (_c = createdMenus['用户管理']) === null || _c === void 0 ? void 0 : _c.uuid,
                    (_d = createdMenus['角色管理']) === null || _d === void 0 ? void 0 : _d.uuid,
                    (_e = createdMenus['菜单管理']) === null || _e === void 0 ? void 0 : _e.uuid
                ].filter(Boolean),
                'user': [
                    (_f = createdMenus['仪表盘']) === null || _f === void 0 ? void 0 : _f.uuid
                ].filter(Boolean)
            };
            for (const [roleCode, menuIds] of Object.entries(roleMenuMappings)) {
                const role = createdRoles[roleCode];
                if (!role || !menuIds.length)
                    continue;
                // 删除现有的角色菜单关系
                yield roleMenu_1.RoleMenu.deleteMany({ roleId: role.uuid, platformId });
                // 创建新的角色菜单关系
                const roleMenus = menuIds.map(menuId => ({
                    roleId: role.uuid,
                    menuId,
                    platformId,
                    status: 'active',
                    createdBy: 'system',
                    updatedBy: 'system'
                }));
                yield roleMenu_1.RoleMenu.insertMany(roleMenus);
                console.log(`✓ 为角色"${role.name}"分配了 ${menuIds.length} 个菜单权限`);
            }
            // 4. 创建用户
            const users = [
                {
                    nickname: '超级管理员',
                    loginName: 'super',
                    email: 'super@example.com',
                    password: 'super123',
                    roleCode: 'super_admin',
                    phone: '13800000000',
                    gender: 'other',
                    remark: '系统超级管理员账号'
                },
                {
                    nickname: '系统管理员',
                    loginName: 'admin',
                    email: 'admin@example.com',
                    password: 'admin123',
                    roleCode: 'admin',
                    phone: '13800000001',
                    gender: 'other',
                    remark: '系统管理员账号'
                },
                {
                    nickname: '测试用户',
                    loginName: 'test',
                    email: 'test@example.com',
                    password: 'test123',
                    roleCode: 'user',
                    phone: '13800000002',
                    gender: 'other',
                    remark: '测试用户账号'
                }
            ];
            for (const userData of users) {
                const existingUser = yield user_1.AdminUser.findOne({
                    loginName: userData.loginName,
                    platformId
                });
                if (!existingUser) {
                    const user = yield user_1.AdminUser.create({
                        nickname: userData.nickname,
                        loginName: userData.loginName,
                        email: userData.email,
                        password: (0, user_2.hashPassword)(userData.password),
                        phone: userData.phone,
                        gender: userData.gender,
                        remark: userData.remark,
                        platformId,
                        status: 'active',
                        createdBy: 'system',
                        updatedBy: 'system'
                    });
                    // 创建用户角色关联
                    const role = createdRoles[userData.roleCode];
                    if (role) {
                        yield userRole_1.UserRole.create({
                            userId: user.uuid,
                            roleId: role.uuid,
                            platformId,
                            status: 'active',
                            createdBy: 'system',
                            updatedBy: 'system'
                        });
                    }
                    console.log(`✓ 创建用户"${userData.nickname}"成功`);
                }
                else {
                    console.log(`- 用户"${userData.nickname}"已存在`);
                }
            }
            console.log('\n=== 初始化完成 ===');
            console.log('默认账号信息:');
            console.log('1. 超级管理员 - 用户名: super, 密码: super123');
            console.log('2. 系统管理员 - 用户名: admin, 密码: admin123');
            console.log('3. 测试用户 - 用户名: test, 密码: test123');
            console.log('\n已创建的角色:');
            console.log('- 超级管理员 (super_admin): 拥有所有菜单权限');
            console.log('- 系统管理员 (admin): 拥有系统管理权限');
            console.log('- 普通用户 (user): 拥有基本权限');
            console.log('\n已创建的菜单:');
            console.log('- 仪表盘');
            console.log('- 系统管理');
            console.log('  - 用户管理');
            console.log('  - 角色管理');
            console.log('  - 菜单管理');
            console.log('\n权限通过角色菜单关系表管理');
        }
        catch (error) {
            console.error('初始化数据失败:', error);
        }
        finally {
            process.exit(0);
        }
    });
}
initData();
