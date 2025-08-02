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
exports.getMenuListAPI = getMenuListAPI;
exports.getMenuTreeAPI = getMenuTreeAPI;
exports.getMenuByIdAPI = getMenuByIdAPI;
exports.createMenuAPI = createMenuAPI;
exports.updateMenuAPI = updateMenuAPI;
exports.deleteMenuAPI = deleteMenuAPI;
exports.batchDeleteMenusAPI = batchDeleteMenusAPI;
const tool_1 = require("../utils/tool");
const menu_1 = require("../service/menu");
const platform_1 = require("../utils/platform");
// 获取菜单列表
function getMenuListAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { page = 1, pageSize = 10, name, type, status, platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const result = yield (0, menu_1.getMenuList)({
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                name,
                type,
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
// 获取菜单树结构
function getMenuTreeAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const result = yield (0, menu_1.getMenuTree)(platformId);
            ctx.body = (0, tool_1.success)(result);
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 获取菜单详情
function getMenuByIdAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const menu = yield (0, menu_1.getMenuById)(uuid, platformId);
            if (!menu) {
                ctx.body = (0, tool_1.fail)('菜单不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(menu);
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 创建菜单
function createMenuAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const menuData = ctx.request.body;
            const { name, platformId = (0, platform_1.getDefaultPlatformId)() } = menuData;
            // 验证必填字段
            if (!name) {
                ctx.body = (0, tool_1.fail)('菜单名称不能为空');
                return;
            }
            const menu = yield (0, menu_1.createMenu)(Object.assign(Object.assign({}, menuData), { platformId }));
            ctx.body = (0, tool_1.success)(menu, '菜单创建成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 更新菜单
function updateMenuAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const menuData = ctx.request.body;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = menuData;
            // 防止将菜单设置为自己的子菜单
            if (menuData.parentId === uuid) {
                ctx.body = (0, tool_1.fail)('不能将菜单设置为自己的子菜单');
                return;
            }
            const menu = yield (0, menu_1.updateMenu)(uuid, menuData, platformId);
            if (!menu) {
                ctx.body = (0, tool_1.fail)('菜单不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(menu, '菜单更新成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 删除菜单
function deleteMenuAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            const menu = yield (0, menu_1.deleteMenu)(uuid, platformId);
            if (!menu) {
                ctx.body = (0, tool_1.fail)('菜单不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(null, '菜单删除成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 批量删除菜单
function batchDeleteMenusAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuids } = ctx.request.body;
            const { platformId = (0, platform_1.getDefaultPlatformId)() } = ctx.request.query;
            if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
                ctx.body = (0, tool_1.fail)('请提供要删除的菜单ID列表');
                return;
            }
            yield (0, menu_1.batchDeleteMenus)(uuids, platformId);
            ctx.body = (0, tool_1.success)(null, '菜单批量删除成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
