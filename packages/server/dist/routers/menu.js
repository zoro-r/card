"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = menuRouter;
const menu_1 = require("@/controller/menu");
function menuRouter(router) {
    // 菜单管理接口
    router.get('/api/menus', menu_1.getMenuListAPI);
    router.get('/api/menus/tree', menu_1.getMenuTreeAPI);
    router.get('/api/menus/:uuid', menu_1.getMenuByIdAPI);
    router.post('/api/menus', menu_1.createMenuAPI);
    router.put('/api/menus/:uuid', menu_1.updateMenuAPI);
    router.delete('/api/menus/:uuid', menu_1.deleteMenuAPI);
    router.post('/api/menus/batch-delete', menu_1.batchDeleteMenusAPI);
}
