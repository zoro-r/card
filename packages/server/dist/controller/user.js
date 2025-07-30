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
exports.userLogin = userLogin;
exports.getUserInfo = getUserInfo;
exports.getUserListAPI = getUserListAPI;
exports.createUserAPI = createUserAPI;
exports.updateUserAPI = updateUserAPI;
exports.deleteUserAPI = deleteUserAPI;
exports.batchDeleteUsersAPI = batchDeleteUsersAPI;
exports.updateUserRolesAPI = updateUserRolesAPI;
const tool_1 = require("@/utils/tool");
const user_1 = require("@/service/user");
// 用户登录
function userLogin(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { loginName, password, platformId } = ctx.request.body;
            if (!loginName || !password || !platformId) {
                ctx.body = (0, tool_1.fail)('登录名、密码和平台ID不能为空');
                return;
            }
            const result = yield (0, user_1.login)(loginName, password, platformId);
            ctx.body = (0, tool_1.success)(result, '登录成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 获取用户信息
function getUserInfo(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = ctx.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            if (!token) {
                ctx.status = 401;
                ctx.body = (0, tool_1.fail)('未提供认证令牌');
                return;
            }
            const decoded = (0, user_1.verifyToken)(token);
            if (!decoded) {
                ctx.status = 401;
                ctx.body = (0, tool_1.fail)('无效的认证令牌');
                return;
            }
            const user = yield (0, user_1.getUserById)(decoded.uuid, decoded.platformId);
            if (!user) {
                ctx.status = 401;
                ctx.body = (0, tool_1.fail)('用户不存在');
                return;
            }
            // 获取用户菜单
            const menus = yield (0, user_1.getUserMenus)(decoded.uuid, decoded.platformId);
            ctx.body = (0, tool_1.success)(Object.assign(Object.assign({}, user), { menus }));
        }
        catch (err) {
            ctx.status = 500;
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 获取用户列表
function getUserListAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { page = 1, pageSize = 10, name, loginName, status, platformId = 'default' } = ctx.request.query;
            const result = yield (0, user_1.getUserList)({
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                name,
                loginName,
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
// 创建用户
function createUserAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userData = ctx.request.body;
            const { loginName, email, phone, password, platformId = 'default' } = userData;
            // 验证必填字段
            if (!loginName || !email || !password) {
                ctx.body = (0, tool_1.fail)('登录名、邮箱和密码不能为空');
                return;
            }
            // 检查登录名是否已存在
            const loginNameExists = yield (0, user_1.checkLoginNameExists)(loginName, undefined, platformId);
            if (loginNameExists) {
                ctx.body = (0, tool_1.fail)('登录名已存在');
                return;
            }
            // 检查邮箱是否已存在
            const emailExists = yield (0, user_1.checkEmailExists)(email, undefined, platformId);
            if (emailExists) {
                ctx.body = (0, tool_1.fail)('邮箱已存在');
                return;
            }
            // 检查手机号是否已存在
            if (phone) {
                const phoneExists = yield (0, user_1.checkPhoneExists)(phone, undefined, platformId);
                if (phoneExists) {
                    ctx.body = (0, tool_1.fail)('手机号已存在');
                    return;
                }
            }
            // 密码加密
            const hashedPassword = (0, user_1.hashPassword)(password);
            const user = yield (0, user_1.createUser)(Object.assign(Object.assign({}, userData), { password: hashedPassword, platformId }));
            ctx.body = (0, tool_1.success)(user, '用户创建成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 更新用户
function updateUserAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const userData = ctx.request.body;
            const { loginName, email, phone, password, platformId = 'default' } = userData;
            // 检查登录名是否已存在（排除当前用户）
            if (loginName) {
                const loginNameExists = yield (0, user_1.checkLoginNameExists)(loginName, uuid, platformId);
                if (loginNameExists) {
                    ctx.body = (0, tool_1.fail)('登录名已存在');
                    return;
                }
            }
            // 检查邮箱是否已存在（排除当前用户）
            if (email) {
                const emailExists = yield (0, user_1.checkEmailExists)(email, uuid, platformId);
                if (emailExists) {
                    ctx.body = (0, tool_1.fail)('邮箱已存在');
                    return;
                }
            }
            // 检查手机号是否已存在（排除当前用户）
            if (phone) {
                const phoneExists = yield (0, user_1.checkPhoneExists)(phone, uuid, platformId);
                if (phoneExists) {
                    ctx.body = (0, tool_1.fail)('手机号已存在');
                    return;
                }
            }
            // 如果有新密码，需要加密
            if (password) {
                userData.password = (0, user_1.hashPassword)(password);
            }
            const user = yield (0, user_1.updateUser)(uuid, userData, platformId);
            if (!user) {
                ctx.body = (0, tool_1.fail)('用户不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(user, '用户更新成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 删除用户
function deleteUserAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { platformId = 'default' } = ctx.request.query;
            const user = yield (0, user_1.deleteUser)(uuid, platformId);
            if (!user) {
                ctx.body = (0, tool_1.fail)('用户不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(null, '用户删除成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 批量删除用户
function batchDeleteUsersAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuids } = ctx.request.body;
            const { platformId = 'default' } = ctx.request.query;
            if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
                ctx.body = (0, tool_1.fail)('请提供要删除的用户ID列表');
                return;
            }
            yield (0, user_1.batchDeleteUsers)(uuids, platformId);
            ctx.body = (0, tool_1.success)(null, '用户批量删除成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
// 更新用户角色
function updateUserRolesAPI(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { uuid } = ctx.params;
            const { roleIds } = ctx.request.body;
            const { platformId = 'default' } = ctx.request.query;
            if (!Array.isArray(roleIds)) {
                ctx.body = (0, tool_1.fail)('角色ID列表格式错误');
                return;
            }
            const user = yield (0, user_1.updateUserRoles)(uuid, roleIds, platformId);
            if (!user) {
                ctx.body = (0, tool_1.fail)('用户不存在');
                return;
            }
            ctx.body = (0, tool_1.success)(user, '用户角色更新成功');
        }
        catch (err) {
            ctx.body = (0, tool_1.fail)(err.message);
        }
    });
}
