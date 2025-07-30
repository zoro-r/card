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
exports.getMenuList = getMenuList;
exports.getMenuTree = getMenuTree;
exports.getMenuById = getMenuById;
exports.createMenu = createMenu;
exports.updateMenu = updateMenu;
exports.deleteMenu = deleteMenu;
exports.batchDeleteMenus = batchDeleteMenus;
const menu_1 = require("../models/menu");
// 获取菜单列表
function getMenuList(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { page = 1, pageSize = 10, name, type, status, platformId } = params;
        const skip = (page - 1) * pageSize;
        const query = {};
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
        const [menus, total] = yield Promise.all([
            menu_1.Menu.find(query)
                .skip(skip)
                .limit(pageSize)
                .sort({ sort: 1, createdAt: -1 }),
            menu_1.Menu.countDocuments(query)
        ]);
        return {
            list: menus,
            total,
            page,
            pageSize
        };
    });
}
// 获取菜单树结构
function getMenuTree(platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { status: 'active' };
        if (platformId) {
            query.platformId = platformId;
        }
        const menus = yield menu_1.Menu.find(query).sort({ sort: 1 });
        return buildMenuTree(menus);
    });
}
// 构建菜单树
function buildMenuTree(menus) {
    const menuMap = new Map();
    const roots = [];
    // 先创建所有菜单项的映射
    menus.forEach(menu => {
        menuMap.set(menu.uuid, Object.assign(Object.assign({}, menu.toObject()), { children: [] }));
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
// 根据ID获取菜单详情
function getMenuById(uuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        return yield menu_1.Menu.findOne(query);
    });
}
// 创建菜单
function createMenu(menuData) {
    return __awaiter(this, void 0, void 0, function* () {
        const menu = new menu_1.Menu(menuData);
        return yield menu.save();
    });
}
// 更新菜单
function updateMenu(uuid, menuData, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        return yield menu_1.Menu.findOneAndUpdate(query, Object.assign(Object.assign({}, menuData), { updatedAt: new Date() }), { new: true });
    });
}
// 删除菜单
function deleteMenu(uuid, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid };
        if (platformId) {
            query.platformId = platformId;
        }
        // 检查是否有子菜单
        const childCount = yield menu_1.Menu.countDocuments({ parentId: uuid });
        if (childCount > 0) {
            throw new Error('该菜单下有子菜单，不能删除');
        }
        return yield menu_1.Menu.findOneAndDelete(query);
    });
}
// 批量删除菜单
function batchDeleteMenus(uuids, platformId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { uuid: { $in: uuids } };
        if (platformId) {
            query.platformId = platformId;
        }
        // 检查是否有子菜单
        for (const uuid of uuids) {
            const childCount = yield menu_1.Menu.countDocuments({ parentId: uuid });
            if (childCount > 0) {
                const menu = yield menu_1.Menu.findOne({ uuid });
                throw new Error(`菜单"${menu === null || menu === void 0 ? void 0 : menu.name}"下有子菜单，不能删除`);
            }
        }
        return yield menu_1.Menu.deleteMany(query);
    });
}
