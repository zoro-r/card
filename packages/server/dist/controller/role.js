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
exports.getRoleListAPI = getRoleListAPI;
exports.getRoleByIdAPI = getRoleByIdAPI;
exports.createRoleAPI = createRoleAPI;
exports.updateRoleAPI = updateRoleAPI;
exports.deleteRoleAPI = deleteRoleAPI;
exports.batchDeleteRolesAPI = batchDeleteRolesAPI;
exports.getRoleMenusAPI = getRoleMenusAPI;
exports.updateRoleMenusAPI = updateRoleMenusAPI;
const tool_1 = require("../utils/tool");
const role_1 = require("../service/role");
const platform_1 = require("../utils/platform");
// 获取角色列表
function getRoleListAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { page = 1, pageSize = 10, name, code, status, platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const result = yield (0, role_1.getRoleList)({
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                name,
                code,
                status,
                platformId
            });
            ctx.body = (0, tool_1.success)(result);
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 获取角色详情
function getRoleByIdAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const role = yield (0, role_1.getRoleById)(uuid, platformId);
            if (!role) {
                ctx.body = (0, tool_1.fail)('角色不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(role);
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 创建角色
function createRoleAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const roleData = ctx.request.body;
            const { name, code, menuIds, platformId = (0, platform_1.getDefaultPlatformId)() } = roleData;
            // 验证必填字段
            if (!name || !code) {
                ctx.body = (0, tool_1.fail)('角色名称和代码不能为空');
                return;
            }
            // 检查角色代码是否已存在
            const codeExists = yield (0, role_1.checkRoleCodeExists)(code, undefined, platformId);
            if (codeExists) {
                ctx.body = (0, tool_1.fail)('角色代码已存在');
                return;
            }
            // 创建角色
            const role = yield (0, role_1.createRole)({
                name,
                code,
                description: roleData.description,
                status: roleData.status || 'active',
                platformId
            });
            // 如果有菜单ID，创建角色菜单关系
            if (menuIds && menuIds.length > 0) {
                yield (0, role_1.updateRoleMenus)(role.uuid, menuIds, platformId);
            }
            ctx.body = (0, tool_1.success)(role, '角色创建成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 更新角色
function updateRoleAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const roleData = ctx.request.body;
            const { code, menuIds, platformId = (0, platform_1.getDefaultPlatformId)() } = roleData;
            // 检查角色代码是否已存在（排除当前角色）
            if (code) {
                const codeExists = yield (0, role_1.checkRoleCodeExists)(code, uuid, platformId);
                if (codeExists) {
                    ctx.body = (0, tool_1.fail)('角色代码已存在');
                    return;
                }
            }
            // 更新角色基本信息
            const role = yield (0, role_1.updateRole)(uuid, {
                name: roleData.name,
                code: roleData.code,
                description: roleData.description,
                status: roleData.status
            }, platformId);
            if (!role) {
                ctx.body = (0, tool_1.fail)('角色不存在');
                return;
            }
            // 更新角色菜单关系
            if (menuIds !== undefined) {
                yield (0, role_1.updateRoleMenus)(uuid, menuIds, platformId);
            }
            ctx.body = (0, tool_1.success)(role, '角色更新成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 删除角色
function deleteRoleAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const role = yield (0, role_1.deleteRole)(uuid, platformId);
            if (!role) {
                ctx.body = (0, tool_1.fail)('角色不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(null, '角色删除成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 批量删除角色
function batchDeleteRolesAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuids } = ctx.request.body;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
                ctx.body = (0, tool_1.fail)('请提供要删除的角色ID列表');
                return;
            }
            yield (0, role_1.batchDeleteRoles)(uuids, platformId);
            ctx.body = (0, tool_1.success)(null, '角色批量删除成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 获取角色菜单
function getRoleMenusAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const menuIds = yield (0, role_1.getRoleMenus)(uuid, platformId);
            ctx.body = (0, tool_1.success)({ menuIds });
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 更新角色菜单
function updateRoleMenusAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { menuIds } = ctx.request.body;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            if (!Array.isArray(menuIds)) {
                ctx.body = (0, tool_1.fail)('菜单ID列表格式错误');
                return;
            }
            yield (0, role_1.updateRoleMenus)(uuid, menuIds, platformId);
            ctx.body = (0, tool_1.success)(null, '角色菜单更新成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
