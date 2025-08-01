import mongoose, { Schema, Document } from 'mongoose';

/**
 * 微信账号类型枚举
 */
export enum WechatAccountType {
  MINIPROGRAM = 'MINIPROGRAM',     // 小程序
  OFFICIAL_ACCOUNT = 'OFFICIAL_ACCOUNT', // 服务号/订阅号
  ENTERPRISE = 'ENTERPRISE',       // 企业微信
  OPEN_PLATFORM = 'OPEN_PLATFORM' // 开放平台
}

/**
 * 微信账号状态枚举
 */
export enum WechatAccountStatus {
  ACTIVE = 'ACTIVE',               // 正常使用
  INACTIVE = 'INACTIVE',           // 已停用
  SUSPENDED = 'SUSPENDED',         // 已暂停
  EXPIRED = 'EXPIRED',             // 已过期
  PENDING = 'PENDING'              // 待审核
}

/**
 * 微信账号接口定义
 */
export interface IWechatAccount extends Document {
  // 基本信息
  accountId: string;               // 账号ID（唯一标识）
  name: string;                    // 账号名称
  displayName: string;             // 显示名称
  description?: string;            // 账号描述
  avatar?: string;                 // 账号头像
  
  // 账号类型和状态
  type: WechatAccountType;         // 账号类型
  status: WechatAccountStatus;     // 账号状态
  
  // 关联信息
  platformId: string;              // 所属平台ID
  
  // 微信官方信息
  appId: string;                   // 微信AppId
  appSecret: string;               // 微信AppSecret（加密存储）
  originalId?: string;             // 微信原始ID
  
  // 支付配置（可选）
  mchId?: string;                  // 商户号
  mchKey?: string;                 // 商户密钥（加密存储）
  payNotifyUrl?: string;           // 支付回调地址
  refundNotifyUrl?: string;        // 退款回调地址
  
  // 证书配置（用于退款等高级功能）
  certPath?: string;               // 商户证书文件路径
  keyPath?: string;                // 商户密钥文件路径
  
  // 业务配置
  enablePayment: boolean;          // 是否启用支付
  enableRefund: boolean;           // 是否启用退款
  enableMessage: boolean;          // 是否启用消息推送
  
  // 限制配置
  dailyApiLimit?: number;          // 日API调用限制
  monthlyTransactionLimit?: number; // 月交易限制
  
  // 统计信息
  stats: {
    totalUsers: number;            // 总用户数
    totalTransactions: number;     // 总交易数
    totalRevenue: number;          // 总收入(分)
    lastActiveTime?: Date;         // 最后活跃时间
    apiCallsToday: number;         // 今日API调用次数
  };
  
  // 联系信息
  contactName?: string;            // 联系人姓名
  contactPhone?: string;           // 联系电话
  contactEmail?: string;           // 联系邮箱
  
  // 有效期
  validFrom?: Date;                // 有效期开始
  validTo?: Date;                  // 有效期结束
  
  // 备注信息
  remark?: string;                 // 备注
  tags?: string[];                 // 标签
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  
  // 实例方法
  activate(): Promise<IWechatAccount>;
  suspend(reason?: string): Promise<IWechatAccount>;
  updateStats(): Promise<IWechatAccount>;
  checkApiLimit(): Promise<boolean>;
  validatePaymentConfig(): boolean;
}

/**
 * 微信账号数据模型
 */
const WechatAccountSchema = new Schema<IWechatAccount>({
  // 基本信息
  accountId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    comment: '账号ID（唯一标识）'
  },
  name: {
    type: String,
    required: true,
    comment: '账号名称'
  },
  displayName: {
    type: String,
    required: true,
    comment: '显示名称'
  },
  description: {
    type: String,
    comment: '账号描述'
  },
  avatar: {
    type: String,
    comment: '账号头像'
  },
  
  // 账号类型和状态
  type: {
    type: String,
    enum: Object.values(WechatAccountType),
    required: true,
    index: true,
    comment: '账号类型'
  },
  status: {
    type: String,
    enum: Object.values(WechatAccountStatus),
    default: WechatAccountStatus.PENDING,
    index: true,
    comment: '账号状态'
  },
  
  // 关联信息
  platformId: {
    type: String,
    required: true,
    index: true,
    comment: '所属平台ID'
  },
  
  // 微信官方信息
  appId: {
    type: String,
    required: true,
    unique: true,
    comment: '微信AppId'
  },
  appSecret: {
    type: String,
    required: function(this: any) {
      // 创建时必填，更新时可选
      return this.isNew;
    },
    comment: '微信AppSecret（加密存储）'
  },
  originalId: {
    type: String,
    comment: '微信原始ID'
  },
  
  // 支付配置
  mchId: {
    type: String,
    comment: '商户号'
  },
  mchKey: {
    type: String,
    comment: '商户密钥（加密存储）'
  },
  payNotifyUrl: {
    type: String,
    comment: '支付回调地址'
  },
  refundNotifyUrl: {
    type: String,
    comment: '退款回调地址'
  },
  
  // 证书配置
  certPath: {
    type: String,
    comment: '商户证书文件路径'
  },
  keyPath: {
    type: String,
    comment: '商户密钥文件路径'
  },
  
  // 业务配置
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
  enableMessage: {
    type: Boolean,
    default: false,
    comment: '是否启用消息推送'
  },
  
  // 限制配置
  dailyApiLimit: {
    type: Number,
    default: 100000,
    comment: '日API调用限制'
  },
  monthlyTransactionLimit: {
    type: Number,
    default: 10000000, // 100万分 = 1万元
    comment: '月交易限制（分）'
  },
  
  // 统计信息
  stats: {
    totalUsers: {
      type: Number,
      default: 0,
      comment: '总用户数'
    },
    totalTransactions: {
      type: Number,
      default: 0,
      comment: '总交易数'
    },
    totalRevenue: {
      type: Number,
      default: 0,
      comment: '总收入(分)'
    },
    lastActiveTime: {
      type: Date,
      comment: '最后活跃时间'
    },
    apiCallsToday: {
      type: Number,
      default: 0,
      comment: '今日API调用次数'
    }
  },
  
  // 联系信息
  contactName: {
    type: String,
    comment: '联系人姓名'
  },
  contactPhone: {
    type: String,
    comment: '联系电话'
  },
  contactEmail: {
    type: String,
    comment: '联系邮箱'
  },
  
  // 有效期
  validFrom: {
    type: Date,
    comment: '有效期开始'
  },
  validTo: {
    type: Date,
    comment: '有效期结束'
  },
  
  // 备注信息
  remark: {
    type: String,
    comment: '备注'
  },
  tags: [{
    type: String,
    comment: '标签'
  }],
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(_doc, ret) {
      // 删除敏感字段
      const retAny = ret as any;
      delete retAny.appSecret;
      delete retAny.mchKey;
      
      // 转换金额单位（分转元）
      if (retAny.stats?.totalRevenue) {
        retAny.stats.totalRevenueYuan = (retAny.stats.totalRevenue / 100).toFixed(2);
      }
      if (retAny.monthlyTransactionLimit) {
        retAny.monthlyTransactionLimitYuan = (retAny.monthlyTransactionLimit / 100).toFixed(2);
      }
      
      return ret;
    }
  }
});

// 创建索引
WechatAccountSchema.index({ platformId: 1, type: 1 });
WechatAccountSchema.index({ status: 1, createdAt: -1 });
WechatAccountSchema.index({ 'stats.lastActiveTime': -1 });
WechatAccountSchema.index({ validTo: 1 }, { sparse: true });

// 虚拟字段：状态文本
WechatAccountSchema.virtual('statusText').get(function() {
  const statusMap = {
    [WechatAccountStatus.ACTIVE]: '正常使用',
    [WechatAccountStatus.INACTIVE]: '已停用',
    [WechatAccountStatus.SUSPENDED]: '已暂停',
    [WechatAccountStatus.EXPIRED]: '已过期',
    [WechatAccountStatus.PENDING]: '待审核'
  };
  return statusMap[this.status] || '未知状态';
});

// 虚拟字段：类型文本
WechatAccountSchema.virtual('typeText').get(function() {
  const typeMap = {
    [WechatAccountType.MINIPROGRAM]: '小程序',
    [WechatAccountType.OFFICIAL_ACCOUNT]: '公众号',
    [WechatAccountType.ENTERPRISE]: '企业微信',
    [WechatAccountType.OPEN_PLATFORM]: '开放平台'
  };
  return typeMap[this.type] || '未知类型';
});

// 实例方法：激活账号
WechatAccountSchema.methods.activate = function() {
  this.status = WechatAccountStatus.ACTIVE;
  this.stats.lastActiveTime = new Date();
  return this.save();
};

// 实例方法：暂停账号
WechatAccountSchema.methods.suspend = function(reason?: string) {
  this.status = WechatAccountStatus.SUSPENDED;
  if (reason) {
    this.remark = (this.remark || '') + `\n暂停原因: ${reason}`;
  }
  return this.save();
};

// 实例方法：更新统计信息
WechatAccountSchema.methods.updateStats = async function() {
  const { WechatUser } = require('./wechatUser');
  const { WechatPayment } = require('./wechatPayment');
  
  // 更新用户统计 - 需要通过platformId查询，因为一个平台可能有多个微信账号
  this.stats.totalUsers = await WechatUser.countDocuments({ 
    platformId: this.platformId 
  });
  
  // 更新交易统计 - 同样通过platformId查询
  const paymentStats = await WechatPayment.aggregate([
    { $match: { platformId: this.platformId, status: 'PAID' } },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalRevenue: { $sum: '$totalFee' }
      }
    }
  ]);
  
  if (paymentStats.length > 0) {
    this.stats.totalTransactions = paymentStats[0].totalTransactions;
    this.stats.totalRevenue = paymentStats[0].totalRevenue;
  }
  
  this.stats.lastActiveTime = new Date();
  return this.save();
};

// 实例方法：检查API调用限制
WechatAccountSchema.methods.checkApiLimit = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 简化实现，实际应该从日志表查询
  return this.stats.apiCallsToday < (this.dailyApiLimit || 100000);
};

// 实例方法：验证支付配置
WechatAccountSchema.methods.validatePaymentConfig = function() {
  return !!(this.appId && this.appSecret && this.mchId && this.mchKey);
};

// 静态方法类型定义
interface WechatAccountModel extends mongoose.Model<IWechatAccount> {
  findByAccountId(accountId: string): Promise<IWechatAccount | null>;
  findByAppId(appId: string): Promise<IWechatAccount | null>;
  findByPlatformId(platformId: string, type?: WechatAccountType): Promise<IWechatAccount[]>;
  findActiveAccounts(): Promise<IWechatAccount[]>;
  searchAccounts(keyword: string, page?: number, limit?: number): Promise<{
    accounts: IWechatAccount[];
    total: number;
  }>;
}

// 静态方法：根据账号ID查找
WechatAccountSchema.statics.findByAccountId = function(accountId: string) {
  return this.findOne({ accountId, status: { $ne: WechatAccountStatus.INACTIVE } });
};

// 静态方法：根据AppId查找
WechatAccountSchema.statics.findByAppId = function(appId: string) {
  return this.findOne({ appId, status: { $ne: WechatAccountStatus.INACTIVE } });
};

// 静态方法：根据平台ID查找账号
WechatAccountSchema.statics.findByPlatformId = function(platformId: string, type?: WechatAccountType) {
  const query: any = { platformId, status: { $ne: WechatAccountStatus.INACTIVE } };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// 静态方法：获取活跃账号
WechatAccountSchema.statics.findActiveAccounts = function() {
  return this.find({ status: WechatAccountStatus.ACTIVE }).sort({ 'stats.lastActiveTime': -1 });
};

// 静态方法：搜索账号
WechatAccountSchema.statics.searchAccounts = async function(
  keyword: string,
  page: number = 1,
  limit: number = 20
) {
  const query = keyword ? {
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { displayName: { $regex: keyword, $options: 'i' } },
      { accountId: { $regex: keyword, $options: 'i' } },
      { appId: { $regex: keyword, $options: 'i' } }
    ]
  } : {};
  
  const accounts = await this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
    
  const total = await this.countDocuments(query);
  
  return { accounts, total };
};

export const WechatAccount = mongoose.model<IWechatAccount, WechatAccountModel>('WechatAccount', WechatAccountSchema);