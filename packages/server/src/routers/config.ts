import Router from '@koa/router';
import { ConfigController } from '@/controller/config';

const configRouter = new Router({ prefix: '/api/config' });

// 管理员接口（需要认证）
configRouter.post('/', ConfigController.upsertConfig);
configRouter.get('/list', ConfigController.getAllConfigs);
configRouter.get('/:key', ConfigController.getConfig);
configRouter.delete('/:key', ConfigController.deleteConfig);

// 公开接口（供其他平台调用，无需认证）
const publicRouter = new Router({ prefix: '/public/config' });
publicRouter.get('/:key', ConfigController.getConfigData);

export { configRouter, publicRouter };