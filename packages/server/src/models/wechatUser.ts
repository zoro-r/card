import mongoose, { Schema, Document } from 'mongoose';

/**
 * 微信用户接口定义
 */
export interface IWechatUser extends Document {
  // 微信相关字段
  openid: string;           // 微信开放平台唯一标识
  unionid?: string;         // 微信开放平台联合标识（可选）
  sessionKey: string;       // 微信会话密钥（加密存储）
  
  // 用户基本信息
  nickName?: string;        // 用户昵称
  avatarUrl?: string;       // 用户头像URL
  gender?: number;          // 性别：0-未知，1-男，2-女
  city?: string;            // 城市
  province?: string;        // 省份
  country?: string;         // 国家
  language?: string;        // 语言
  
  // 联系方式
  phone?: string;           // 手机号码
  phoneCountryCode?: string;// 手机号国家码
  
  // 平台相关
  platformId: string;       // 小程序平台ID（支持多个小程序）
  
  // 状态信息
  isActive: boolean;        // 是否活跃
  isBlocked: boolean;       // 是否被封禁
  lastLoginTime?: Date;     // 最后登录时间
  registerTime: Date;       // 注册时间
  
  // 统计信息
  loginCount: number;       // 登录次数
  
  // 扩展字段
  tags?: string[];          // 用户标签
  remark?: string;          // 备注信息
  source?: string;          // 来源渠道
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;

  // 实例方法
  updateLoginInfo(): Promise<IWechatUser>;
}

/**
 * 微信用户数据模型
 */
const WechatUserSchema = new Schema<IWechatUser>({
  // 微信相关字段
  openid: {
    type: String,
    required: true,
    index: true,
    comment: '微信openid'
  },
  unionid: {
    type: String,
    index: true,
    sparse: true,
    comment: '微信unionid'
  },
  sessionKey: {
    type: String,
    required: true,
    comment: '微信会话密钥（加密存储）'
  },
  
  // 用户基本信息
  nickName: {
    type: String,
    default: '',
    comment: '用户昵称'
  },
  avatarUrl: {
    type: String,
    default: '',
    comment: '用户头像URL'
  },
  gender: {
    type: Number,
    default: 0,
    enum: [0, 1, 2],
    comment: '性别：0-未知，1-男，2-女'
  },
  city: {
    type: String,
    default: '',
    comment: '城市'
  },
  province: {
    type: String,
    default: '',
    comment: '省份'
  },
  country: {
    type: String,
    default: '',
    comment: '国家'
  },
  language: {
    type: String,
    default: 'zh_CN',
    comment: '语言'
  },
  
  // 联系方式
  phone: {
    type: String,
    index: true,
    sparse: true,
    comment: '手机号码'
  },
  phoneCountryCode: {
    type: String,
    default: '86',
    comment: '手机号国家码'
  },
  
  // 平台相关
  platformId: {
    type: String,
    required: true,
    index: true,
    comment: '小程序平台ID'
  },
  
  // 状态信息
  isActive: {
    type: Boolean,
    default: true,
    comment: '是否活跃'
  },
  isBlocked: {
    type: Boolean,
    default: false,
    comment: '是否被封禁'
  },
  lastLoginTime: {
    type: Date,
    comment: '最后登录时间'
  },
  registerTime: {
    type: Date,
    default: Date.now,
    comment: '注册时间'
  },
  
  // 统计信息
  loginCount: {
    type: Number,
    default: 0,
    comment: '登录次数'
  },
  
  // 扩展字段
  tags: [{
    type: String,
    comment: '用户标签'
  }],
  remark: {
    type: String,
    default: '',
    comment: '备注信息'
  },
  source: {
    type: String,
    default: '',
    comment: '来源渠道'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(_doc, ret) {
      // 删除敏感字段
      const retAny = ret as any;
      delete retAny.sessionKey;
      return ret;
    }
  }
});

// 创建复合索引
WechatUserSchema.index({ openid: 1, platformId: 1 }, { unique: true });
WechatUserSchema.index({ unionid: 1, platformId: 1 }, { sparse: true });
WechatUserSchema.index({ phone: 1, platformId: 1 }, { sparse: true });
WechatUserSchema.index({ registerTime: -1 });
WechatUserSchema.index({ lastLoginTime: -1 });
WechatUserSchema.index({ isActive: 1, isBlocked: 1 });

// 虚拟字段：格式化性别
WechatUserSchema.virtual('genderText').get(function() {
  const genderMap: { [key: number]: string } = { 0: '未知', 1: '男', 2: '女' };
  return genderMap[this.gender ?? 0] || '未知';
});

// 实例方法：更新登录信息
WechatUserSchema.methods.updateLoginInfo = function() {
  this.lastLoginTime = new Date();
  this.loginCount += 1;
  return this.save();
};

// 静态方法类型定义
interface WechatUserModel extends mongoose.Model<IWechatUser> {
  findByOpenid(openid: string, platformId: string): Promise<IWechatUser | null>;
  findByUnionid(unionid: string): Promise<IWechatUser | null>;
  findByPhone(phone: string, platformId?: string): Promise<IWechatUser | null>;
}

// 静态方法：根据openid和平台ID查找用户
WechatUserSchema.statics.findByOpenid = function(openid: string, platformId: string) {
  return this.findOne({ openid, platformId });
};

// 静态方法：根据unionid查找用户
WechatUserSchema.statics.findByUnionid = function(unionid: string) {
  return this.findOne({ unionid });
};

// 静态方法：根据手机号查找用户
WechatUserSchema.statics.findByPhone = function(phone: string, platformId?: string) {
  const query: any = { phone };
  if (platformId) {
    query.platformId = platformId;
  }
  return this.findOne(query);
};

export const WechatUser = mongoose.model<IWechatUser, WechatUserModel>('WechatUser', WechatUserSchema);