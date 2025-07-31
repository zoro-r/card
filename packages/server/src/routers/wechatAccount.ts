import Router from '@koa/router';
import { WechatAccountController } from '@/controller/wechatAccount';
import { authMiddleware } from '@/middleware/auth';

const wechatAccountRouter = new Router();

// 微信账号管理路由
wechatAccountRouter.get('/admin/wechat-accounts', authMiddleware, WechatAccountController.getWechatAccountList);
wechatAccountRouter.post('/admin/wechat-accounts', authMiddleware, WechatAccountController.createWechatAccount);
wechatAccountRouter.get('/admin/wechat-accounts/stats', authMiddleware, WechatAccountController.getWechatAccountStats);
wechatAccountRouter.get('/admin/wechat-accounts/options', authMiddleware, WechatAccountController.getWechatAccountOptions);
wechatAccountRouter.post('/admin/wechat-accounts/batch', authMiddleware, WechatAccountController.batchOperateWechatAccounts);

wechatAccountRouter.get('/admin/wechat-accounts/:accountId', authMiddleware, WechatAccountController.getWechatAccountDetail);
wechatAccountRouter.put('/admin/wechat-accounts/:accountId', authMiddleware, WechatAccountController.updateWechatAccount);
wechatAccountRouter.delete('/admin/wechat-accounts/:accountId', authMiddleware, WechatAccountController.deleteWechatAccount);
wechatAccountRouter.post('/admin/wechat-accounts/:accountId/activate', authMiddleware, WechatAccountController.activateWechatAccount);
wechatAccountRouter.post('/admin/wechat-accounts/:accountId/suspend', authMiddleware, WechatAccountController.suspendWechatAccount);
wechatAccountRouter.post('/admin/wechat-accounts/:accountId/test', authMiddleware, WechatAccountController.testWechatAccountConfig);

// 获取指定平台的微信账号列表（用于下拉选择等）
wechatAccountRouter.get('/admin/platforms/:platformId/wechat-accounts', authMiddleware, WechatAccountController.getPlatformWechatAccounts);

export default function(router: Router) {
  router.use('/api', wechatAccountRouter.routes());
}