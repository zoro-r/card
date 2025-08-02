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
exports.authenticateToken = authenticateToken;
exports.optionalAuthenticateToken = optionalAuthenticateToken;
exports.requirePermission = requirePermission;
const user_1 = require("../service/user");
const tool_1 = require("../utils/tool");
const wechat_1 = require("../service/wechat");
// 需要跳过认证的路径
const skipAuthPaths = [
    '/api/user/login',
    '/api/health',
    '/api/ping'
];
// 需要跳过认证的路径前缀
const skipAuthPathPrefixes = [
    '/public/config', // 公开配置接口无需认证
    '/api/files/public', // 公开文件接口无需认证
    '/api/files/download',
    '/api/wechat', // 微信相关接口
    '/api/orders', // 订单相关接口（使用独立的authenticateToken中间件）
];
// JWT认证中间件
function authMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { path, method } = ctx.request;
        // 跳过静态文件请求（有文件扩展名的请求）
        if (require('path').extname(path) !== '') {
            yield next();
            return;
        }
        // 跳过前端页面路由（非API路由）
        if (!path.startsWith('/api/')) {
            yield next();
            return;
        }
        // 跳过不需要认证的路径
        if (skipAuthPaths.includes(path)) {
            yield next();
            return;
        }
        // 跳过不需要认证的路径前缀
        if (skipAuthPathPrefixes.some(prefix => path.startsWith(prefix))) {
            yield next();
            return;
        }
        // 获取token - 支持Header和URL参数两种方式
        let token = (_a = ctx.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        // 如果Header中没有token，尝试从URL参数中获取（用于文件预览等场景）
        if (!token && ctx.query.token) {
            token = ctx.query.token;
        }
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
/**
 * JWT认证中间件（微信生态专用）
 */
function authenticateToken(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = ctx.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) {
                ctx.status = 401;
                ctx.body = {
                    success: false,
                    message: '访问令牌缺失'
                };
                return;
            }
            // 验证token
            const decoded = wechat_1.WechatService.verifyToken(token);
            if (!decoded) {
                ctx.status = 401;
                ctx.body = {
                    success: false,
                    message: '访问令牌无效或已过期'
                };
                return;
            }
            // 将用户信息存储到上下文状态中
            ctx.state.user = decoded;
            yield next();
        }
        catch (error) {
            console.error('Token验证失败:', error);
            ctx.status = 401;
            ctx.body = {
                success: false,
                message: '认证失败'
            };
        }
    });
}
/**
 * 可选的JWT认证中间件（不强制要求登录）
 */
function optionalAuthenticateToken(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = ctx.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                const decoded = wechat_1.WechatService.verifyToken(token);
                if (decoded) {
                    ctx.state.user = decoded;
                }
            }
            yield next();
        }
        catch (error) {
            console.error('可选Token验证失败:', error);
            // 可选认证失败时不阻止请求继续
            yield next();
        }
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
