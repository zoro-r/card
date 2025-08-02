import request from '@/utils/request';

// 商品状态枚举
export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

// 课程类型枚举
export enum CourseType {
  VIDEO = 'VIDEO',         // 视频课程
  AUDIO = 'AUDIO',         // 音频课程
  LIVE = 'LIVE',           // 直播课程
  TEXT = 'TEXT',           // 图文课程
  MIXED = 'MIXED'          // 混合型课程
}

// 课程难度级别
export enum CourseDifficulty {
  BEGINNER = 'BEGINNER',   // 初级
  INTERMEDIATE = 'INTERMEDIATE', // 中级
  ADVANCED = 'ADVANCED',   // 高级
  EXPERT = 'EXPERT'        // 专家级
}

// 会员套餐时长单位
export enum DurationUnit {
  DAYS = 'DAYS',           // 天
  WEEKS = 'WEEKS',         // 周
  MONTHS = 'MONTHS',       // 月
  YEARS = 'YEARS'          // 年
}

// 课程章节接口
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

// 会员套餐定价接口
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

// 课程统计信息
export interface CourseStats {
  totalDuration: number;   // 总时长（秒）
  chapterCount: number;    // 章节数量
  studentCount: number;    // 学员数量
  completionRate: number;  // 完课率
  avgRating: number;       // 平均评分
  ratingCount: number;     // 评分人数
}

// 课程接口
export interface Product {
  _id: string;
  productId: string;
  name: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  video?: string;
  
  // 课程特有信息
  courseType: CourseType;
  difficulty: CourseDifficulty;
  chapters: CourseChapter[];
  instructor: string;
  instructorAvatar?: string;
  instructorBio?: string;
  
  // 会员定价
  membershipPricing: MembershipPricing[];
  isFreeTrialEnabled: boolean;
  freeTrialDuration?: number;
  
  // 分类和标签
  categoryId?: string;
  categoryPath?: string[];
  tags: string[];
  skills?: string[];
  
  // 课程属性
  status: ProductStatus;
  statusText: string;
  isRecommended: boolean;
  isFeatured: boolean;
  
  // 权限控制
  requiresLogin: boolean;
  allowDownload: boolean;
  allowOfflineView: boolean;
  
  // 统计信息
  stats: CourseStats;
  
  // SEO信息
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  
  // 系统信息
  platformId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // 虚拟字段
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  totalDurationText: string;
}

// 创建课程参数
export interface CreateProductParams {
  // 基本信息
  name: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  video?: string;
  
  // 课程特有信息
  courseType: CourseType;
  difficulty: CourseDifficulty;
  chapters?: CourseChapter[];
  instructor: string;
  instructorAvatar?: string;
  instructorBio?: string;
  
  // 会员定价
  membershipPricing: MembershipPricing[];
  isFreeTrialEnabled?: boolean;
  freeTrialDuration?: number;
  
  // 分类和标签
  categoryId?: string;
  categoryPath?: string[];
  tags?: string[];
  skills?: string[];
  
  // 课程属性
  status?: ProductStatus;
  isRecommended?: boolean;
  isFeatured?: boolean;
  
  // 权限控制
  requiresLogin?: boolean;
  allowDownload?: boolean;
  allowOfflineView?: boolean;
  
  // SEO信息
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
}

// 更新课程参数
export interface UpdateProductParams extends Partial<CreateProductParams> {
  // 可以添加课程特有的更新字段
}

// 课程查询参数
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  categoryId?: string;
  status?: ProductStatus;
  courseType?: CourseType;
  difficulty?: CourseDifficulty;
  isRecommended?: boolean;
  isFeatured?: boolean;
  instructor?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'stats.studentCount' | 'stats.avgRating' | 'stats.totalDuration';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  skills?: string[];
  isFreeTrialEnabled?: boolean;
}

// 课程列表响应
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// 课程统计响应
export interface ProductStatistics {
  totalCourses: number;
  activeCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalDuration: number;
  avgRating: number;
  recommendedCourses: number;
  featuredCourses: number;
  coursesByType: { [key in CourseType]: number };
  coursesByDifficulty: { [key in CourseDifficulty]: number };
}

/**
 * 获取课程列表
 */
export async function getProductList(params: ProductQueryParams) {
  return request<ProductListResponse>('/api/admin/products', {
    method: 'GET',
    params,
  });
}

/**
 * 创建课程
 */
export async function createProduct(data: CreateProductParams) {
  return request<Product>('/api/admin/products', {
    method: 'POST',
    data,
  });
}

/**
 * 获取课程详情
 */
export async function getProductDetail(productId: string) {
  return request<Product>(`/api/admin/products/${productId}`, {
    method: 'GET',
  });
}

/**
 * 更新课程
 */
export async function updateProduct(productId: string, data: UpdateProductParams) {
  return request<Product>(`/api/admin/products/${productId}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除课程
 */
export async function deleteProduct(productId: string) {
  return request(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除课程
 */
export async function batchDeleteProducts(productIds: string[]) {
  return request('/api/admin/products/batch-delete', {
    method: 'POST',
    data: { productIds },
  });
}

/**
 * 搜索课程
 */
export async function searchProducts(keyword: string) {
  return request<Product[]>('/api/admin/products/search', {
    method: 'GET',
    params: { keyword },
  });
}

/**
 * 获取推荐课程
 */
export async function getRecommendedProducts(limit?: number) {
  return request<Product[]>('/api/admin/products/recommended', {
    method: 'GET',
    params: { limit },
  });
}

/**
 * 获取精选课程
 */
export async function getFeaturedProducts(limit?: number) {
  return request<Product[]>('/api/admin/products/featured', {
    method: 'GET',
    params: { limit },
  });
}

/**
 * 学员报名课程
 */
export async function enrollStudent(productId: string) {
  return request<Product>(`/api/admin/products/${productId}/enroll`, {
    method: 'POST',
  });
}

/**
 * 更新课程评分
 */
export async function updateRating(productId: string, rating: number) {
  return request<Product>(`/api/admin/products/${productId}/rating`, {
    method: 'POST',
    data: { rating },
  });
}

/**
 * 批量更新课程状态
 */
export async function batchUpdateStatus(productIds: string[], status: ProductStatus) {
  return request('/api/admin/products/batch-update-status', {
    method: 'POST',
    data: { productIds, status },
  });
}

/**
 * 获取课程统计信息
 */
export async function getProductStatistics() {
  return request<ProductStatistics>('/api/admin/products/statistics', {
    method: 'GET',
  });
}

/**
 * 按类型获取课程
 */
export async function getCoursesByType(courseType: CourseType, limit?: number) {
  return request<Product[]>('/api/admin/products', {
    method: 'GET',
    params: { courseType, limit },
  });
}

/**
 * 按难度获取课程
 */
export async function getCoursesByDifficulty(difficulty: CourseDifficulty, limit?: number) {
  return request<Product[]>('/api/admin/products', {
    method: 'GET',
    params: { difficulty, limit },
  });
}