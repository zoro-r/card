import mongoose, { Schema, Document } from 'mongoose';

/**
 * 名片信息接口定义
 */
export interface IBusinessCard extends Document {
  // 关联员工
  employeeId: mongoose.Types.ObjectId;  // 员工ID（外键，指向CompanyEmployee）
  
  // 基本信息（从员工信息复制过来，用于名片展示）
  name: string;                 // 姓名
  title: string;                // 职位/头衔
  companyName?: string;         // 公司名称（冗余字段，便于查询）
  department?: string;          // 部门
  avatar?: string;              // 头像URL
  
  // 联系方式
  phone?: string;               // 手机号码
  email?: string;               // 电子邮箱
  wechat?: string;              // 微信号
  address?: string;             // 地址
  website?: string;             // 网站
  
  // 社交媒体
  linkedin?: string;            // LinkedIn
  weibo?: string;               // 微博
  
  // 个人介绍
  introduction?: string;        // 个人简介
  specialties?: string[];       // 专长领域
  services?: string[];          // 提供服务
  
  // 平台相关（移除直接的微信关联，通过员工关联获取）
  appId: string;                // 微信小程序AppID（用于平台区分）
  
  // 二维码信息
  qrCode?: string;              // 名片二维码URL
  qrCodeExpiry?: Date;          // 二维码过期时间
  
  // 状态信息
  isActive: boolean;            // 是否启用
  isPublic: boolean;            // 是否公开（其他用户是否可搜索到）
  isVerified: boolean;          // 是否验证通过
  
  // 访问统计
  viewCount: number;            // 浏览次数
  shareCount: number;           // 分享次数
  contactCount: number;         // 被联系次数
  
  // 分类标签
  tags?: string[];              // 标签
  category?: string;            // 类别（如：销售、技术、管理等）
  
  // 额外配置
  theme?: string;               // 名片主题样式
  backgroundColor?: string;     // 背景色
  textColor?: string;           // 文字颜色
  
  // 创建者信息
  createdBy?: string;           // 创建者（Admin用户ID）
  lastModifiedBy?: string;      // 最后修改者
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  
  // 实例方法
  updateViewCount(): Promise<IBusinessCard>;
  updateShareCount(): Promise<IBusinessCard>;
  updateContactCount(): Promise<IBusinessCard>;
  generateQRCode(): Promise<string>;
}

/**
 * 名片数据模型
 */
const BusinessCardSchema = new Schema<IBusinessCard>({
  // 关联员工
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyEmployee',
    required: true,
    unique: true,
    index: true,
    comment: '员工ID（外键）'
  },
  
  // 基本信息
  name: {
    type: String,
    required: true,
    index: true,
    comment: '姓名'
  },
  title: {
    type: String,
    required: true,
    comment: '职位/头衔'
  },
  companyName: {
    type: String,
    index: true,
    comment: '公司名称（冗余字段，便于查询）'
  },
  department: {
    type: String,
    default: '',
    comment: '部门'
  },
  avatar: {
    type: String,
    default: '',
    comment: '头像URL'
  },
  
  // 联系方式
  phone: {
    type: String,
    index: true,
    sparse: true,
    comment: '手机号码'
  },
  email: {
    type: String,
    index: true,
    sparse: true,
    lowercase: true,
    comment: '电子邮箱'
  },
  wechat: {
    type: String,
    comment: '微信号'
  },
  address: {
    type: String,
    comment: '地址'
  },
  website: {
    type: String,
    comment: '网站'
  },
  
  // 社交媒体
  linkedin: {
    type: String,
    comment: 'LinkedIn'
  },
  weibo: {
    type: String,
    comment: '微博'
  },
  
  // 个人介绍
  introduction: {
    type: String,
    default: '',
    comment: '个人简介'
  },
  specialties: [{
    type: String,
    comment: '专长领域'
  }],
  services: [{
    type: String,
    comment: '提供服务'
  }],
  
  // 平台相关
  appId: {
    type: String,
    required: true,
    index: true,
    comment: '微信小程序AppID'
  },
  
  // 二维码信息
  qrCode: {
    type: String,
    comment: '名片二维码URL'
  },
  qrCodeExpiry: {
    type: Date,
    comment: '二维码过期时间'
  },
  
  // 状态信息
  isActive: {
    type: Boolean,
    default: true,
    index: true,
    comment: '是否启用'
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true,
    comment: '是否公开'
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
    comment: '是否验证通过'
  },
  
  // 访问统计
  viewCount: {
    type: Number,
    default: 0,
    comment: '浏览次数'
  },
  shareCount: {
    type: Number,
    default: 0,
    comment: '分享次数'
  },
  contactCount: {
    type: Number,
    default: 0,
    comment: '被联系次数'
  },
  
  // 分类标签
  tags: [{
    type: String,
    comment: '标签'
  }],
  category: {
    type: String,
    index: true,
    comment: '类别'
  },
  
  // 额外配置
  theme: {
    type: String,
    default: 'default',
    comment: '名片主题样式'
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
    comment: '背景色'
  },
  textColor: {
    type: String,
    default: '#333333',
    comment: '文字颜色'
  },
  
  // 创建者信息
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser',
    comment: '创建者'
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser',
    comment: '最后修改者'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: function(_doc, ret) {
      // 可根据需要隐藏敏感字段
      return ret;
    }
  }
});

// 创建复合索引
BusinessCardSchema.index({ name: 1, companyId: 1, appId: 1 });
BusinessCardSchema.index({ name: 1, company: 1, appId: 1 }); // 兼容索引
BusinessCardSchema.index({ companyId: 1, isActive: 1 });
BusinessCardSchema.index({ appId: 1, isActive: 1, isPublic: 1 });
BusinessCardSchema.index({ appId: 1, category: 1, isActive: 1 });
BusinessCardSchema.index({ email: 1, appId: 1 }, { sparse: true });
BusinessCardSchema.index({ phone: 1, appId: 1 }, { sparse: true });
BusinessCardSchema.index({ createdAt: -1 });
BusinessCardSchema.index({ viewCount: -1 });

// 文本搜索索引
BusinessCardSchema.index({
  name: 'text',
  company: 'text',
  title: 'text',
  introduction: 'text'
}, {
  name: 'business_card_text_search'
});

// 虚拟字段：完整显示名称
BusinessCardSchema.virtual('fullDisplayName').get(function() {
  const companyName = this.companyName || '';
  return companyName ? `${this.name} - ${this.title} @ ${companyName}` : `${this.name} - ${this.title}`;
});

// 虚拟字段：员工信息
BusinessCardSchema.virtual('employee', {
  ref: 'CompanyEmployee',
  localField: 'employeeId',
  foreignField: '_id',
  justOne: true
});

// 虚拟字段：微信用户信息（通过员工关联）
BusinessCardSchema.virtual('wechatUser', {
  ref: 'WechatUser',
  localField: 'employee.unionid',
  foreignField: 'unionid',
  justOne: true
});

// 虚拟字段：二维码是否有效
BusinessCardSchema.virtual('isQRCodeValid').get(function() {
  if (!this.qrCode || !this.qrCodeExpiry) return false;
  return new Date() < this.qrCodeExpiry;
});

// 实例方法：更新浏览次数
BusinessCardSchema.methods.updateViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// 实例方法：更新分享次数
BusinessCardSchema.methods.updateShareCount = function() {
  this.shareCount += 1;
  return this.save();
};

// 实例方法：更新联系次数
BusinessCardSchema.methods.updateContactCount = function() {
  this.contactCount += 1;
  return this.save();
};

// 实例方法：生成二维码（占位方法，具体实现需要集成二维码生成服务）
BusinessCardSchema.methods.generateQRCode = async function() {
  // 生成包含名片ID的链接
  const cardUrl = `https://your-domain.com/card/${this._id}`;
  
  // 设置二维码过期时间（30天后）
  this.qrCodeExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // 这里应该调用二维码生成服务，暂时返回占位URL
  this.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cardUrl)}`;
  
  await this.save();
  return this.qrCode;
};

// 静态方法类型定义
interface BusinessCardModel extends mongoose.Model<IBusinessCard> {
  findByPhone(phone: string, appId: string): Promise<IBusinessCard | null>;
  findByEmail(email: string, appId: string): Promise<IBusinessCard | null>;
  findByUnionid(unionid: string, appId: string): Promise<IBusinessCard | null>;
  findByCompany(companyId: string, appId: string): Promise<IBusinessCard[]>;
  findByCompanyName(companyName: string, appId: string): Promise<IBusinessCard[]>;
  searchCards(keyword: string, appId: string, options?: any): Promise<IBusinessCard[]>;
  getPopularCards(appId: string, limit?: number): Promise<IBusinessCard[]>;
}

// 静态方法：根据手机号查找名片
BusinessCardSchema.statics.findByPhone = function(phone: string, appId: string) {
  return this.findOne({ phone, appId, isActive: true });
};

// 静态方法：根据邮箱查找名片
BusinessCardSchema.statics.findByEmail = function(email: string, appId: string) {
  return this.findOne({ email: email.toLowerCase(), appId, isActive: true });
};

// 静态方法：根据unionid查找名片（通过员工关联）
BusinessCardSchema.statics.findByUnionid = async function(unionid: string, appId: string) {
  const CompanyEmployee = mongoose.model('CompanyEmployee');
  const employee = await CompanyEmployee.findOne({ unionid, appId, isActive: true });
  if (!employee) return null;
  
  return this.findOne({ employeeId: employee._id, isActive: true })
    .populate('employee')
    .populate({
      path: 'employee',
      populate: {
        path: 'companyInfo'
      }
    });
};

// 静态方法：根据企业ID查找名片
BusinessCardSchema.statics.findByCompany = function(companyId: string, appId: string) {
  return this.find({ companyId, appId, isActive: true }).populate('companyInfo');
};

// 静态方法：根据企业名称查找名片（兼容方法）
BusinessCardSchema.statics.findByCompanyName = function(companyName: string, appId: string) {
  return this.find({ 
    $or: [
      { company: new RegExp(companyName, 'i') }
      // 也查询关联企业名称匹配的
    ],
    appId, 
    isActive: true 
  }).populate('companyInfo');
};

// 静态方法：搜索名片
BusinessCardSchema.statics.searchCards = function(keyword: string, appId: string, options: any = {}) {
  const {
    category,
    isPublic = true,
    limit = 20,
    skip = 0
  } = options;
  
  const query: any = {
    appId,
    isActive: true,
    isPublic
  };
  
  if (category) {
    query.category = category;
  }
  
  if (keyword) {
    query.$or = [
      { name: new RegExp(keyword, 'i') },
      { company: new RegExp(keyword, 'i') },
      { title: new RegExp(keyword, 'i') },
      { introduction: new RegExp(keyword, 'i') }
    ];
  }
  
  return this.find(query)
    .populate('companyInfo')
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// 静态方法：获取热门名片
BusinessCardSchema.statics.getPopularCards = function(appId: string, limit: number = 10) {
  return this.find({
    appId,
    isActive: true,
    isPublic: true
  })
  .populate('companyInfo')
  .sort({ viewCount: -1, shareCount: -1 })
  .limit(limit);
};

export const BusinessCard = mongoose.model<IBusinessCard, BusinessCardModel>('BusinessCard', BusinessCardSchema);