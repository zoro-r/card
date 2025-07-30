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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.login = login;
exports.getUserPermissionsByRoles = getUserPermissionsByRoles;
exports.getUserMenus = getUserMenus;
exports.getUserList = getUserList;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.updateUserRoles = updateUserRoles;
exports.deleteUser = deleteUser;
exports.batchDeleteUsers = batchDeleteUsers;
exports.checkLoginNameExists = checkLoginNameExists;
exports.checkEmailExists = checkEmailExists;
exports.checkPhoneExists = checkPhoneExists;
const user_1 = require("../models/user");
const role_1 = require("../models/role");
const userRole_1 = require("../models/userRole");
const menu_1 = require("../models/menu");
const roleMenu_1 = require("../models/roleMenu");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// 密码加密
function hashPassword(password) {
    return crypto_1.default.createHash('sha256').update(password).digest('hex');
}
// 验证密码
function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}
// 生成JWT Token
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
// 验证JWT Token
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
// 用户登录
function login(loginName, password, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_1.AdminUser.findOne({
            loginName,
            platformId,
            status: 'active'
        });
        if (!user) {
            throw new Error('用户不存在或已被禁用');
        }
        if (!verifyPassword(password, user.password)) {
            throw new Error('密码错误');
        }
        // 更新最后登录时间
        user.lastLoginAt = new Date();
        yield user.save();
        // 获取用户角色
        const userRoles = yield userRole_1.UserRole.find({ userId: user.uuid });
        const roleIds = userRoles.map(ur => ur.roleId);
        let roles = [];
        let permissions = [];
        if (roleIds.length > 0) {
            roles = yield role_1.Role.find({
                uuid: { $in: roleIds },
                status: 'active'
            });
            // 通过角色菜单关系获取权限
            permissions = yield getUserPermissionsByRoles(roleIds, platformId);
        }
        // 获取用户菜单
        const menus = yield getUserMenus(user.uuid, platformId);
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
    });
}
// 通过角色获取用户权限
function getUserPermissionsByRoles(roleIds, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取角色菜单关系
        const roleMenus = yield roleMenu_1.RoleMenu.find({
            roleId: { $in: roleIds },
            platformId,
            status: 'active'
        });
        const menuIds = roleMenus.map(rm => rm.menuId);
        if (menuIds.length === 0) {
            return [];
        }
        // 获取菜单权限
        const menus = yield menu_1.Menu.find({
            uuid: { $in: menuIds },
            platformId,
            status: 'active',
            permission: { $exists: true, $ne: null }
        });
        // 去重并返回权限列表
        const permissions = [...new Set(menus.map(menu => menu.permission).filter(Boolean))];
        return permissions;
    });
}
// 获取用户菜单
function getUserMenus(userUuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取用户角色
        const userRoles = yield userRole_1.UserRole.find({ userId: userUuid });
        const roleIds = userRoles.map(ur => ur.roleId);
        if (roleIds.length === 0) {
            return [];
        }
        // 获取角色菜单关系
        const roleMenus = yield roleMenu_1.RoleMenu.find({
            roleId: { $in: roleIds },
            platformId,
            status: 'active'
        });
        const menuIds = roleMenus.map(rm => rm.menuId);
        if (menuIds.length === 0) {
            return [];
        }
        // 获取菜单
        const menus = yield menu_1.Menu.find({
            uuid: { $in: menuIds },
            platformId,
            status: 'active'
        }).sort({ sort: 1 });
        // 构建菜单树
        return buildMenuTree(menus);
    });
}
// 构建菜单树
function buildMenuTree(menus) {
    const menuMap = new Map();
    const roots = [];
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
        }
        else {
            roots.push(menuItem);
        }
    });
    return roots;
}
// 获取用户列表
function getUserList(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page = 1, pageSize = 10, name, loginName, status, platformId } = params;
        const skip = (page - 1) * pageSize;
        const query = {};
        if (name) {
            query.nickname = new RegExp(name, 'i');
        }
        if (loginName) {
            query.loginName = new RegExp(loginName, 'i');
        }
        if (status) {
            query.status = status;
        }
        if (platformId) {
            query.platformId = platformId;
        }
        const [users, total] = yield Promise.all([
            user_1.AdminUser.find(query)
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 })
                .select('-password'),
            user_1.AdminUser.countDocuments(query)
        ]);
        // 获取用户角色信息（通过中间表）
        const usersWithRoles = yield Promise.all(users.map((user) => __awaiter(this, void 0, void 0, function* () {
            const userObj = user.toObject();
            // 查找用户所有角色
            const userRoles = yield userRole_1.UserRole.find({ userId: userObj.uuid });
            const roleIds = userRoles.map(ur => ur.roleId);
            if (roleIds.length > 0) {
                const roles = yield role_1.Role.find({
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
            }
            else {
                userObj.roles = [];
            }
            return userObj;
        })));
        return {
            list: usersWithRoles,
            total,
            page,
            pageSize
        };
    });
}
// 根据ID获取用户详情
function getUserById(uuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        const user = yield user_1.AdminUser.findOne(query).select('-password');
        if (!user)
            return null;
        const userObj = user.toObject();
        // 查找用户所有角色
        const userRoles = yield userRole_1.UserRole.find({ userId: userObj.uuid });
        const roleIds = userRoles.map(ur => ur.roleId);
        if (roleIds.length > 0) {
            const roles = yield role_1.Role.find({
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
        }
        else {
            userObj.roles = [];
        }
        return userObj;
    });
}
// 创建用户
function createUser(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = new user_1.AdminUser(userData);
        return yield user.save();
    });
}
// 更新用户
function updateUser(uuid, userData, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        const user = yield user_1.AdminUser.findOneAndUpdate(query, Object.assign(Object.assign({}, userData), { updatedAt: new Date() }), { new: true }).select('-password');
        if (!user)
            return null;
        const userObj = user.toObject();
        // 查找用户所有角色
        const userRoles = yield userRole_1.UserRole.find({ userId: userObj.uuid });
        const roleIds = userRoles.map(ur => ur.roleId);
        if (roleIds.length > 0) {
            const roles = yield role_1.Role.find({
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
        }
        else {
            userObj.roles = [];
        }
        return userObj;
    });
}
// 更新用户角色（重置为新角色集）
function updateUserRoles(uuid, roleIds, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        const user = yield user_1.AdminUser.findOne(query);
        if (!user)
            return null;
        // 先删除原有角色（本平台）
        yield userRole_1.UserRole.deleteMany({ userId: uuid, platformId });
        // 再插入新角色
        if (roleIds && roleIds.length > 0) {
            yield userRole_1.UserRole.insertMany(roleIds.map(roleId => ({
                userId: uuid,
                roleId,
                platformId,
                status: 'active',
            })));
        }
        // 返回用户详情
        return getUserById(uuid, platformId);
    });
}
// 删除用户
function deleteUser(uuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        // 删除用户角色关联
        yield userRole_1.UserRole.deleteMany({ userId: uuid });
        return yield user_1.AdminUser.findOneAndDelete(query);
    });
}
// 批量删除用户
function batchDeleteUsers(uuids, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid: { $in: uuids } };
        if (platformId) {
            query.platformId = platformId;
        }
        // 删除用户角色关联
        yield userRole_1.UserRole.deleteMany({ userId: { $in: uuids } });
        return yield user_1.AdminUser.deleteMany(query);
    });
}
// 检查登录名是否存在
function checkLoginNameExists(loginName, excludeUuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { loginName };
        if (excludeUuid) {
            query.uuid = { $ne: excludeUuid };
        }
        if (platformId) {
            query.platformId = platformId;
        }
        const user = yield user_1.AdminUser.findOne(query);
        return !!user;
    });
}
// 检查邮箱是否存在
function checkEmailExists(email, excludeUuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { email };
        if (excludeUuid) {
            query.uuid = { $ne: excludeUuid };
        }
        if (platformId) {
            query.platformId = platformId;
        }
        const user = yield user_1.AdminUser.findOne(query);
        return !!user;
    });
}
// 检查手机号是否存在
function checkPhoneExists(phone, excludeUuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { phone };
        if (excludeUuid) {
            query.uuid = { $ne: excludeUuid };
        }
        if (platformId) {
            query.platformId = platformId;
        }
        const user = yield user_1.AdminUser.findOne(query);
        return !!user;
    });
}
