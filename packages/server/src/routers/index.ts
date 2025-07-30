import Router from '@koa/router';
import userRouter from './user';
import roleRouter from './role';
import menuRouter from './menu';

export function initRouter(app: any) {
  const router = new Router();

  // 注册子路由
  userRouter(router);
  roleRouter(router);
  menuRouter(router);

  app.use(router.routes());
  app.use(router.allowedMethods());
}
