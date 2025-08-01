import mongoose, { Schema, Document } from 'mongoose';

/**
 * 微信支付状态枚举
 */
export enum WechatPaymentStatus {
  PENDING = 'PENDING',       // 待支付
  PAID = 'PAID',            // 已支付
  FAILED = 'FAILED',        // 支付失败
  REFUNDING = 'REFUNDING',  // 退款中
  REFUNDED = 'REFUNDED',    // 已退款
  CANCELLED = 'CANCELLED'   // 已取消
}

/**
 * 微信支付类型枚举
 */
export enum WechatPaymentType {
  JSAPI = 'JSAPI',         // 小程序支付
  APP = 'APP',             // APP支付
  NATIVE = 'NATIVE',       // 扫码支付
  H5 = 'H5'               // H5支付
}

/**
 * 微信支付接口定义
 */
export interface IWechatPayment extends Document {
  // 业务订单信息
  orderNo: string;              // 关联的订单号（用于数据库关联）
  outTradeNo: string;           // 商户订单号（唯一）
  transactionId?: string;       // 微信支付订单号

  // 支付基本信息
  body: string;                 // 商品描述
  detail?: string;              // 商品详情
  totalFee: number;             // 支付金额（分）
  currency: string;             // 货币类型

  // 用户信息
  openid: string;               // 用户openid
  appId: string;               // 微信账号AppID（用于区分具体的微信账号）

  // 支付配置
  paymentType: WechatPaymentType; // 支付类型
  tradeType: string;            // 交易类型

  // 支付状态
  status: WechatPaymentStatus;  // 支付状态
  prepayId?: string;            // 预支付交易会话标识
  codeUrl?: string;             // 二维码链接（NATIVE支付）

  // 回调信息
  notifyUrl: string;            // 通知地址
  returnCode?: string;          // 返回状态码
  returnMsg?: string;           // 返回信息
  resultCode?: string;          // 业务结果
  errCode?: string;             // 错误代码
  errCodeDes?: string;          // 错误代码描述

  // 支付完成信息
  timeEnd?: Date;               // 支付完成时间
  cashFee?: number;             // 现金支付金额
  feeType?: string;             // 现金支付货币类型

  // 退款信息
  refundFee?: number;           // 退款金额（分）
  refundId?: string;            // 微信退款单号
  refundStatus?: string;        // 退款状态
  refundAccount?: string;       // 退款资金来源
  refundRecvAccount?: string;   // 退款入账账户
  refundSuccessTime?: Date;     // 退款成功时间
  refundReason?: string;        // 退款原因

  // 扩展信息
  attach?: string;              // 附加数据
  goodsTag?: string;            // 商品标记
  deviceInfo?: string;          // 设备号

  // 客户端信息
  spbillCreateIp: string;       // 终端IP
  userAgent?: string;           // 用户代理

  // 时间戳
  createdAt: Date;
  updatedAt: Date;

  // 实例方法
  markAsPaid(paymentData: any): Promise<IWechatPayment>;
  markAsFailed(errorData: any): Promise<IWechatPayment>;
  initiateRefund(refundFee: number, reason?: string): Promise<IWechatPayment>;
}

/**
 * 微信支付数据模型
 */
const WechatPaymentSchema = new Schema<IWechatPayment>({
  // 业务订单信息
  orderNo: {
    type: String,
    required: true,
    index: true,
    comment: '关联的订单号'
  },
  outTradeNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
    comment: '商户订单号'
  },
  transactionId: {
    type: String,
    comment: '微信支付订单号'
  },

  // 支付基本信息
  body: {
    type: String,
    required: true,
    comment: '商品描述'
  },
  detail: {
    type: String,
    comment: '商品详情'
  },
  totalFee: {
    type: Number,
    required: true,
    min: 1,
    comment: '支付金额（分）'
  },
  currency: {
    type: String,
    default: 'CNY',
    comment: '货币类型'
  },

  // 用户信息
  openid: {
    type: String,
    required: true,
    index: true,
    comment: '用户openid'
  },
  appId: {
    type: String,
    required: true,
    index: true,
    comment: '微信账号AppID'
  },

  // 支付配置
  paymentType: {
    type: String,
    enum: Object.values(WechatPaymentType),
    default: WechatPaymentType.JSAPI,
    comment: '支付类型'
  },
  tradeType: {
    type: String,
    default: 'JSAPI',
    comment: '交易类型'
  },

  // 支付状态
  status: {
    type: String,
    enum: Object.values(WechatPaymentStatus),
    default: WechatPaymentStatus.PENDING,
    index: true,
    comment: '支付状态'
  },
  prepayId: {
    type: String,
    comment: '预支付交易会话标识'
  },
  codeUrl: {
    type: String,
    comment: '二维码链接'
  },

  // 回调信息
  notifyUrl: {
    type: String,
    required: true,
    comment: '通知地址'
  },
  returnCode: {
    type: String,
    comment: '返回状态码'
  },
  returnMsg: {
    type: String,
    comment: '返回信息'
  },
  resultCode: {
    type: String,
    comment: '业务结果'
  },
  errCode: {
    type: String,
    comment: '错误代码'
  },
  errCodeDes: {
    type: String,
    comment: '错误代码描述'
  },

  // 支付完成信息
  timeEnd: {
    type: Date,
    comment: '支付完成时间'
  },
  cashFee: {
    type: Number,
    comment: '现金支付金额'
  },
  feeType: {
    type: String,
    comment: '现金支付货币类型'
  },

  // 退款信息
  refundFee: {
    type: Number,
    comment: '退款金额（分）'
  },
  refundId: {
    type: String,
    comment: '微信退款单号'
  },
  refundStatus: {
    type: String,
    comment: '退款状态'
  },
  refundAccount: {
    type: String,
    comment: '退款资金来源'
  },
  refundRecvAccount: {
    type: String,
    comment: '退款入账账户'
  },
  refundSuccessTime: {
    type: Date,
    comment: '退款成功时间'
  },
  refundReason: {
    type: String,
    comment: '退款原因'
  },

  // 扩展信息
  attach: {
    type: String,
    comment: '附加数据'
  },
  goodsTag: {
    type: String,
    comment: '商品标记'
  },
  deviceInfo: {
    type: String,
    comment: '设备号'
  },

  // 客户端信息
  spbillCreateIp: {
    type: String,
    required: true,
    comment: '终端IP'
  },
  userAgent: {
    type: String,
    comment: '用户代理'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(_doc, ret) {
      // 转换金额单位（分转元）
      const retAny = ret as any;
      if (retAny.totalFee) {
        retAny.totalFeeYuan = (retAny.totalFee / 100).toFixed(2);
      }
      if (retAny.cashFee) {
        retAny.cashFeeYuan = (retAny.cashFee / 100).toFixed(2);
      }
      if (retAny.refundFee) {
        retAny.refundFeeYuan = (retAny.refundFee / 100).toFixed(2);
      }
      return ret;
    }
  }
});

// 创建复合索引
WechatPaymentSchema.index({ orderNo: 1 }); // 新增订单号索引
WechatPaymentSchema.index({ openid: 1, appId: 1 });
WechatPaymentSchema.index({ status: 1, createdAt: -1 });
WechatPaymentSchema.index({ transactionId: 1 }, { sparse: true });
WechatPaymentSchema.index({ prepayId: 1 }, { sparse: true });
WechatPaymentSchema.index({ timeEnd: -1 });

// 虚拟字段：格式化金额
WechatPaymentSchema.virtual('totalFeeYuan').get(function() {
  return (this.totalFee / 100).toFixed(2);
});

WechatPaymentSchema.virtual('statusText').get(function() {
  const statusMap = {
    [WechatPaymentStatus.PENDING]: '待支付',
    [WechatPaymentStatus.PAID]: '已支付',
    [WechatPaymentStatus.FAILED]: '支付失败',
    [WechatPaymentStatus.REFUNDING]: '退款中',
    [WechatPaymentStatus.REFUNDED]: '已退款',
    [WechatPaymentStatus.CANCELLED]: '已取消'
  };
  return statusMap[this.status] || '未知状态';
});

// 实例方法：标记为已支付
WechatPaymentSchema.methods.markAsPaid = function(paymentData: any) {
  this.status = WechatPaymentStatus.PAID;
  this.transactionId = paymentData.transaction_id;
  this.timeEnd = new Date(paymentData.time_end);
  this.cashFee = paymentData.cash_fee;
  this.feeType = paymentData.fee_type;
  return this.save();
};

// 实例方法：标记为失败
WechatPaymentSchema.methods.markAsFailed = function(errorData: any) {
  this.status = WechatPaymentStatus.FAILED;
  this.errCode = errorData.err_code;
  this.errCodeDes = errorData.err_code_des;
  return this.save();
};

// 实例方法：发起退款
WechatPaymentSchema.methods.initiateRefund = function(refundFee: number, reason?: string) {
  this.status = WechatPaymentStatus.REFUNDING;
  this.refundFee = refundFee;
  this.refundReason = reason;
  return this.save();
};

// 静态方法类型定义
interface WechatPaymentModel extends mongoose.Model<IWechatPayment> {
  findByOrderNo(orderNo: string): Promise<IWechatPayment | null>;
  findByOutTradeNo(outTradeNo: string): Promise<IWechatPayment | null>;
  findByTransactionId(transactionId: string): Promise<IWechatPayment | null>;
  findByPrepayId(prepayId: string): Promise<IWechatPayment | null>;
  findUserPayments(
    openid: string,
    appId: string,
    page?: number,
    limit?: number
  ): Promise<IWechatPayment[]>;
}

// 静态方法：根据订单号查找
WechatPaymentSchema.statics.findByOrderNo = function(orderNo: string) {
  return this.findOne({ orderNo });
};

// 静态方法：根据商户订单号查找
WechatPaymentSchema.statics.findByOutTradeNo = function(outTradeNo: string) {
  return this.findOne({ outTradeNo });
};

// 静态方法：根据微信订单号查找
WechatPaymentSchema.statics.findByTransactionId = function(transactionId: string) {
  return this.findOne({ transactionId });
};

// 静态方法：根据预支付ID查找
WechatPaymentSchema.statics.findByPrepayId = function(prepayId: string) {
  return this.findOne({ prepayId });
};

// 静态方法：获取用户支付记录
WechatPaymentSchema.statics.findUserPayments = function(
  openid: string,
  appId: string,
  page: number = 1,
  limit: number = 20
) {
  return this.find({ openid, appId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

export const WechatPayment = mongoose.model<IWechatPayment, WechatPaymentModel>('WechatPayment', WechatPaymentSchema);
