import Router from '@koa/router';
import { WechatController } from '@/controller/wechat';
import { authenticateToken } from '@/middleware/auth';

const wechatRouter = new Router();

// 微信小程序用户相关路由
wechatRouter.post('/wechat/login', WechatController.login); // 使用appId作为请求参数
wechatRouter.post('/wechat/decrypt-userinfo', authenticateToken, WechatController.decryptUserInfo);
wechatRouter.post('/wechat/decrypt-phone', authenticateToken, WechatController.decryptPhoneNumber);
wechatRouter.get('/wechat/userinfo', authenticateToken, WechatController.getUserInfo);

// 微信支付相关路由
wechatRouter.post('/wechat/accounts/:appId/payment/notify', WechatController.paymentNotify);
wechatRouter.get('/wechat/accounts/:accountId/payment/:outTradeNo/query', WechatController.queryPayment);
wechatRouter.post('/wechat/accounts/:accountId/payment/refund', WechatController.refund);

// 管理后台用户管理路由
wechatRouter.get('/admin/wechat/accounts/:accountId/users', WechatController.getUserList);
wechatRouter.put('/admin/wechat/accounts/:accountId/users/:userId/status', WechatController.updateUserStatus);

// 管理后台支付管理路由
wechatRouter.get('/admin/wechat/accounts/:accountId/payments', WechatController.getPaymentList);
wechatRouter.get('/admin/wechat/accounts/:accountId/payments/stats', WechatController.getPaymentStats);
wechatRouter.get('/admin/wechat/accounts/:accountId/payments/:paymentId', WechatController.getPaymentDetail);

export default function(router: Router) {
  router.use('/api', wechatRouter.routes());
}