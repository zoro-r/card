import mongoose, { Schema, Document } from 'mongoose';

/**
 * 企业信息接口定义
 */
export interface ICompany extends Document {
  // 基本信息
  name: string;                 // 企业名称
  displayName: string;          // 显示名称（可能包含简称）
  englishName?: string;         // 英文名称
  logo?: string;                // 企业Logo URL
  description?: string;         // 企业描述
  
  // 企业详细信息
  industry?: string;            // 所属行业
  scale?: string;               // 企业规模（如：1-50人，51-200人等）
  establishedYear?: number;     // 成立年份
  legalPerson?: string;         // 法人代表
  registeredCapital?: string;   // 注册资本
  businessScope?: string;       // 经营范围
  
  // 联系信息
  address?: string;             // 注册地址
  officeAddress?: string;       // 办公地址
  phone?: string;               // 企业电话
  email?: string;               // 企业邮箱
  website?: string;             // 官方网站
  
  // 社交媒体
  wechatAccount?: string;       // 微信公众号
  weiboAccount?: string;        // 官方微博
  linkedinAccount?: string;     // LinkedIn
  
  // 企业证件信息
  businessLicense?: string;     // 营业执照号
  taxNumber?: string;           // 税号
  organizationCode?: string;    // 组织机构代码
  creditCode?: string;          // 统一社会信用代码
  
  // 认证状态
  isVerified: boolean;          // 是否认证
  verifyType?: string;          // 认证类型（基础认证、高级认证等）
  verifyTime?: Date;            // 认证时间
  verifyExpiry?: Date;          // 认证到期时间
  
  // 平台相关
  appId: string;                // 微信小程序AppID
  
  // 状态信息
  isActive: boolean;            // 是否启用
  isPublic: boolean;            // 是否公开显示
  
  // 统计信息
  employeeCount: number;        // 员工数量（实际录入的名片数量）
  viewCount: number;            // 企业页面浏览次数
  
  // 配置信息
  theme?: string;               // 企业主题色
  settings?: {                  // 企业设置
    allowPublicSearch: boolean; // 允许公开搜索
    allowEmployeeJoin: boolean; // 允许员工自主加入
    requireApproval: boolean;   // 加入需要审批
  };
  
  // 创建者信息
  createdBy?: string;           // 创建者（Admin用户ID）
  lastModifiedBy?: string;      // 最后修改者
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  
  // 实例方法
  updateViewCount(): Promise<ICompany>;
  updateEmployeeCount(): Promise<ICompany>;
  checkVerificationStatus(): boolean;
}

/**
 * 企业数据模型
 */
const CompanySchema = new Schema<ICompany>({
  // 基本信息
  name: {
    type: String,
    required: true,
    index: true,
    comment: '企业名称'
  },
  displayName: {
    type: String,
    required: true,
    comment: '显示名称'
  },
  englishName: {
    type: String,
    comment: '英文名称'
  },
  logo: {
    type: String,
    comment: '企业Logo URL'
  },
  description: {
    type: String,
    comment: '企业描述'
  },
  
  // 企业详细信息
  industry: {
    type: String,
    index: true,
    comment: '所属行业'
  },
  scale: {
    type: String,
    enum: ['1-10人', '11-50人', '51-200人', '201-500人', '501-1000人', '1000人以上'],
    comment: '企业规模'
  },
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
    comment: '成立年份'
  },
  legalPerson: {
    type: String,
    comment: '法人代表'
  },
  registeredCapital: {
    type: String,
    comment: '注册资本'
  },
  businessScope: {
    type: String,
    comment: '经营范围'
  },
  
  // 联系信息
  address: {
    type: String,
    comment: '注册地址'
  },
  officeAddress: {
    type: String,
    comment: '办公地址'
  },
  phone: {
    type: String,
    comment: '企业电话'
  },
  email: {
    type: String,
    lowercase: true,
    comment: '企业邮箱'
  },
  website: {
    type: String,
    comment: '官方网站'
  },
  
  // 社交媒体
  wechatAccount: {
    type: String,
    comment: '微信公众号'
  },
  weiboAccount: {
    type: String,
    comment: '官方微博'
  },
  linkedinAccount: {
    type: String,
    comment: 'LinkedIn'
  },
  
  // 企业证件信息
  businessLicense: {
    type: String,
    comment: '营业执照号'
  },
  taxNumber: {
    type: String,
    comment: '税号'
  },
  organizationCode: {
    type: String,
    comment: '组织机构代码'
  },
  creditCode: {
    type: String,
    unique: true,
    sparse: true,
    comment: '统一社会信用代码'
  },
  
  // 认证状态
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
    comment: '是否认证'
  },
  verifyType: {
    type: String,
    enum: ['basic', 'advanced', 'premium'],
    comment: '认证类型'
  },
  verifyTime: {
    type: Date,
    comment: '认证时间'
  },
  verifyExpiry: {
    type: Date,
    comment: '认证到期时间'
  },
  
  // 平台相关
  appId: {
    type: String,
    required: true,
    index: true,
    comment: '微信小程序AppID'
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
    comment: '是否公开显示'
  },
  
  // 统计信息
  employeeCount: {
    type: Number,
    default: 0,
    comment: '员工数量'
  },
  viewCount: {
    type: Number,
    default: 0,
    comment: '浏览次数'
  },
  
  // 配置信息
  theme: {
    type: String,
    default: '#1890ff',
    comment: '企业主题色'
  },
  settings: {
    allowPublicSearch: {
      type: Boolean,
      default: true,
      comment: '允许公开搜索'
    },
    allowEmployeeJoin: {
      type: Boolean,
      default: false,
      comment: '允许员工自主加入'
    },
    requireApproval: {
      type: Boolean,
      default: true,
      comment: '加入需要审批'
    }
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
CompanySchema.index({ name: 1, appId: 1 }, { unique: true });
CompanySchema.index({ appId: 1, isActive: 1, isPublic: 1 });
CompanySchema.index({ appId: 1, industry: 1, isActive: 1 });
CompanySchema.index({ appId: 1, isVerified: 1, isActive: 1 });
CompanySchema.index({ createdAt: -1 });
CompanySchema.index({ viewCount: -1 });
CompanySchema.index({ employeeCount: -1 });

// 文本搜索索引
CompanySchema.index({
  name: 'text',
  displayName: 'text',
  englishName: 'text',
  description: 'text'
}, {
  name: 'company_text_search'
});

// 虚拟字段：认证状态文字
CompanySchema.virtual('verifyStatusText').get(function() {
  if (!this.isVerified) return '未认证';
  if (!this.verifyExpiry) return '已认证';
  return new Date() > this.verifyExpiry ? '认证已过期' : '已认证';
});

// 虚拟字段：企业规模数值（用于排序）
CompanySchema.virtual('scaleOrder').get(function() {
  const scaleMap: { [key: string]: number } = {
    '1-10人': 1,
    '11-50人': 2,
    '51-200人': 3,
    '201-500人': 4,
    '501-1000人': 5,
    '1000人以上': 6
  };
  return scaleMap[this.scale || ''] || 0;
});

// 实例方法：更新浏览次数
CompanySchema.methods.updateViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// 实例方法：更新员工数量（通常在名片增删时调用）
CompanySchema.methods.updateEmployeeCount = async function() {
  const BusinessCard = mongoose.model('BusinessCard');
  const count = await BusinessCard.countDocuments({ companyId: this._id, isActive: true });
  this.employeeCount = count;
  return this.save();
};

// 实例方法：检查认证状态
CompanySchema.methods.checkVerificationStatus = function() {
  if (!this.isVerified || !this.verifyExpiry) return this.isVerified;
  return new Date() <= this.verifyExpiry;
};

// 静态方法类型定义
interface CompanyModel extends mongoose.Model<ICompany> {
  findByName(name: string, appId: string): Promise<ICompany | null>;
  findByCreditCode(creditCode: string, appId: string): Promise<ICompany | null>;
  searchCompanies(keyword: string, appId: string, options?: any): Promise<ICompany[]>;
  getVerifiedCompanies(appId: string, limit?: number): Promise<ICompany[]>;
  getCompaniesByIndustry(industry: string, appId: string): Promise<ICompany[]>;
}

// 静态方法：根据企业名称查找
CompanySchema.statics.findByName = function(name: string, appId: string) {
  return this.findOne({ name, appId, isActive: true });
};

// 静态方法：根据统一社会信用代码查找
CompanySchema.statics.findByCreditCode = function(creditCode: string, appId: string) {
  return this.findOne({ creditCode, appId, isActive: true });
};

// 静态方法：搜索企业
CompanySchema.statics.searchCompanies = function(keyword: string, appId: string, options: any = {}) {
  const {
    industry,
    scale,
    isVerified,
    isPublic = true,
    limit = 20,
    skip = 0
  } = options;
  
  const query: any = {
    appId,
    isActive: true,
    isPublic
  };
  
  if (industry) query.industry = industry;
  if (scale) query.scale = scale;
  if (typeof isVerified === 'boolean') query.isVerified = isVerified;
  
  if (keyword) {
    query.$or = [
      { name: new RegExp(keyword, 'i') },
      { displayName: new RegExp(keyword, 'i') },
      { englishName: new RegExp(keyword, 'i') },
      { description: new RegExp(keyword, 'i') }
    ];
  }
  
  return this.find(query)
    .sort({ isVerified: -1, employeeCount: -1, viewCount: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// 静态方法：获取认证企业
CompanySchema.statics.getVerifiedCompanies = function(appId: string, limit: number = 10) {
  return this.find({
    appId,
    isActive: true,
    isPublic: true,
    isVerified: true
  })
  .sort({ verifyTime: -1, employeeCount: -1 })
  .limit(limit);
};

// 静态方法：根据行业获取企业
CompanySchema.statics.getCompaniesByIndustry = function(industry: string, appId: string) {
  return this.find({
    appId,
    industry,
    isActive: true,
    isPublic: true
  })
  .sort({ isVerified: -1, employeeCount: -1 });
};

export const Company = mongoose.model<ICompany, CompanyModel>('Company', CompanySchema);