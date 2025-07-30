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
exports.authMiddleware = authMiddleware;
exports.requirePermission = requirePermission;
const user_1 = require("@/service/user");
const tool_1 = require("@/utils/tool");
// 需要跳过认证的路径
const skipAuthPaths = [
    '/api/user/login',
    '/api/health',
    '/api/ping'
];
// JWT认证中间件
function authMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { path, method } = ctx.request;
        // 跳过不需要认证的路径
        if (skipAuthPaths.includes(path)) {
            yield next();
            return;
        }
        // 获取token
        const token = (_a = ctx.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            ctx.status = 401;
            ctx.body = (0, tool_1.fail)('未提供认证令牌');
            return;
        }
        // 验证token
        const decoded = (0, user_1.verifyToken)(token);
        if (!decoded) {
            ctx.status = 401;
            ctx.body = (0, tool_1.fail)('无效的认证令牌');
            return;
        }
        // 将用户信息存储到ctx中
        ctx.state.user = decoded;
        yield next();
    });
}
// 权限验证中间件
function requirePermission(permission) {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        const user = ctx.state.user;
        if (!user) {
            ctx.status = 401;
            ctx.body = (0, tool_1.fail)('未认证');
            return;
        }
        // 这里可以根据用户信息查询用户权限
        // 为了简化，这里假设超级管理员有所有权限
        if (user.loginName === 'admin') {
            yield next();
            return;
        }
        // 实际项目中应该查询用户的权限列表
        // const userPermissions = await getUserPermissions(user.uuid);
        // if (!userPermissions.includes(permission)) {
        //   ctx.status = 403;
        //   ctx.body = fail('权限不足');
        //   return;
        // }
        yield next();
    });
}
