import { Context, Next } from 'koa';
import { fail } from '@/utils/tool';

// 权限验证中间件
export function requirePermission(permission: string) {
  return async (ctx: Context, next: Next) => {
    const { path } = ctx.request;
    
    // 如果是企业相关API，暂时跳过权限检查（与auth中间件保持一致）
    if (path.startsWith('/api/companies') || path.startsWith('/api/employees')) {
      await next();
      return;
    }

    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = fail('未认证');
      return;
    }

    // 这里可以根据用户信息查询用户权限
    // 为了简化，这里假设超级管理员有所有权限
    if (user.loginName === 'super' || user.loginName === 'admin') {
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

    // 临时：允许所有已认证用户访问
    await next();
  };
}