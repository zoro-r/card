import Router from '@koa/router';
import userRouter from './user';
import roleRouter from './role';
import menuRouter from './menu';
import fileRouter from './file';
import wechatRouter from './wechat';
import orderRouter from './order';
import { configRouter, publicRouter } from './config';

export function initRouter(app: any) {
  const router = new Router();

  // 注册子路由
  userRouter(router);
  roleRouter(router);
  menuRouter(router);
  fileRouter(router);
  wechatRouter(router);
  orderRouter(router);

  // 注册配置路由
  app.use(configRouter.routes());
  app.use(configRouter.allowedMethods());

  // 注册公开配置路由
  app.use(publicRouter.routes());
  app.use(publicRouter.allowedMethods());

  app.use(router.routes());
  app.use(router.allowedMethods());
}
