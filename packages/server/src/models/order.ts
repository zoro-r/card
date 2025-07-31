import mongoose, { Schema, Document } from 'mongoose';
import { IWechatPayment } from './wechatPayment';

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'PENDING',         // 待支付
  PAID = 'PAID',              // 已支付
  SHIPPED = 'SHIPPED',        // 已发货
  DELIVERED = 'DELIVERED',    // 已收货
  CANCELLED = 'CANCELLED',    // 已取消
  REFUNDED = 'REFUNDED',      // 已退款
  COMPLETED = 'COMPLETED'     // 已完成
}

/**
 * 订单类型枚举
 */
export enum OrderType {
  PRODUCT = 'PRODUCT',        // 商品订单
  SERVICE = 'SERVICE',        // 服务订单
  VIRTUAL = 'VIRTUAL',        // 虚拟商品
  SUBSCRIPTION = 'SUBSCRIPTION' // 订阅服务
}

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  WECHAT = 'WECHAT',          // 微信支付
  ALIPAY = 'ALIPAY',          // 支付宝
  BALANCE = 'BALANCE',        // 余额支付
  OFFLINE = 'OFFLINE'         // 线下支付
}

/**
 * 订单商品接口
 */
export interface OrderItem {
  productId: string;          // 商品ID
  productName: string;        // 商品名称
  productImage?: string;      // 商品图片
  skuId?: string;            // SKU ID
  skuName?: string;          // SKU名称
  skuImage?: string;         // SKU图片
  unitPrice: number;         // 单价（分）
  quantity: number;          // 数量
  totalPrice: number;        // 小计（分）
  attributes?: {             // 商品属性
    [key: string]: string;
  };
}

/**
 * 收货地址接口
 */
export interface ShippingAddress {
  receiverName: string;      // 收货人姓名
  receiverPhone: string;     // 收货人电话
  province: string;          // 省份
  city: string;             // 城市
  district: string;         // 区县
  address: string;          // 详细地址
  postalCode?: string;      // 邮政编码
}

/**
 * 物流信息接口
 */
export interface LogisticsInfo {
  company: string;          // 物流公司
  trackingNumber: string;   // 运单号
  status: string;          // 物流状态
  lastUpdate: Date;        // 最后更新时间
  tracks?: {               // 物流轨迹
    time: Date;
    status: string;
    description: string;
  }[];
}

/**
 * 订单接口定义
 */
export interface IOrder extends Document {
  // 订单基本信息
  orderNo: string;              // 订单号（唯一）
  orderType: OrderType;         // 订单类型
  status: OrderStatus;          // 订单状态

  // 用户信息
  userId?: string;              // 用户ID（如果是注册用户）
  openid?: string;              // 微信用户openid
  platformId: string;          // 平台ID

  // 商品信息
  items: OrderItem[];           // 订单商品列表
  itemCount: number;            // 商品总数量

  // 金额信息
  subtotal: number;             // 商品小计（分）
  shippingFee: number;          // 运费（分）
  discountAmount: number;       // 优惠金额（分）
  totalAmount: number;          // 订单总金额（分）
  paidAmount: number;           // 实际支付金额（分）

  // 支付信息
  paymentMethod?: PaymentMethod; // 支付方式
  paymentStatus: string;        // 支付状态
  paymentTime?: Date;           // 支付时间
  paymentId?: string;           // 支付单号
  wechatPayment?: IWechatPayment['_id']; // 微信支付记录ID

  // 收货信息
  shippingAddress?: ShippingAddress; // 收货地址
  logistics?: LogisticsInfo;    // 物流信息
  shippingTime?: Date;          // 发货时间
  deliveryTime?: Date;          // 收货时间

  // 优惠信息
  couponId?: string;            // 优惠券ID
  couponAmount?: number;        // 优惠券金额（分）
  promotionId?: string;         // 活动ID
  promotionAmount?: number;     // 活动优惠金额（分）

  // 订单备注
  buyerMessage?: string;        // 买家留言
  sellerMessage?: string;       // 卖家备注

  // 评价信息
  isRated: boolean;             // 是否已评价
  ratingId?: string;            // 评价ID

  // 退款信息
  refundStatus?: string;        // 退款状态
  refundAmount?: number;        // 退款金额（分）
  refundReason?: string;        // 退款原因
  refundTime?: Date;            // 退款时间

  // 扩展字段
  source?: string;              // 订单来源
  channel?: string;             // 渠道标识
  tags?: string[];              // 订单标签
  metadata?: {                  // 扩展数据
    [key: string]: any;
  };

  // 时间戳
  createdAt: Date;
  updatedAt: Date;

  // 实例方法
  markAsPaid(paymentData: any): Promise<IOrder>;
  ship(logisticsData: LogisticsInfo): Promise<IOrder>;
  confirmDelivery(): Promise<IOrder>;
  cancel(reason?: string): Promise<IOrder>;
  calculateAmount(): IOrder;
}

/**
 * 订单数据模型
 */
const OrderSchema = new Schema<IOrder>({
  // 订单基本信息
  orderNo: {
    type: String,
    required: true,
    unique: true,
    comment: '订单号'
  },
  orderType: {
    type: String,
    enum: Object.values(OrderType),
    default: OrderType.PRODUCT,
    comment: '订单类型'
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    index: true,
    comment: '订单状态'
  },

  // 用户信息
  userId: {
    type: String,
    index: true,
    comment: '用户ID'
  },
  openid: {
    type: String,
    index: true,
    comment: '微信用户openid'
  },
  platformId: {
    type: String,
    required: true,
    index: true,
    comment: '平台ID'
  },

  // 商品信息
  items: [{
    productId: {
      type: String,
      required: true,
      comment: '商品ID'
    },
    productName: {
      type: String,
      required: true,
      comment: '商品名称'
    },
    productImage: {
      type: String,
      comment: '商品图片'
    },
    skuId: {
      type: String,
      comment: 'SKU ID'
    },
    skuName: {
      type: String,
      comment: 'SKU名称'
    },
    skuImage: {
      type: String,
      comment: 'SKU图片'
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      comment: '单价（分）'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      comment: '数量'
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
      comment: '小计（分）'
    },
    attributes: {
      type: Schema.Types.Mixed,
      comment: '商品属性'
    }
  }],
  itemCount: {
    type: Number,
    required: true,
    min: 1,
    comment: '商品总数量'
  },

  // 金额信息
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    comment: '商品小计（分）'
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0,
    comment: '运费（分）'
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
    comment: '优惠金额（分）'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    comment: '订单总金额（分）'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
    comment: '实际支付金额（分）'
  },

  // 支付信息
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    comment: '支付方式'
  },
  paymentStatus: {
    type: String,
    default: 'UNPAID',
    comment: '支付状态'
  },
  paymentTime: {
    type: Date,
    comment: '支付时间'
  },
  paymentId: {
    type: String,
    comment: '支付单号'
  },
  wechatPayment: {
    type: Schema.Types.ObjectId,
    ref: 'WechatPayment',
    comment: '微信支付记录ID'
  },

  // 收货信息
  shippingAddress: {
    receiverName: {
      type: String,
      comment: '收货人姓名'
    },
    receiverPhone: {
      type: String,
      comment: '收货人电话'
    },
    province: {
      type: String,
      comment: '省份'
    },
    city: {
      type: String,
      comment: '城市'
    },
    district: {
      type: String,
      comment: '区县'
    },
    address: {
      type: String,
      comment: '详细地址'
    },
    postalCode: {
      type: String,
      comment: '邮政编码'
    }
  },
  logistics: {
    company: {
      type: String,
      comment: '物流公司'
    },
    trackingNumber: {
      type: String,
      comment: '运单号'
    },
    status: {
      type: String,
      comment: '物流状态'
    },
    lastUpdate: {
      type: Date,
      comment: '最后更新时间'
    },
    tracks: [{
      time: {
        type: Date,
        comment: '时间'
      },
      status: {
        type: String,
        comment: '状态'
      },
      description: {
        type: String,
        comment: '描述'
      }
    }]
  },
  shippingTime: {
    type: Date,
    comment: '发货时间'
  },
  deliveryTime: {
    type: Date,
    comment: '收货时间'
  },

  // 优惠信息
  couponId: {
    type: String,
    comment: '优惠券ID'
  },
  couponAmount: {
    type: Number,
    min: 0,
    comment: '优惠券金额（分）'
  },
  promotionId: {
    type: String,
    comment: '活动ID'
  },
  promotionAmount: {
    type: Number,
    min: 0,
    comment: '活动优惠金额（分）'
  },

  // 订单备注
  buyerMessage: {
    type: String,
    maxlength: 500,
    comment: '买家留言'
  },
  sellerMessage: {
    type: String,
    maxlength: 500,
    comment: '卖家备注'
  },

  // 评价信息
  isRated: {
    type: Boolean,
    default: false,
    comment: '是否已评价'
  },
  ratingId: {
    type: String,
    comment: '评价ID'
  },

  // 退款信息
  refundStatus: {
    type: String,
    comment: '退款状态'
  },
  refundAmount: {
    type: Number,
    min: 0,
    comment: '退款金额（分）'
  },
  refundReason: {
    type: String,
    comment: '退款原因'
  },
  refundTime: {
    type: Date,
    comment: '退款时间'
  },

  // 扩展字段
  source: {
    type: String,
    default: 'miniprogram',
    comment: '订单来源'
  },
  channel: {
    type: String,
    comment: '渠道标识'
  },
  tags: [{
    type: String,
    comment: '订单标签'
  }],
  metadata: {
    type: Schema.Types.Mixed,
    comment: '扩展数据'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(_doc, ret) {
      // 转换金额单位（分转元）
      const amountFields = ['subtotal', 'shippingFee', 'discountAmount', 'totalAmount', 'paidAmount', 'couponAmount', 'promotionAmount', 'refundAmount'];
      amountFields.forEach(field => {
        const retAny = ret as any;
        if (retAny[field] !== undefined) {
          retAny[`${field}Yuan`] = (retAny[field] / 100).toFixed(2);
        }
      });

      // 转换商品金额
      if (ret.items) {
        ret.items.forEach((item: any) => {
          item.unitPriceYuan = (item.unitPrice / 100).toFixed(2);
          item.totalPriceYuan = (item.totalPrice / 100).toFixed(2);
        });
      }

      return ret;
    }
  }
});

// 创建复合索引
OrderSchema.index({ orderNo: 1 }, { unique: true });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ openid: 1, platformId: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ platformId: 1, createdAt: -1 });

// 虚拟字段：格式化状态
OrderSchema.virtual('statusText').get(function() {
  const statusMap = {
    [OrderStatus.PENDING]: '待支付',
    [OrderStatus.PAID]: '已支付',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.DELIVERED]: '已收货',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款',
    [OrderStatus.COMPLETED]: '已完成'
  };
  return statusMap[this.status] || '未知状态';
});

// 虚拟字段：订单总金额（元）
OrderSchema.virtual('totalAmountYuan').get(function() {
  return (this.totalAmount / 100).toFixed(2);
});

// 实例方法：标记为已支付
OrderSchema.methods.markAsPaid = function(paymentData: any) {
  this.status = OrderStatus.PAID;
  this.paymentStatus = 'PAID';
  this.paymentTime = new Date();
  this.paidAmount = paymentData.amount || this.totalAmount;
  if (paymentData.paymentId) {
    this.paymentId = paymentData.paymentId;
  }
  if (paymentData.wechatPaymentId) {
    this.wechatPayment = paymentData.wechatPaymentId;
  }
  return this.save();
};

// 实例方法：发货
OrderSchema.methods.ship = function(logisticsData: LogisticsInfo) {
  this.status = OrderStatus.SHIPPED;
  this.logistics = logisticsData;
  this.shippingTime = new Date();
  return this.save();
};

// 实例方法：确认收货
OrderSchema.methods.confirmDelivery = function() {
  this.status = OrderStatus.DELIVERED;
  this.deliveryTime = new Date();
  return this.save();
};

// 实例方法：取消订单
OrderSchema.methods.cancel = function(reason?: string) {
  this.status = OrderStatus.CANCELLED;
  if (reason) {
    this.sellerMessage = reason;
  }
  return this.save();
};

// 实例方法：计算订单金额
OrderSchema.methods.calculateAmount = function() {
  // 计算商品小计
  this.subtotal = this.items.reduce((sum: number, item: OrderItem) => sum + item.totalPrice, 0);
  this.itemCount = this.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0);

  // 计算总金额
  this.totalAmount = this.subtotal + this.shippingFee - this.discountAmount;

  return this;
};

// 静态方法类型定义
interface OrderModel extends mongoose.Model<IOrder> {
  generateOrderNo(platformId: string): string;
  findByOrderNo(orderNo: string): Promise<IOrder | null>;
  findUserOrders(
    userId: string | null,
    openid: string | null,
    platformId: string,
    status?: OrderStatus,
    page?: number,
    limit?: number
  ): Promise<IOrder[]>;
  getOrderStats(platformId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
}

// 静态方法：生成订单号
OrderSchema.statics.generateOrderNo = function(platformId: string): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                  (date.getMonth() + 1).toString().padStart(2, '0') +
                  date.getDate().toString().padStart(2, '0');
  const timeStr = Date.now().toString().slice(-6);
  const randomStr = Math.random().toString().slice(-4);
  return `${platformId.toUpperCase()}${dateStr}${timeStr}${randomStr}`;
};

// 静态方法：根据订单号查找
OrderSchema.statics.findByOrderNo = function(orderNo: string) {
  return this.findOne({ orderNo });
};

// 静态方法：获取用户订单
OrderSchema.statics.findUserOrders = function(
  userId: string | null,
  openid: string | null,
  platformId: string,
  status?: OrderStatus,
  page: number = 1,
  limit: number = 20
) {
  const query: any = { platformId };

  if (userId) {
    query.userId = userId;
  } else if (openid) {
    query.openid = openid;
  }

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('wechatPayment');
};

// 静态方法：获取平台订单统计
OrderSchema.statics.getOrderStats = function(platformId: string, startDate?: Date, endDate?: Date) {
  const match: any = { platformId };

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

export const Order = mongoose.model<IOrder, OrderModel>('Order', OrderSchema);
