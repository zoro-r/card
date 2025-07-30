import { Context, Next } from 'koa';
import { verifyToken } from '@/service/user';
import { fail } from '@/utils/tool';

// 需要跳过认证的路径
const skipAuthPaths = [
  '/api/user/login',
  '/api/health',
  '/api/ping'
];

// 需要跳过认证的路径前缀
const skipAuthPathPrefixes = [
  '/public/config' // 公开配置接口无需认证
];

// JWT认证中间件
export async function authMiddleware(ctx: Context, next: Next) {
  const { path, method } = ctx.request;
  
  // 跳过不需要认证的路径
  if (skipAuthPaths.includes(path)) {
    await next();
    return;
  }
  
  // 跳过不需要认证的路径前缀
  if (skipAuthPathPrefixes.some(prefix => path.startsWith(prefix))) {
    await next();
    return;
  }

  // 获取token
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    ctx.status = 401;
    ctx.body = fail('未提供认证令牌');
    return;
  }

  // 验证token
  const decoded = verifyToken(token);
  if (!decoded) {
    ctx.status = 401;
    ctx.body = fail('无效的认证令牌');
    return;
  }

  // 将用户信息存储到ctx中
  ctx.state.user = decoded;
  
  await next();
}

// 权限验证中间件
export function requirePermission(permission: string) {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;
    
    if (!user) {
      ctx.status = 401;
      ctx.body = fail('未认证');
      return;
    }

    // 这里可以根据用户信息查询用户权限
    // 为了简化，这里假设超级管理员有所有权限
    if (user.loginName === 'admin') {
      await next();
      return;
    }

    // 实际项目中应该查询用户的权限列表
    // const userPermissions = await getUserPermissions(user.uuid);
    // if (!userPermissions.includes(permission)) {
    //   ctx.status = 403;
    //   ctx.body = fail('权限不足');
    //   return;
    // }

    await next();
  };
}