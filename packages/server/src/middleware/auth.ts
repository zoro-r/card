import { Context, Next } from 'koa';
import { verifyToken } from '@/service/user';
import { fail } from '@/utils/tool';
import { WechatService } from '@/service/wechat';

// 需要跳过认证的路径
const skipAuthPaths = [
  '/api/user/login',
  '/api/health',
  '/api/ping',
];

// 需要跳过认证的路径前缀
const skipAuthPathPrefixes = [
  '/public/config', // 公开配置接口无需认证
  '/api/files/public', // 公开文件接口无需认证
  '/api/files/download',
  '/api/wechat', // 微信相关接口
  '/api/orders', // 订单相关接口（使用独立的authenticateToken中间件）
  '/api/admin/orders', // 管理后台订单接口
];

// JWT认证中间件
export async function authMiddleware(ctx: Context, next: Next) {
  const { path, method } = ctx.request;

  // 跳过静态文件请求（有文件扩展名的请求）
  if (require('path').extname(path) !== '') {
    await next();
    return;
  }

  // 跳过前端页面路由（非API路由）
  if (!path.startsWith('/api/')) {
    await next();
    return;
  }

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

  // 额外检查：如果是企业、名片或员工相关的API，全部跳过认证（临时用于测试）
  if (path.startsWith('/api/companies') || path.startsWith('/api/business-cards') || path.startsWith('/api/company-employees')) {
    await next();
    return;
  }

  // 获取token - 支持Header和URL参数两种方式
  let token = ctx.headers.authorization?.replace('Bearer ', '');

  // 如果Header中没有token，尝试从URL参数中获取（用于文件预览等场景）
  if (!token && ctx.query.token) {
    token = ctx.query.token as string;
  }

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

/**
 * JWT认证中间件（微信生态专用）
 */
export async function authenticateToken(ctx: Context, next: Next) {
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
    const decoded = WechatService.verifyToken(token);
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

    await next();
  } catch (error) {
    console.error('Token验证失败:', error);
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '认证失败'
    };
  }
}

/**
 * 可选的JWT认证中间件（不强制要求登录）
 */
export async function optionalAuthenticateToken(ctx: Context, next: Next) {
  try {
    const authHeader = ctx.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = WechatService.verifyToken(token);
      if (decoded) {
        ctx.state.user = decoded;
      }
    }

    await next();
  } catch (error) {
    console.error('可选Token验证失败:', error);
    // 可选认证失败时不阻止请求继续
    await next();
  }
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
