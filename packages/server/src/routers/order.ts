import Router from '@koa/router';
import { OrderController } from '@/controller/order';
import { authenticateToken } from '@/middleware/auth';

const orderRouter = new Router();

// 用户订单相关路由
orderRouter.post('/orders/:platformId', authenticateToken, OrderController.createOrder);
orderRouter.post('/orders/:orderNo/payment', authenticateToken, OrderController.initiatePayment);
orderRouter.get('/orders/:orderNo', authenticateToken, OrderController.getOrderDetail);
orderRouter.get('/orders/:platformId/list', authenticateToken, OrderController.getUserOrders);
orderRouter.post('/orders/:orderNo/cancel', authenticateToken, OrderController.cancelOrder);
orderRouter.post('/orders/:orderNo/confirm-delivery', authenticateToken, OrderController.confirmDelivery);
orderRouter.get('/orders/:orderNo/payment-status', OrderController.queryPaymentStatus);

// 管理后台订单管理路由
orderRouter.get('/admin/orders/:platformId', OrderController.getOrderList);
orderRouter.post('/admin/orders/:orderNo/ship', OrderController.shipOrder);
orderRouter.get('/admin/orders/:platformId/stats', OrderController.getOrderStats);
orderRouter.put('/admin/orders/:orderNo/remark', OrderController.updateOrderRemark);

export default function(router: Router) {
  router.use('/api', orderRouter.routes());
}