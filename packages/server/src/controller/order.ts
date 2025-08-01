import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import { OrderService } from '@/service/order';
import { OrderStatus, OrderType } from '@/models/order';
import { WechatService } from '@/service/wechat';

/**
 * 订单控制器
 */
export class OrderController {
  /**
   * 创建订单
   */
  static async createOrder(ctx: Context) {
    try {
      let { platformId } = ctx.params;
      const orderData = ctx.request.body as any;

      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      let userId = null;
      let openid = null;

      if (tokenData) {
        if (tokenData.type === 'wechat') {
          openid = tokenData.openid;
          // 如果没有提供platformId，从token中获取appId作为platformId
          if (!platformId) {
            platformId = tokenData.appId;
          }
        } else {
          userId = tokenData.userId;
        }
      }

      // 验证platformId
      if (!platformId) {
        ctx.body = fail('缺少平台标识');
        return;
      }

      // 验证必要参数
      if (!orderData?.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        ctx.body = fail('商品信息不能为空');
        return;
      }

      // 创建订单
      const orderService = new OrderService();
      const order = await orderService.createOrder(userId, openid, platformId, orderData);

      ctx.body = success(order, '创建订单成功');
    } catch (error) {
      console.error('创建订单失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '创建订单失败');
    }
  }

  /**
   * 发起支付
   */
  static async initiatePayment(ctx: Context) {
    try {
      const { orderNo } = ctx.params;
      const clientIp = ctx.ip || ctx.request.ip || '127.0.0.1';

      // 发起微信支付
      const orderService = new OrderService();
      const paymentResult = await orderService.initiateWechatPayment(orderNo, clientIp);

      ctx.body = success(paymentResult, '发起支付成功');
    } catch (error) {
      console.error('发起支付失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '发起支付失败');
    }
  }

  /**
   * 查询订单详情
   */
  static async getOrderDetail(ctx: Context) {
    try {
      const { orderNo } = ctx.params;

      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      let userId = undefined;
      let openid = undefined;

      if (tokenData) {
        if (tokenData.type === 'wechat') {
          openid = tokenData.openid;
        } else {
          userId = tokenData.userId;
        }
      }

      // 查询订单详情
      const orderService = new OrderService();
      const order = await orderService.getOrderDetail(orderNo, userId, openid);

      if (!order) {
        ctx.body = fail('订单不存在');
        return;
      }

      ctx.body = success(order, '获取订单详情成功');
    } catch (error) {
      console.error('获取订单详情失败:', error);
      ctx.body = fail('获取订单详情失败');
    }
  }

  /**
   * 获取用户订单列表
   */
  static async getUserOrders(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { status, page = '1', limit = '20' } = ctx.query as {
        status?: string;
        page?: string;
        limit?: string;
      };

      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      let userId = null;
      let openid = null;

      if (tokenData) {
        if (tokenData.type === 'wechat') {
          openid = tokenData.openid;
        } else {
          userId = tokenData.userId;
        }
      } else {
        ctx.body = fail('用户未登录');
        return;
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const orderStatus = status as OrderStatus | undefined;

      // 获取用户订单列表
      const orderService = new OrderService();
      const result = await orderService.getUserOrders(
        userId,
        openid,
        platformId,
        orderStatus,
        pageNum,
        limitNum
      );

      ctx.body = success(result, '获取订单列表成功');
    } catch (error) {
      console.error('获取订单列表失败:', error);
      ctx.body = fail('获取订单列表失败');
    }
  }

  /**
   * 取消订单
   */
  static async cancelOrder(ctx: Context) {
    try {
      const { orderNo } = ctx.params;
      const { reason } = ctx.request.body as { reason?: string };

      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      let userId = undefined;
      let openid = undefined;

      if (tokenData) {
        if (tokenData.type === 'wechat') {
          openid = tokenData.openid;
        } else {
          userId = tokenData.userId;
        }
      } else {
        ctx.body = fail('用户未登录');
        return;
      }

      // 取消订单
      const orderService = new OrderService();
      await orderService.cancelOrder(orderNo, userId, openid, reason);

      ctx.body = success(null, '取消订单成功');
    } catch (error) {
      console.error('取消订单失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '取消订单失败');
    }
  }

  /**
   * 确认收货
   */
  static async confirmDelivery(ctx: Context) {
    try {
      const { orderNo } = ctx.params;

      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      let userId = undefined;
      let openid = undefined;

      if (tokenData) {
        if (tokenData.type === 'wechat') {
          openid = tokenData.openid;
        } else {
          userId = tokenData.userId;
        }
      } else {
        ctx.body = fail('用户未登录');
        return;
      }

      // 确认收货
      const orderService = new OrderService();
      await orderService.confirmDelivery(orderNo, userId, openid);

      ctx.body = success(null, '确认收货成功');
    } catch (error) {
      console.error('确认收货失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '确认收货失败');
    }
  }

  /**
   * 查询支付状态
   */
  static async queryPaymentStatus(ctx: Context) {
    try {
      const { orderNo } = ctx.params;

      // 查询支付状态
      const orderService = new OrderService();
      const result = await orderService.queryPaymentStatus(orderNo);

      ctx.body = success(result, '查询支付状态成功');
    } catch (error) {
      console.error('查询支付状态失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '查询支付状态失败');
    }
  }

  /**
   * 获取订单列表（管理后台）
   */
  static async getOrderList(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { 
        status, 
        page = '1', 
        limit = '20', 
        keyword,
        startDate,
        endDate 
      } = ctx.query as {
        status?: string;
        page?: string;
        limit?: string;
        keyword?: string;
        startDate?: string;
        endDate?: string;
      };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // 构建查询条件
      const query: any = { platformId };
      
      if (status) {
        query.status = status;
      }
      
      if (keyword) {
        query.$or = [
          { orderNo: { $regex: keyword, $options: 'i' } },
          { 'items.productName': { $regex: keyword, $options: 'i' } }
        ];
      }
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // 查询订单列表
      const { Order } = require('@/models/order');
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('wechatPayment');

      // 查询总数
      const total = await Order.countDocuments(query);

      ctx.body = success({
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }, '获取订单列表成功');
    } catch (error) {
      console.error('获取订单列表失败:', error);
      ctx.body = fail('获取订单列表失败');
    }
  }

  /**
   * 发货（管理后台）
   */
  static async shipOrder(ctx: Context) {
    try {
      const { orderNo } = ctx.params;
      const { 
        company, 
        trackingNumber, 
        description 
      } = ctx.request.body as {
        company: string;
        trackingNumber: string;
        description?: string;
      };

      if (!company || !trackingNumber) {
        ctx.body = fail('缺少必要参数');
        return;
      }

      // 查找订单
      const { Order } = require('@/models/order');
      const order = await Order.findByOrderNo(orderNo);
      
      if (!order) {
        ctx.body = fail('订单不存在');
        return;
      }

      if (order.status !== OrderStatus.PAID) {
        ctx.body = fail('订单状态不允许发货');
        return;
      }

      // 发货
      const logisticsInfo = {
        company,
        trackingNumber,
        status: 'SHIPPED',
        lastUpdate: new Date(),
        tracks: [{
          time: new Date(),
          status: 'SHIPPED',
          description: description || '商品已发货'
        }]
      };

      await order.ship(logisticsInfo);

      ctx.body = success(order, '发货成功');
    } catch (error) {
      console.error('发货失败:', error);
      ctx.body = fail('发货失败');
    }
  }

  /**
   * 获取订单统计（管理后台）
   */
  static async getOrderStats(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { startDate, endDate } = ctx.query as {
        startDate?: string;
        endDate?: string;
      };

      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      // 获取订单统计
      const orderService = new OrderService();
      const stats = await orderService.getOrderStats(platformId, start, end);

      ctx.body = success(stats, '获取订单统计成功');
    } catch (error) {
      console.error('获取订单统计失败:', error);
      ctx.body = fail('获取订单统计失败');
    }
  }

  /**
   * 更新订单备注（管理后台）
   */
  static async updateOrderRemark(ctx: Context) {
    try {
      const { orderNo } = ctx.params;
      const { sellerMessage } = ctx.request.body as { sellerMessage: string };

      // 查找订单
      const { Order } = require('@/models/order');
      const order = await Order.findByOrderNo(orderNo);
      
      if (!order) {
        ctx.body = fail('订单不存在');
        return;
      }

      // 更新备注
      order.sellerMessage = sellerMessage;
      await order.save();

      ctx.body = success(order, '更新订单备注成功');
    } catch (error) {
      console.error('更新订单备注失败:', error);
      ctx.body = fail('更新订单备注失败');
    }
  }
}