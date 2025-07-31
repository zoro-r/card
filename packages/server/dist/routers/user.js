"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRouter;
const user_1 = require("../controller/user");
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
    // 重置用户密码接口
    router.post('/api/users/:uuid/reset-password', user_1.resetUserPasswordAPI);
    // 用户修改自己的密码接口
    router.post('/api/user/change-password', user_1.changePasswordAPI);
    // 首次修改密码接口
    router.post('/api/user/first-time-change-password', user_1.firstTimeChangePasswordAPI);
    // 用户更新自己的个人信息接口
    router.put('/api/user/profile', user_1.updateProfileAPI);
}
