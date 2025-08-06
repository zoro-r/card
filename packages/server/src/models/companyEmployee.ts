import mongoose, { Schema, Document } from 'mongoose';

/**
 * 企业员工关系接口定义
 */
export interface ICompanyEmployee extends Document {
  // 基本关联信息
  companyId: mongoose.Types.ObjectId;            // 企业ID（外键）
  
  // 基本员工信息
  name: string;                 // 员工姓名
  phone?: string;               // 手机号码
  email?: string;               // 电子邮箱
  avatar?: string;              // 头像URL
  
  // 职位信息
  position: string;             // 职位名称
  department?: string;          // 部门
  level?: string;               // 职级（如：初级、中级、高级、主管、经理、总监等）
  
  // 入职信息
  joinDate: Date;               // 入职日期
  probationEndDate?: Date;      // 试用期结束日期
  contractType?: string;        // 合同类型（全职、兼职、实习、外包等）
  
  // 权限信息
  permissions: string[];        // 员工在企业内的权限列表
  canManageEmployees: boolean;  // 是否可以管理其他员工
  canEditCompanyInfo: boolean;  // 是否可以编辑企业信息
  
  // 状态信息
  status: string;               // 员工状态（在职、离职、休假、停职等）
  isActive: boolean;            // 是否启用
  isManager: boolean;           // 是否为管理人员
  
  // 联系相关
  workEmail?: string;           // 工作邮箱
  workPhone?: string;           // 工作电话
  extension?: string;           // 分机号
  workAddress?: string;         // 工作地址
  
  // 薪资相关（敏感信息，可选）
  salary?: number;              // 薪资（加密存储）
  salaryGrade?: string;         // 薪资等级
  
  // 考勤相关
  workSchedule?: {              // 工作时间安排
    workDays: string[];         // 工作日（周一到周日）
    startTime: string;          // 开始时间
    endTime: string;            // 结束时间
    timezone?: string;          // 时区
  };
  
  // 报告关系
  supervisorId?: mongoose.Types.ObjectId;        // 直属上级的员工ID
  subordinateIds: mongoose.Types.ObjectId[];     // 下属员工ID列表
  
  // 审批相关
  approvalStatus?: string;      // 审批状态（待审批、已通过、已拒绝）
  approvedBy?: mongoose.Types.ObjectId;          // 审批人ID
  approvedAt?: Date;            // 审批时间
  
  // 备注信息  
  notes?: string;               // 备注
  tags?: string[];              // 标签
  
  // 微信用户关联
  unionid?: string;             // 微信用户unionid（与WechatUser一对一关联）
  bindTime?: Date;              // 绑定时间
  
  // 平台相关
  appId: string;                // 微信小程序AppID
  
  // 创建者信息
  createdBy?: mongoose.Types.ObjectId;           // 创建者（Admin用户ID）
  lastModifiedBy?: mongoose.Types.ObjectId;      // 最后修改者
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  
  // 实例方法
  updateStatus(newStatus: string): Promise<ICompanyEmployee>;
  addPermission(permission: string): Promise<ICompanyEmployee>;
  removePermission(permission: string): Promise<ICompanyEmployee>;
  calculateWorkDays(startDate: Date, endDate: Date): number;
  bindWechatUser(unionid: string): Promise<ICompanyEmployee>;
  unbindWechatUser(): Promise<ICompanyEmployee>;
}

/**
 * 企业员工数据模型
 */
const CompanyEmployeeSchema = new Schema<ICompanyEmployee>({
  // 基本关联信息
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
    comment: '企业ID'
  },
  
  // 基本员工信息
  name: {
    type: String,
    required: true,
    comment: '员工姓名'
  },
  phone: {
    type: String,
    comment: '手机号码'
  },
  email: {
    type: String,
    lowercase: true,
    comment: '电子邮箱'
  },
  avatar: {
    type: String,
    comment: '头像URL'
  },
  
  // 职位信息
  position: {
    type: String,
    required: true,
    comment: '职位名称'
  },
  department: {
    type: String,
    comment: '部门'
  },
  level: {
    type: String,
    enum: ['实习生', '初级', '中级', '高级', '专家', '主管', '经理', '总监', '副总', '总裁'],
    comment: '职级'
  },
  
  // 入职信息
  joinDate: {
    type: Date,
    required: true,
    comment: '入职日期'
  },
  probationEndDate: {
    type: Date,
    comment: '试用期结束日期'
  },
  contractType: {
    type: String,
    enum: ['全职', '兼职', '实习', '外包', '顾问', '临时'],
    default: '全职',
    comment: '合同类型'
  },
  
  // 权限信息
  permissions: [{
    type: String,
    comment: '权限列表'
  }],
  canManageEmployees: {
    type: Boolean,
    default: false,
    comment: '是否可以管理其他员工'
  },
  canEditCompanyInfo: {
    type: Boolean,
    default: false,
    comment: '是否可以编辑企业信息'
  },
  
  // 状态信息
  status: {
    type: String,
    enum: ['在职', '离职', '休假', '停职', '待入职'],
    default: '在职',
    index: true,
    comment: '员工状态'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
    comment: '是否启用'
  },
  isManager: {
    type: Boolean,
    default: false,
    index: true,
    comment: '是否为管理人员'
  },
  
  // 联系相关
  workEmail: {
    type: String,
    lowercase: true,
    comment: '工作邮箱'
  },
  workPhone: {
    type: String,
    comment: '工作电话'
  },
  extension: {
    type: String,
    comment: '分机号'
  },
  workAddress: {
    type: String,
    comment: '工作地址'
  },
  
  // 薪资相关（敏感信息）
  salary: {
    type: Number,
    comment: '薪资（加密存储）'
  },
  salaryGrade: {
    type: String,
    comment: '薪资等级'
  },
  
  // 工作时间安排
  workSchedule: {
    workDays: [{
      type: String,
      enum: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    }],
    startTime: {
      type: String,
      comment: '开始时间，格式：HH:mm'
    },
    endTime: {
      type: String,
      comment: '结束时间，格式：HH:mm'
    },
    timezone: {
      type: String,
      default: 'Asia/Shanghai',
      comment: '时区'
    }
  },
  
  // 报告关系
  supervisorId: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyEmployee',
    comment: '直属上级的员工ID'
  },
  subordinateIds: [{
    type: Schema.Types.ObjectId,
    ref: 'CompanyEmployee',
    comment: '下属员工ID列表'
  }],
  
  // 审批相关
  approvalStatus: {
    type: String,
    enum: ['待审批', '已通过', '已拒绝'],
    default: '已通过',
    comment: '审批状态'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser',
    comment: '审批人ID'
  },
  approvedAt: {
    type: Date,
    comment: '审批时间'
  },
  
  // 备注信息
  notes: {
    type: String,
    comment: '备注'
  },
  tags: [{
    type: String,
    comment: '标签'
  }],
  
  // 微信用户关联
  unionid: {
    type: String,
    index: true,
    sparse: true,
    comment: '微信用户unionid（与WechatUser一对一关联）'
  },
  bindTime: {
    type: Date,
    comment: '绑定时间'
  },
  
  // 平台相关
  appId: {
    type: String,
    required: true,
    index: true,
    comment: '微信小程序AppID'
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
    transform: function(doc: any, ret: any) {
      // 隐藏敏感信息
      if (ret.salary) {
        delete ret.salary; // 前端不返回薪资信息
      }
      return ret;
    }
  }
});

// 创建复合索引
CompanyEmployeeSchema.index({ companyId: 1, phone: 1 }, { unique: true, sparse: true }); // 确保同一企业中手机号唯一（如果提供）
CompanyEmployeeSchema.index({ companyId: 1, email: 1 }, { unique: true, sparse: true }); // 确保同一企业中邮箱唯一（如果提供）
CompanyEmployeeSchema.index({ unionid: 1 }, { unique: true, sparse: true }); // 确保unionid全局唯一（如果提供）
CompanyEmployeeSchema.index({ companyId: 1, status: 1, isActive: 1 });
CompanyEmployeeSchema.index({ companyId: 1, department: 1, isActive: 1 });
CompanyEmployeeSchema.index({ companyId: 1, level: 1, isActive: 1 });
CompanyEmployeeSchema.index({ companyId: 1, isManager: 1, isActive: 1 });
CompanyEmployeeSchema.index({ supervisorId: 1 });
CompanyEmployeeSchema.index({ appId: 1, status: 1 });
CompanyEmployeeSchema.index({ joinDate: -1 });
CompanyEmployeeSchema.index({ createdAt: -1 });

// 文本搜索索引
CompanyEmployeeSchema.index({
  name: 'text',
  position: 'text',
  department: 'text',
  notes: 'text'
}, {
  name: 'employee_text_search'
});

// 虚拟字段：名片信息
CompanyEmployeeSchema.virtual('businessCard', {
  ref: 'BusinessCard',
  localField: '_id',
  foreignField: 'employeeId',
  justOne: true
});

// 虚拟字段：企业信息
CompanyEmployeeSchema.virtual('companyInfo', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

// 虚拟字段：微信用户信息
CompanyEmployeeSchema.virtual('wechatUser', {
  ref: 'WechatUser',
  localField: 'unionid',
  foreignField: 'unionid',
  justOne: true
});

// 虚拟字段：上级信息
CompanyEmployeeSchema.virtual('supervisorInfo', {
  ref: 'CompanyEmployee',
  localField: 'supervisorId',
  foreignField: '_id',
  justOne: true
});

// 虚拟字段：下属信息
CompanyEmployeeSchema.virtual('subordinateInfo', {
  ref: 'CompanyEmployee',
  localField: 'subordinateIds',
  foreignField: '_id'
});

// 虚拟字段：工作天数
CompanyEmployeeSchema.virtual('workingDays').get(function(this: ICompanyEmployee) {
  const now = new Date();
  const joinDate = new Date(this.joinDate);
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// 虚拟字段：是否在试用期
CompanyEmployeeSchema.virtual('isProbation').get(function(this: ICompanyEmployee) {
  if (!this.probationEndDate) return false;
  return new Date() < new Date(this.probationEndDate);
});

// 实例方法：更新状态
CompanyEmployeeSchema.methods.updateStatus = function(newStatus: string) {
  this.status = newStatus;
  if (newStatus === '离职') {
    this.isActive = false;
  }
  return this.save();
};

// 实例方法：添加权限
CompanyEmployeeSchema.methods.addPermission = function(permission: string) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

// 实例方法：移除权限
CompanyEmployeeSchema.methods.removePermission = function(permission: string) {
  this.permissions = this.permissions.filter((p: string) => p !== permission);
  return this.save();
};

// 实例方法：计算工作天数
CompanyEmployeeSchema.methods.calculateWorkDays = function(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workDays = 0;
  
  const workDaysList = this.workSchedule?.workDays || ['周一', '周二', '周三', '周四', '周五'];
  const dayMapping = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayName = dayMapping[d.getDay()];
    if (workDaysList.includes(dayName)) {
      workDays++;
    }
  }
  
  return workDays;
};

// 实例方法：绑定微信用户
CompanyEmployeeSchema.methods.bindWechatUser = function(unionid: string) {
  this.unionid = unionid;
  this.bindTime = new Date();
  return this.save();
};

// 实例方法：解绑微信用户
CompanyEmployeeSchema.methods.unbindWechatUser = function() {
  this.unionid = undefined;
  this.bindTime = undefined;
  return this.save();
};

// 静态方法类型定义
interface CompanyEmployeeModel extends mongoose.Model<ICompanyEmployee> {
  findByCompany(companyId: string, appId: string): Promise<ICompanyEmployee[]>;
  findByDepartment(companyId: string, department: string, appId: string): Promise<ICompanyEmployee[]>;
  findManagers(companyId: string, appId: string): Promise<ICompanyEmployee[]>;
  findSubordinates(supervisorId: string, appId: string): Promise<ICompanyEmployee[]>;
  searchEmployees(keyword: string, companyId: string, appId: string, options?: any): Promise<ICompanyEmployee[]>;
  getEmployeeStats(companyId: string, appId: string): Promise<any>;
  findByUnionid(unionid: string): Promise<ICompanyEmployee | null>;
}

// 静态方法：根据企业获取员工
CompanyEmployeeSchema.statics.findByCompany = function(companyId: string, appId: string) {
  return this.find({ companyId, appId, isActive: true })
    .populate('businessCard')
    .populate('companyInfo')
    .populate('supervisorInfo');
};

// 静态方法：根据部门获取员工
CompanyEmployeeSchema.statics.findByDepartment = function(companyId: string, department: string, appId: string) {
  return this.find({ companyId, department, appId, isActive: true })
    .populate('businessCard')
    .sort({ level: 1, joinDate: 1 });
};

// 静态方法：获取管理人员
CompanyEmployeeSchema.statics.findManagers = function(companyId: string, appId: string) {
  return this.find({ companyId, appId, isActive: true, isManager: true })
    .populate('businessCard')
    .sort({ level: 1 });
};

// 静态方法：获取下属
CompanyEmployeeSchema.statics.findSubordinates = function(supervisorId: string, appId: string) {
  return this.find({ supervisorId, appId, isActive: true })
    .populate('businessCard')
    .sort({ joinDate: 1 });
};

// 静态方法：搜索员工
CompanyEmployeeSchema.statics.searchEmployees = function(keyword: string, companyId: string, appId: string, options: any = {}) {
  const {
    department,
    level,
    status = '在职',
    isManager,
    limit = 20,
    skip = 0
  } = options;
  
  const query: any = {
    companyId,
    appId,
    isActive: true,
    status
  };
  
  if (department) query.department = department;
  if (level) query.level = level;
  if (typeof isManager === 'boolean') query.isManager = isManager;
  
  if (keyword) {
    query.$or = [
      { name: new RegExp(keyword, 'i') },
      { position: new RegExp(keyword, 'i') },
      { department: new RegExp(keyword, 'i') },
      { phone: new RegExp(keyword, 'i') },
      { email: new RegExp(keyword, 'i') },
      { notes: new RegExp(keyword, 'i') }
    ];
  }
  
  return this.find(query)
    .populate('businessCard')
    .sort({ joinDate: -1 })
    .limit(limit)
    .skip(skip);
};

// 静态方法：获取员工统计信息
CompanyEmployeeSchema.statics.getEmployeeStats = async function(companyId: string, appId: string) {
  const stats = await this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId), appId, isActive: true } },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        activeEmployees: { $sum: { $cond: [{ $eq: ['$status', '在职'] }, 1, 0] } },
        managers: { $sum: { $cond: ['$isManager', 1, 0] } },
        departments: { $addToSet: '$department' },
        levels: { $addToSet: '$level' }
      }
    }
  ]);
  
  return stats[0] || {
    totalEmployees: 0,
    activeEmployees: 0,
    managers: 0,
    departments: [],
    levels: []
  };
};

// 静态方法：根据unionid查找员工
CompanyEmployeeSchema.statics.findByUnionid = function(unionid: string) {
  return this.findOne({ unionid, isActive: true })
    .populate('companyInfo')
    .populate('businessCard');
};

export const CompanyEmployee = mongoose.model<ICompanyEmployee, CompanyEmployeeModel>('CompanyEmployee', CompanyEmployeeSchema);