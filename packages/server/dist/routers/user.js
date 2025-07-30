"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRouter;
const user_1 = require("@/controller/user");
function userRouter(router) {
    // 用户登录
    router.post('/api/user/login', user_1.userLogin);
    // 获取用户信息
    router.get('/api/user/info', user_1.getUserInfo);
    // 用户管理接口
    router.get('/api/users', user_1.getUserListAPI);
    router.post('/api/users', user_1.createUserAPI);
    router.put('/api/users/:uuid', user_1.updateUserAPI);
    router.delete('/api/users/:uuid', user_1.deleteUserAPI);
    router.post('/api/users/batch-delete', user_1.batchDeleteUsersAPI);
    // 用户角色管理接口
    router.put('/api/users/:uuid/roles', user_1.updateUserRolesAPI);
}
