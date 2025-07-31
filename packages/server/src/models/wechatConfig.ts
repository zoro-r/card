import mongoose, { Schema, Document } from 'mongoose';

/**
 * 微信配置接口定义
 */
export interface IWechatConfig extends Document {
  platformId: string;       // 平台ID（唯一标识）
  appId: string;            // 微信小程序AppId
  appSecret: string;        // 微信小程序AppSecret

  // 支付配置
  mchId?: string;           // 商户号
  mchKey?: string;          // 商户密钥
  payNotifyUrl?: string;    // 支付回调地址
  refundNotifyUrl?: string; // 退款回调地址

  // 证书文件路径（用于退款等高级功能）
  certPath?: string;        // 商户证书文件路径
  keyPath?: string;         // 商户密钥文件路径

  // 基础配置
  name: string;             // 平台名称
  description?: string;     // 平台描述
  domain?: string;          // 业务域名

  // 功能开关
  enablePayment: boolean;   // 是否启用支付
  enableRefund: boolean;    // 是否启用退款

  // 状态
  isActive: boolean;        // 是否启用

  // 时间戳
  createdAt: Date;
  updatedAt: Date;

  // 实例方法
  validatePaymentConfig(): boolean;
}

/**
 * 微信配置数据模型
 */
const WechatConfigSchema = new Schema<IWechatConfig>({
  platformId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    comment: '平台ID（唯一标识）'
  },
  appId: {
    type: String,
    required: true,
    comment: '微信小程序AppId'
  },
  appSecret: {
    type: String,
    required: true,
    comment: '微信小程序AppSecret'
  },

  // 支付配置
  mchId: {
    type: String,
    comment: '商户号'
  },
  mchKey: {
    type: String,
    comment: '商户密钥'
  },
  payNotifyUrl: {
    type: String,
    comment: '支付回调地址'
  },
  refundNotifyUrl: {
    type: String,
    comment: '退款回调地址'
  },

  // 证书文件路径
  certPath: {
    type: String,
    comment: '商户证书文件路径'
  },
  keyPath: {
    type: String,
    comment: '商户密钥文件路径'
  },

  // 基础配置
  name: {
    type: String,
    required: true,
    comment: '平台名称'
  },
  description: {
    type: String,
    default: '',
    comment: '平台描述'
  },
  domain: {
    type: String,
    comment: '业务域名'
  },

  // 功能开关
  enablePayment: {
    type: Boolean,
    default: false,
    comment: '是否启用支付'
  },
  enableRefund: {
    type: Boolean,
    default: false,
    comment: '是否启用退款'
  },

  // 状态
  isActive: {
    type: Boolean,
    default: true,
    comment: '是否启用'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(_doc, ret) {
      // 删除敏感字段
      const retAny = ret as any;
      delete retAny.appSecret;
      delete retAny.mchKey;
      return ret;
    }
  }
});

// 静态方法类型定义
interface WechatConfigModel extends mongoose.Model<IWechatConfig> {
  findByPlatformId(platformId: string): Promise<IWechatConfig | null>;
}

// 静态方法：根据平台ID获取配置
WechatConfigSchema.statics.findByPlatformId = function(platformId: string) {
  return this.findOne({ platformId, isActive: true });
};

// 实例方法：验证支付配置是否完整
WechatConfigSchema.methods.validatePaymentConfig = function() {
  return !!(this.appId && this.appSecret && this.mchId && this.mchKey);
};

export const WechatConfig = mongoose.model<IWechatConfig, WechatConfigModel>('WechatConfig', WechatConfigSchema);
