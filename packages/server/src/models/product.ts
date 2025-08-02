import mongoose, { Schema, Document } from 'mongoose';
import { getDefaultPlatformId } from '@/utils/platform';

/**
 * 商品状态枚举
 */
export enum ProductStatus {
  DRAFT = 'DRAFT',         // 草稿
  ACTIVE = 'ACTIVE',       // 上架
  INACTIVE = 'INACTIVE',   // 下架
  DELETED = 'DELETED'      // 已删除
}

/**
 * 课程类型枚举
 */
export enum CourseType {
  VIDEO = 'VIDEO',         // 视频课程
  AUDIO = 'AUDIO',         // 音频课程
  LIVE = 'LIVE',           // 直播课程
  TEXT = 'TEXT',           // 图文课程
  MIXED = 'MIXED'          // 混合型课程
}

/**
 * 课程难度级别
 */
export enum CourseDifficulty {
  BEGINNER = 'BEGINNER',   // 初级
  INTERMEDIATE = 'INTERMEDIATE', // 中级
  ADVANCED = 'ADVANCED',   // 高级
  EXPERT = 'EXPERT'        // 专家级
}

/**
 * 会员套餐时长单位
 */
export enum DurationUnit {
  DAYS = 'DAYS',           // 天
  WEEKS = 'WEEKS',         // 周
  MONTHS = 'MONTHS',       // 月
  YEARS = 'YEARS'          // 年
}

/**
 * 课程章节接口
 */
export interface CourseChapter {
  chapterId: string;       // 章节ID
  title: string;           // 章节标题
  description?: string;    // 章节描述
  videoUrl?: string;       // 视频链接
  audioUrl?: string;       // 音频链接
  content?: string;        // 文字内容
  duration?: number;       // 时长（秒）
  order: number;           // 排序
  isFree: boolean;         // 是否免费试看
  isActive: boolean;       // 是否启用
}

/**
 * 会员套餐定价接口
 */
export interface MembershipPricing {
  pricingId: string;       // 定价ID
  duration: number;        // 时长数量
  unit: DurationUnit;      // 时长单位
  price: number;           // 价格（分）
  originalPrice?: number;  // 原价（分）
  isActive: boolean;       // 是否启用
  isRecommended?: boolean; // 是否推荐套餐
  description?: string;    // 套餐描述
  benefits?: string[];     // 套餐权益
}

/**
 * 课程统计信息
 */
export interface CourseStats {
  totalDuration: number;   // 总时长（秒）
  chapterCount: number;    // 章节数量
  studentCount: number;    // 学员数量
  completionRate: number;  // 完课率
  avgRating: number;       // 平均评分
  ratingCount: number;     // 评分人数
}

/**
 * 课程商品接口定义
 */
export interface IProduct extends Document {
  // 基本信息
  productId: string;          // 商品唯一标识
  name: string;               // 课程名称
  description?: string;       // 课程详细描述
  shortDescription?: string;  // 课程简短描述
  images: string[];           // 课程封面图片
  video?: string;             // 课程介绍视频
  
  // 课程特有信息
  courseType: CourseType;     // 课程类型
  difficulty: CourseDifficulty; // 难度级别
  chapters: CourseChapter[];  // 课程章节
  instructor: string;         // 讲师姓名
  instructorAvatar?: string;  // 讲师头像
  instructorBio?: string;     // 讲师简介
  
  // 会员定价
  membershipPricing: MembershipPricing[]; // 会员套餐定价
  isFreeTrialEnabled: boolean; // 是否支持免费试学
  freeTrialDuration?: number; // 免费试学时长（天）
  
  // 分类和标签
  categoryId?: string;        // 课程分类ID
  categoryPath?: string[];    // 分类路径
  tags: string[];             // 课程标签
  skills?: string[];          // 技能标签
  
  // 商品属性
  status: ProductStatus;      // 商品状态
  isRecommended: boolean;     // 是否推荐
  isFeatured: boolean;        // 是否精选
  
  // 权限控制
  requiresLogin: boolean;     // 是否需要登录
  allowDownload: boolean;     // 是否允许下载
  allowOfflineView: boolean;  // 是否允许离线观看
  
  // 统计信息
  stats: CourseStats;         // 课程统计
  
  // SEO信息
  seoTitle?: string;          // SEO标题
  seoKeywords?: string;       // SEO关键词
  seoDescription?: string;    // SEO描述
  
  // 系统信息
  platformId: string;         // 平台ID
  createdBy: string;          // 创建者
  createdAt: Date;           // 创建时间
  updatedAt: Date;           // 更新时间
  
  // 虚拟字段和方法
  readonly priceRange: string;
  readonly minPrice: number;
  readonly maxPrice: number;
  readonly totalDurationText: string;
  
  // 实例方法
  updateStats(): void;
  addChapter(chapterData: Omit<CourseChapter, 'chapterId'>): Promise<IProduct>;
  updateChapter(chapterId: string, updateData: Partial<CourseChapter>): Promise<IProduct>;
  removeChapter(chapterId: string): Promise<IProduct>;
  addMembershipPricing(pricingData: Omit<MembershipPricing, 'pricingId'>): Promise<IProduct>;
  enrollStudent(): Promise<IProduct>;
  updateRating(rating: number): Promise<IProduct>;
}
/**
 * 课程商品数据模型
 */
const ProductSchema = new Schema<IProduct>({
  // 基本信息
  productId: {
    type: String,
    required: true,
    unique: true,
    comment: '课程唯一标识'
  },
  name: {
    type: String,
    required: true,
    maxlength: 200,
    comment: '课程名称'
  },
  description: {
    type: String,
    maxlength: 5000,
    comment: '课程详细描述'
  },
  shortDescription: {
    type: String,
    maxlength: 500,
    comment: '课程简短描述'
  },
  images: [{
    type: String,
    comment: '课程封面图片URL'
  }],
  video: {
    type: String,
    comment: '课程介绍视频URL'
  },

  // 课程特有信息
  courseType: {
    type: String,
    enum: Object.values(CourseType),
    required: true,
    default: CourseType.VIDEO,
    comment: '课程类型'
  },
  difficulty: {
    type: String,
    enum: Object.values(CourseDifficulty),
    required: true,
    default: CourseDifficulty.BEGINNER,
    comment: '课程难度级别'
  },
  chapters: [{
    chapterId: {
      type: String,
      required: true,
      comment: '章节ID'
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      comment: '章节标题'
    },
    description: {
      type: String,
      maxlength: 1000,
      comment: '章节描述'
    },
    videoUrl: {
      type: String,
      comment: '视频链接'
    },
    audioUrl: {
      type: String,
      comment: '音频链接'
    },
    content: {
      type: String,
      comment: '文字内容'
    },
    duration: {
      type: Number,
      min: 0,
      comment: '时长（秒）'
    },
    order: {
      type: Number,
      required: true,
      comment: '排序'
    },
    isFree: {
      type: Boolean,
      default: false,
      comment: '是否免费试看'
    },
    isActive: {
      type: Boolean,
      default: true,
      comment: '是否启用'
    }
  }],
  instructor: {
    type: String,
    required: true,
    comment: '讲师姓名'
  },
  instructorAvatar: {
    type: String,
    comment: '讲师头像'
  },
  instructorBio: {
    type: String,
    maxlength: 1000,
    comment: '讲师简介'
  },

  // 会员定价
  membershipPricing: [{
    pricingId: {
      type: String,
      required: true,
      comment: '定价ID'
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      comment: '时长数量'
    },
    unit: {
      type: String,
      enum: Object.values(DurationUnit),
      required: true,
      comment: '时长单位'
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      comment: '价格（分）'
    },
    originalPrice: {
      type: Number,
      min: 0,
      comment: '原价（分）'
    },
    isActive: {
      type: Boolean,
      default: true,
      comment: '是否启用'
    },
    isRecommended: {
      type: Boolean,
      default: false,
      comment: '是否推荐套餐'
    },
    description: {
      type: String,
      maxlength: 500,
      comment: '套餐描述'
    },
    benefits: [{
      type: String,
      comment: '套餐权益'
    }]
  }],
  isFreeTrialEnabled: {
    type: Boolean,
    default: false,
    comment: '是否支持免费试学'
  },
  freeTrialDuration: {
    type: Number,
    min: 0,
    comment: '免费试学时长（天）'
  },

  // 分类和标签
  categoryId: {
    type: String,
    comment: '课程分类ID'
  },
  categoryPath: [{
    type: String,
    comment: '分类路径'
  }],
  tags: [{
    type: String,
    comment: '课程标签'
  }],
  skills: [{
    type: String,
    comment: '技能标签'
  }],

  // 商品属性
  status: {
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.DRAFT,
    index: true,
    comment: '课程状态'
  },
  isRecommended: {
    type: Boolean,
    default: false,
    comment: '是否推荐'
  },
  isFeatured: {
    type: Boolean,
    default: false,
    comment: '是否精选'
  },

  // 权限控制
  requiresLogin: {
    type: Boolean,
    default: true,
    comment: '是否需要登录'
  },
  allowDownload: {
    type: Boolean,
    default: false,
    comment: '是否允许下载'
  },
  allowOfflineView: {
    type: Boolean,
    default: false,
    comment: '是否允许离线观看'
  },

  // 统计信息
  stats: {
    totalDuration: {
      type: Number,
      default: 0,
      comment: '总时长（秒）'
    },
    chapterCount: {
      type: Number,
      default: 0,
      comment: '章节数量'
    },
    studentCount: {
      type: Number,
      default: 0,
      comment: '学员数量'
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      comment: '完课率'
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      comment: '平均评分'
    },
    ratingCount: {
      type: Number,
      default: 0,
      comment: '评分人数'
    }
  },

  // SEO信息
  seoTitle: {
    type: String,
    maxlength: 200,
    comment: 'SEO标题'
  },
  seoKeywords: {
    type: String,
    maxlength: 500,
    comment: 'SEO关键词'
  },
  seoDescription: {
    type: String,
    maxlength: 500,
    comment: 'SEO描述'
  },

  // 系统信息
  platformId: {
    type: String,
    required: true,
    default: getDefaultPlatformId,
    index: true,
    comment: '平台ID'
  },
  createdBy: {
    type: String,
    required: true,
    comment: '创建者'
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(_doc, ret) {
      // 添加虚拟字段
      const retAny = ret as any;
      
      // 计算价格范围
      if (retAny.membershipPricing && retAny.membershipPricing.length > 0) {
        const activePricing = retAny.membershipPricing.filter((p: any) => p.isActive);
        if (activePricing.length > 0) {
          const prices = activePricing.map((p: any) => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          
          retAny.minPrice = minPrice;
          retAny.maxPrice = maxPrice;
          
          if (minPrice === maxPrice) {
            retAny.priceRange = `¥${(minPrice / 100).toFixed(2)}`;
          } else {
            retAny.priceRange = `¥${(minPrice / 100).toFixed(2)} - ¥${(maxPrice / 100).toFixed(2)}`;
          }
        }
      }
      
      // 格式化总时长
      if (retAny.stats && retAny.stats.totalDuration) {
        const duration = retAny.stats.totalDuration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        
        if (hours > 0) {
          retAny.totalDurationText = `${hours}小时${minutes}分钟`;
        } else {
          retAny.totalDurationText = `${minutes}分钟`;
        }
      }
      
      return ret;
    }
  }
});

// 创建索引
ProductSchema.index({ productId: 1 }, { unique: true });
ProductSchema.index({ platformId: 1, status: 1 });
ProductSchema.index({ platformId: 1, categoryId: 1 });
ProductSchema.index({ platformId: 1, isRecommended: 1 });
ProductSchema.index({ platformId: 1, isFeatured: 1 });
ProductSchema.index({ platformId: 1, courseType: 1 });
ProductSchema.index({ platformId: 1, difficulty: 1 });
ProductSchema.index({ name: 'text', description: 'text', 'chapters.title': 'text' });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'stats.studentCount': -1 });
ProductSchema.index({ 'stats.avgRating': -1 });

// 虚拟字段：状态文本
ProductSchema.virtual('statusText').get(function() {
  const statusMap = {
    [ProductStatus.DRAFT]: '草稿',
    [ProductStatus.ACTIVE]: '上架',
    [ProductStatus.INACTIVE]: '下架',
    [ProductStatus.DELETED]: '已删除'
  };
  return statusMap[this.status] || '未知状态';
});

// 课程相关实例方法
ProductSchema.methods.addChapter = function(chapterData: Omit<CourseChapter, 'chapterId'>) {
  const chapterId = `chapter_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const newChapter: CourseChapter = {
    ...chapterData,
    chapterId,
    order: this.chapters.length + 1
  };
  this.chapters.push(newChapter);
  this.updateStats();
  return this.save();
};

ProductSchema.methods.updateChapter = function(chapterId: string, updateData: Partial<CourseChapter>) {
  const chapter = this.chapters.find((c: CourseChapter) => c.chapterId === chapterId);
  if (chapter) {
    Object.assign(chapter, updateData);
    this.updateStats();
    return this.save();
  }
  throw new Error('章节未找到');
};

ProductSchema.methods.removeChapter = function(chapterId: string) {
  this.chapters = this.chapters.filter((c: CourseChapter) => c.chapterId !== chapterId);
  this.updateStats();
  return this.save();
};

ProductSchema.methods.addMembershipPricing = function(pricingData: Omit<MembershipPricing, 'pricingId'>) {
  const pricingId = `pricing_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const newPricing: MembershipPricing = {
    ...pricingData,
    pricingId
  };
  this.membershipPricing.push(newPricing);
  return this.save();
};

ProductSchema.methods.updateStats = function() {
  this.stats.chapterCount = this.chapters.length;
  this.stats.totalDuration = this.chapters.reduce((total: number, chapter: CourseChapter) => 
    total + (chapter.duration || 0), 0);
};

ProductSchema.methods.enrollStudent = function() {
  this.stats.studentCount += 1;
  return this.save();
};

ProductSchema.methods.updateRating = function(newRating: number) {
  const totalRating = this.stats.avgRating * this.stats.ratingCount;
  this.stats.ratingCount += 1;
  this.stats.avgRating = (totalRating + newRating) / this.stats.ratingCount;
  return this.save();
};

// 静态方法类型定义
interface ProductModel extends mongoose.Model<IProduct> {
  generateProductId(): string;
  findByProductId(productId: string): Promise<IProduct | null>;
  findActiveCourses(platformId: string, filters?: any): Promise<IProduct[]>;
  searchCourses(platformId: string, keyword: string, filters?: any): Promise<IProduct[]>;
  getRecommendedCourses(platformId: string, limit?: number): Promise<IProduct[]>;
  getFeaturedCourses(platformId: string, limit?: number): Promise<IProduct[]>;
  getCoursesByType(platformId: string, courseType: CourseType, limit?: number): Promise<IProduct[]>;
  getCoursesByDifficulty(platformId: string, difficulty: CourseDifficulty, limit?: number): Promise<IProduct[]>;
}

// 静态方法：生成课程ID
ProductSchema.statics.generateProductId = function(): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `C${dateStr}${random}`;
};

// 静态方法：根据课程ID查找
ProductSchema.statics.findByProductId = function(productId: string) {
  return this.findOne({ productId, status: { $ne: ProductStatus.DELETED } });
};

// 静态方法：查找活跃课程
ProductSchema.statics.findActiveCourses = function(platformId: string, filters: any = {}) {
  const query = {
    platformId,
    status: ProductStatus.ACTIVE,
    ...filters
  };
  return this.find(query).sort({ createdAt: -1 });
};

// 静态方法：搜索课程
ProductSchema.statics.searchCourses = function(platformId: string, keyword: string, filters: any = {}) {
  const query = {
    platformId,
    status: ProductStatus.ACTIVE,
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { instructor: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } },
      { skills: { $in: [new RegExp(keyword, 'i')] } }
    ],
    ...filters
  };
  return this.find(query).sort({ 'stats.studentCount': -1, 'stats.avgRating': -1, createdAt: -1 });
};

// 静态方法：获取推荐课程
ProductSchema.statics.getRecommendedCourses = function(platformId: string, limit: number = 10) {
  return this.find({
    platformId,
    status: ProductStatus.ACTIVE,
    isRecommended: true
  }).sort({ 'stats.studentCount': -1, 'stats.avgRating': -1 }).limit(limit);
};

// 静态方法：获取精选课程
ProductSchema.statics.getFeaturedCourses = function(platformId: string, limit: number = 10) {
  return this.find({
    platformId,
    status: ProductStatus.ACTIVE,
    isFeatured: true
  }).sort({ 'stats.studentCount': -1, 'stats.avgRating': -1 }).limit(limit);
};

// 静态方法：按类型获取课程
ProductSchema.statics.getCoursesByType = function(platformId: string, courseType: CourseType, limit: number = 10) {
  return this.find({
    platformId,
    status: ProductStatus.ACTIVE,
    courseType
  }).sort({ 'stats.studentCount': -1 }).limit(limit);
};

// 静态方法：按难度获取课程
ProductSchema.statics.getCoursesByDifficulty = function(platformId: string, difficulty: CourseDifficulty, limit: number = 10) {
  return this.find({
    platformId,
    status: ProductStatus.ACTIVE,
    difficulty
  }).sort({ 'stats.studentCount': -1 }).limit(limit);
};

export const Product = mongoose.model<IProduct, ProductModel>('Product', ProductSchema);