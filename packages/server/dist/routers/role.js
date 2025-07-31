"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = roleRouter;
const role_1 = require("../controller/role");
function roleRouter(router) {
    // 角色管理接口
    router.get('/api/roles', role_1.getRoleListAPI);
    router.get('/api/roles/:uuid', role_1.getRoleByIdAPI);
    router.post('/api/roles', role_1.createRoleAPI);
    router.put('/api/roles/:uuid', role_1.updateRoleAPI);
    router.delete('/api/roles/:uuid', role_1.deleteRoleAPI);
    router.post('/api/roles/batch-delete', role_1.batchDeleteRolesAPI);
    // 角色菜单关系接口
    router.get('/api/roles/:uuid/menus', role_1.getRoleMenusAPI);
    router.put('/api/roles/:uuid/menus', role_1.updateRoleMenusAPI);
}
