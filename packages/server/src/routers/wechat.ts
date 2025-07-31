import Router from '@koa/router';
import { WechatController } from '@/controller/wechat';
import { authenticateToken } from '@/middleware/auth';

const wechatRouter = new Router();

// 微信小程序用户相关路由
wechatRouter.post('/wechat/:platformId/login', WechatController.login);
wechatRouter.post('/wechat/:platformId/decrypt-userinfo', authenticateToken, WechatController.decryptUserInfo);
wechatRouter.post('/wechat/:platformId/decrypt-phone', authenticateToken, WechatController.decryptPhoneNumber);
wechatRouter.get('/wechat/:platformId/userinfo', authenticateToken, WechatController.getUserInfo);

// 微信支付相关路由
wechatRouter.post('/wechat/:platformId/payment/notify', WechatController.paymentNotify);
wechatRouter.get('/wechat/:platformId/payment/:outTradeNo/query', WechatController.queryPayment);
wechatRouter.post('/wechat/:platformId/payment/refund', WechatController.refund);

// 管理后台用户管理路由
wechatRouter.get('/admin/wechat/:platformId/users', WechatController.getUserList);
wechatRouter.put('/admin/wechat/:platformId/users/:userId/status', WechatController.updateUserStatus);

// 管理后台支付管理路由
wechatRouter.get('/admin/wechat/:platformId/payments', WechatController.getPaymentList);
wechatRouter.get('/admin/wechat/:platformId/payments/stats', WechatController.getPaymentStats);
wechatRouter.get('/admin/wechat/:platformId/payments/:paymentId', WechatController.getPaymentDetail);

export default function(router: Router) {
  router.use('/api', wechatRouter.routes());
}