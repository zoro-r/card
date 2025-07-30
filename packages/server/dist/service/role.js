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
exports.getRoleList = getRoleList;
exports.getRoleById = getRoleById;
exports.createRole = createRole;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
exports.batchDeleteRoles = batchDeleteRoles;
exports.checkRoleCodeExists = checkRoleCodeExists;
exports.updateRoleMenus = updateRoleMenus;
exports.getRoleMenus = getRoleMenus;
const role_1 = require("../models/role");
const roleMenu_1 = require("../models/roleMenu");
// 获取角色列表
function getRoleList(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page = 1, pageSize = 10, name, code, status, platformId } = params;
        const skip = (page - 1) * pageSize;
        const query = {};
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
        const [roles, total] = yield Promise.all([
            role_1.Role.find(query)
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 }),
            role_1.Role.countDocuments(query)
        ]);
        // 为每个角色获取关联的菜单数量
        const rolesWithMenuCount = yield Promise.all(roles.map((role) => __awaiter(this, void 0, void 0, function* () {
            const roleObj = role.toObject();
            const menuCount = yield roleMenu_1.RoleMenu.countDocuments({
                roleId: role.uuid,
                status: 'active'
            });
            roleObj.menuCount = menuCount;
            return roleObj;
        })));
        return {
            list: rolesWithMenuCount,
            total,
            page,
            pageSize
        };
    });
}
// 根据ID获取角色详情
function getRoleById(uuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        const role = yield role_1.Role.findOne(query);
        if (!role) {
            return null;
        }
        const roleObj = role.toObject();
        // 获取角色关联的菜单IDs
        const roleMenus = yield roleMenu_1.RoleMenu.find({
            roleId: role.uuid,
            status: 'active'
        });
        roleObj.menuIds = roleMenus.map(rm => rm.menuId);
        return roleObj;
    });
}
// 创建角色
function createRole(roleData) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = new role_1.Role(roleData);
        return yield role.save();
    });
}
// 更新角色
function updateRole(uuid, roleData, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        return yield role_1.Role.findOneAndUpdate(query, Object.assign(Object.assign({}, roleData), { updatedAt: new Date() }), { new: true });
    });
}
// 删除角色
function deleteRole(uuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        // 删除角色菜单关联
        yield roleMenu_1.RoleMenu.deleteMany({ roleId: uuid });
        return yield role_1.Role.findOneAndDelete(query);
    });
}
// 批量删除角色
function batchDeleteRoles(uuids, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid: { $in: uuids } };
        if (platformId) {
            query.platformId = platformId;
        }
        // 删除角色菜单关联
        yield roleMenu_1.RoleMenu.deleteMany({ roleId: { $in: uuids } });
        return yield role_1.Role.deleteMany(query);
    });
}
// 检查角色代码是否存在
function checkRoleCodeExists(code, excludeUuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { code };
        if (excludeUuid) {
            query.uuid = { $ne: excludeUuid };
        }
        if (platformId) {
            query.platformId = platformId;
        }
        const role = yield role_1.Role.findOne(query);
        return !!role;
    });
}
// 更新角色菜单关系
function updateRoleMenus(roleId, menuIds, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        // 先删除原有关系
        yield roleMenu_1.RoleMenu.deleteMany({
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
            yield roleMenu_1.RoleMenu.insertMany(roleMenus);
        }
        return true;
    });
}
// 获取角色的菜单列表
function getRoleMenus(roleId, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { roleId, status: 'active' };
        if (platformId) {
            query.platformId = platformId;
        }
        const roleMenus = yield roleMenu_1.RoleMenu.find(query);
        return roleMenus.map(rm => rm.menuId);
    });
}
