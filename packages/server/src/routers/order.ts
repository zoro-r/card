import Router from '@koa/router';
import { OrderController } from '@/controller/order';
import { authenticateToken } from '@/middleware/auth';

const orderRouter = new Router();

// 用户订单相关路由
orderRouter.post('/orders', authenticateToken, OrderController.createOrder); // 微信小程序创建订单
orderRouter.post('/orders/:platformId', authenticateToken, OrderController.createOrder); // 兼容管理后台
orderRouter.post('/orders/:orderNo/payment', authenticateToken, OrderController.initiatePayment);
orderRouter.get('/orders/:orderNo', authenticateToken, OrderController.getOrderDetail);
orderRouter.get('/orders/:platformId/list', authenticateToken, OrderController.getUserOrders);
orderRouter.post('/orders/:orderNo/cancel', authenticateToken, OrderController.cancelOrder);
orderRouter.post('/orders/:orderNo/confirm-delivery', authenticateToken, OrderController.confirmDelivery);
orderRouter.get('/orders/:orderNo/payment-status', OrderController.queryPaymentStatus);

// 管理后台订单管理路由
orderRouter.get('/admin/orders', OrderController.getOrderList);
orderRouter.get('/admin/orders/:orderNo', OrderController.getAdminOrderDetail);
orderRouter.post('/admin/orders/:orderNo/ship', OrderController.shipOrder);
orderRouter.put('/admin/orders/:orderNo/remark', OrderController.updateOrderRemark);

export default function(router: Router) {
  router.use('/api', orderRouter.routes());
}