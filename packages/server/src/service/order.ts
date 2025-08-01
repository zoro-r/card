import { Context } from 'koa';
import { Order, IOrder, OrderStatus, OrderType, PaymentMethod } from '@/models/order';
import { WechatPayment, WechatPaymentStatus, WechatPaymentType } from '@/models/wechatPayment';
import { WechatPaymentService } from '@/service/wechatPayment';
import { WechatService } from '@/service/wechat';

/**
 * 创建订单参数
 */
interface CreateOrderParams {
  items: Array<{
    // 标准字段
    productId?: string;
    productName?: string;
    productImage?: string;
    skuId?: string;
    skuName?: string;
    skuImage?: string;
    unitPrice?: number;
    quantity: number;
    attributes?: { [key: string]: string };
    
    // 小程序兼容字段
    name?: string;        // 兼容productName
    price?: number;       // 兼容unitPrice
    description?: string; // 商品描述
  }>;
  shippingAddress?: {
    receiverName: string;
    receiverPhone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    postalCode?: string;
  };
  couponId?: string;
  buyerMessage?: string;
  orderType?: OrderType;
}

/**
 * 订单服务类
 */
export class OrderService {
  /**
   * 创建订单
   * @param userId 用户ID
   * @param openid 微信用户openid
   * @param platformId 平台ID
   * @param params 订单参数
   * @returns 创建的订单
   */
  async createOrder(
    userId: string | null,
    openid: string | null,
    platformId: string,
    params: CreateOrderParams
  ): Promise<IOrder> {
    try {
      // 1. 生成订单号
      const orderNo = Order.generateOrderNo(platformId);

      // 2. 计算商品金额和映射字段
      const items = params.items.map(item => ({
        productId: item.productId || 'test-product-' + Date.now(), // 如果没有productId，生成一个测试用的
        productName: item.name || item.productName || '测试商品', // 支持name或productName字段
        unitPrice: item.price || item.unitPrice || 0, // 支持price或unitPrice字段
        quantity: item.quantity,
        description: item.description || '',
        totalPrice: (item.price || item.unitPrice || 0) * item.quantity
      }));

      // 3. 创建订单
      const order = new Order({
        orderNo,
        orderType: params.orderType || OrderType.PRODUCT,
        userId,
        openid,
        platformId,
        items,
        shippingAddress: params.shippingAddress,
        buyerMessage: params.buyerMessage,
        subtotal: 0,
        shippingFee: 0,
        discountAmount: 0,
        totalAmount: 0,
        paidAmount: 0
      });

      // 4. 计算订单金额
      order.calculateAmount();

      // 5. 应用优惠券（如果有）
      if (params.couponId) {
        // TODO: 实现优惠券逻辑
        // const discount = await this.applyCoupon(params.couponId, order.subtotal);
        // order.couponId = params.couponId;
        // order.couponAmount = discount;
        // order.discountAmount += discount;
        // order.calculateAmount();
      }

      // 6. 保存订单
      await order.save();

      return order;
    } catch (error) {
      console.error('创建订单失败:', error);
      throw new Error('创建订单失败');
    }
  }

  /**
   * 发起微信支付
   * @param orderNo 订单号
   * @param clientIp 客户端IP
   * @returns 支付参数
   */
  async initiateWechatPayment(orderNo: string, clientIp: string): Promise<{
    prepayId?: string;
    paySign?: string;
    timeStamp?: string;
    nonceStr?: string;
    signType?: string;
    package?: string;
  }> {
    try {
      // 1. 查找订单
      const order = await Order.findByOrderNo(orderNo);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new Error('订单状态不允许支付');
      }

      if (!order.openid) {
        throw new Error('缺少用户信息');
      }

      // 2. 创建微信支付记录
      // 生成符合微信支付限制的商户订单号（最大32字节）
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 6); // 4位随机字符
      const outTradeNo = `WX${timestamp.slice(-10)}${randomSuffix}`; // WX + 10位时间戳 + 4位随机 = 16位
      
      const wechatPayment = new WechatPayment({
        appId: order.platformId, // 使用platformId作为appId
        outTradeNo,
        body: order.items.map(item => item.productName).join(', '),
        totalFee: order.totalAmount,
        openid: order.openid,
        platformId: order.platformId,
        paymentType: WechatPaymentType.JSAPI,
        tradeType: 'JSAPI',
        notifyUrl: `${process.env.API_BASE_URL}/api/wechat/payment/notify`,
        spbillCreateIp: clientIp,
        attach: orderNo // 将订单号作为附加数据
      });

      await wechatPayment.save();

      // 3. 关联订单和支付记录
      order.wechatPayment = wechatPayment._id;
      order.paymentMethod = PaymentMethod.WECHAT;
      await order.save();

      // 4. 调用微信支付统一下单
      const paymentService = await WechatPaymentService.create(order.platformId);
      const paymentResult = await paymentService.createUnifiedOrder({
        body: wechatPayment.body,
        outTradeNo: wechatPayment.outTradeNo,
        totalFee: wechatPayment.totalFee,
        spbillCreateIp: wechatPayment.spbillCreateIp,
        notifyUrl: wechatPayment.notifyUrl,
        tradeType: wechatPayment.tradeType,
        openid: wechatPayment.openid
      });

      // 5. 更新支付记录
      if (paymentResult.prepayId) {
        wechatPayment.prepayId = paymentResult.prepayId;
        await wechatPayment.save();
      }

      return paymentResult;
    } catch (error) {
      console.error('发起微信支付失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付成功回调
   * @param paymentId 支付记录ID
   * @returns 处理结果
   */
  async handlePaymentSuccess(paymentId: string): Promise<void> {
    try {
      // 1. 查找支付记录
      const payment = await WechatPayment.findById(paymentId);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 2. 查找订单
      const orderNo = payment.attach;
      if (!orderNo) {
        throw new Error('支付记录缺少订单信息');
      }

      const order = await Order.findByOrderNo(orderNo);
      if (!order) {
        throw new Error('关联订单不存在');
      }

      // 3. 更新订单状态
      await order.markAsPaid({
        amount: payment.totalFee,
        paymentId: payment.transactionId,
        wechatPaymentId: payment._id
      });

      // 4. 执行后续业务逻辑
      // TODO: 发送支付成功通知、库存扣减等

      console.log(`订单 ${orderNo} 支付成功处理完成`);
    } catch (error) {
      console.error('处理支付成功回调失败:', error);
      throw error;
    }
  }

  /**
   * 查询订单详情
   * @param orderNo 订单号
   * @param userId 用户ID
   * @param openid 微信用户openid
   * @returns 订单详情
   */
  async getOrderDetail(
    orderNo: string,
    userId?: string,
    openid?: string
  ): Promise<IOrder | null> {
    try {
      const query: any = { orderNo };
      
      if (userId) {
        query.userId = userId;
      } else if (openid) {
        query.openid = openid;
      }

      const order = await Order.findOne(query).populate('wechatPayment');
      return order;
    } catch (error) {
      console.error('查询订单详情失败:', error);
      throw new Error('查询订单详情失败');
    }
  }

  /**
   * 获取用户订单列表
   * @param userId 用户ID
   * @param openid 微信用户openid
   * @param platformId 平台ID
   * @param status 订单状态
   * @param page 页码
   * @param limit 每页数量
   * @returns 订单列表
   */
  async getUserOrders(
    userId: string | null,
    openid: string | null,
    platformId: string,
    status?: OrderStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    orders: IOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const orders = await Order.findUserOrders(userId, openid, platformId, status, page, limit);
      
      // 计算总数
      const query: any = { platformId };
      if (userId) {
        query.userId = userId;
      } else if (openid) {
        query.openid = openid;
      }
      if (status) {
        query.status = status;
      }
      
      const total = await Order.countDocuments(query);

      return {
        orders,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('获取用户订单列表失败:', error);
      throw new Error('获取用户订单列表失败');
    }
  }

  /**
   * 取消订单
   * @param orderNo 订单号
   * @param userId 用户ID
   * @param openid 微信用户openid
   * @param reason 取消原因
   * @returns 取消结果
   */
  async cancelOrder(
    orderNo: string,
    userId?: string,
    openid?: string,
    reason?: string
  ): Promise<void> {
    try {
      // 1. 查找订单
      const order = await this.getOrderDetail(orderNo, userId, openid);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 2. 检查订单状态
      if (order.status !== OrderStatus.PENDING) {
        throw new Error('订单状态不允许取消');
      }

      // 3. 取消订单
      await order.cancel(reason);

      // 4. 如果有关联的微信支付记录，也需要处理
      if (order.wechatPayment) {
        const payment = await WechatPayment.findById(order.wechatPayment);
        if (payment && payment.status === WechatPaymentStatus.PENDING) {
          payment.status = WechatPaymentStatus.CANCELLED;
          await payment.save();
        }
      }

      console.log(`订单 ${orderNo} 取消成功`);
    } catch (error) {
      console.error('取消订单失败:', error);
      throw error;
    }
  }

  /**
   * 确认收货
   * @param orderNo 订单号
   * @param userId 用户ID
   * @param openid 微信用户openid
   * @returns 确认结果
   */
  async confirmDelivery(
    orderNo: string,
    userId?: string,
    openid?: string
  ): Promise<void> {
    try {
      // 1. 查找订单
      const order = await this.getOrderDetail(orderNo, userId, openid);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 2. 检查订单状态
      if (order.status !== OrderStatus.SHIPPED) {
        throw new Error('订单状态不允许确认收货');
      }

      // 3. 确认收货
      await order.confirmDelivery();

      console.log(`订单 ${orderNo} 确认收货成功`);
    } catch (error) {
      console.error('确认收货失败:', error);
      throw error;
    }
  }

  /**
   * 查询支付状态
   * @param orderNo 订单号
   * @returns 支付状态
   */
  async queryPaymentStatus(orderNo: string): Promise<{
    status: WechatPaymentStatus;
    paid: boolean;
  }> {
    try {
      // 1. 查找订单
      const order = await Order.findByOrderNo(orderNo);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 2. 查找微信支付记录
      if (!order.wechatPayment) {
        return {
          status: WechatPaymentStatus.PENDING,
          paid: false
        };
      }

      const payment = await WechatPayment.findById(order.wechatPayment);
      if (!payment) {
        return {
          status: WechatPaymentStatus.PENDING,
          paid: false
        };
      }

      // 3. 如果支付状态不是最终状态，查询微信支付状态
      if (payment.status === WechatPaymentStatus.PENDING) {
        const paymentService = await WechatPaymentService.create(order.platformId);
        const queryResult = await paymentService.queryPaymentStatus(payment.outTradeNo);
        
        if (queryResult.success && queryResult.status !== payment.status) {
          // 更新支付状态
          payment.status = queryResult.status;
          await payment.save();
          
          // 如果支付成功，更新订单状态
          if (queryResult.status === WechatPaymentStatus.PAID) {
            await this.handlePaymentSuccess((payment._id as any).toString());
          }
        }
      }

      return {
        status: payment.status,
        paid: payment.status === WechatPaymentStatus.PAID
      };
    } catch (error) {
      console.error('查询支付状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单统计
   * @param platformId 平台ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计数据
   */
  async getOrderStats(
    platformId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      const stats = await Order.getOrderStats(platformId, startDate, endDate);
      
      // 格式化统计数据
      const result: any = {
        total: 0,
        totalAmount: 0,
        statusStats: {}
      };

      stats.forEach(stat => {
        result.total += stat.count;
        result.totalAmount += stat.totalAmount;
        result.statusStats[stat._id] = {
          count: stat.count,
          amount: stat.totalAmount,
          amountYuan: (stat.totalAmount / 100).toFixed(2)
        };
      });

      result.totalAmountYuan = (result.totalAmount / 100).toFixed(2);

      return result;
    } catch (error) {
      console.error('获取订单统计失败:', error);
      throw new Error('获取订单统计失败');
    }
  }
}