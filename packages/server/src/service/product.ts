import { Context } from 'koa';
import mongoose from 'mongoose';
import { 
  Product, 
  IProduct, 
  ProductStatus, 
  CourseType, 
  CourseDifficulty, 
  DurationUnit,
  CourseChapter, 
  MembershipPricing, 
  CourseStats 
} from '@/models/product';
import { getDefaultPlatformId } from '@/utils/platform';

/**
 * 创建课程参数
 */
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

/**
 * 更新课程参数
 */
export interface UpdateProductParams extends Partial<CreateProductParams> {
  // 可以添加课程特有的更新字段
}

/**
 * 课程查询参数
 */
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

/**
 * 课程服务类
 */
export class ProductService {
  /**
   * 创建课程
   * @param platformId 平台ID
   * @param createdBy 创建者
   * @param params 课程参数
   * @returns 创建的课程
   */
  async createProduct(platformId: string, createdBy: string, params: CreateProductParams): Promise<IProduct> {
    try {
      // 生成课程ID
      const productId = Product.generateProductId();

      // 初始化课程统计
      const stats: CourseStats = {
        totalDuration: 0,
        chapterCount: params.chapters?.length || 0,
        studentCount: 0,
        completionRate: 0,
        avgRating: 0,
        ratingCount: 0
      };

      // 计算总时长
      if (params.chapters && params.chapters.length > 0) {
        stats.totalDuration = params.chapters.reduce((total, chapter) => 
          total + (chapter.duration || 0), 0);
      }

      // 创建课程
      const product = new Product({
        productId,
        name: params.name,
        description: params.description,
        shortDescription: params.shortDescription,
        images: params.images || [],
        video: params.video,
        courseType: params.courseType,
        difficulty: params.difficulty,
        chapters: params.chapters || [],
        instructor: params.instructor,
        instructorAvatar: params.instructorAvatar,
        instructorBio: params.instructorBio,
        membershipPricing: params.membershipPricing || [],
        isFreeTrialEnabled: params.isFreeTrialEnabled || false,
        freeTrialDuration: params.freeTrialDuration,
        categoryId: params.categoryId,
        categoryPath: params.categoryPath || [],
        tags: params.tags || [],
        skills: params.skills || [],
        status: params.status || ProductStatus.DRAFT,
        isRecommended: params.isRecommended || false,
        isFeatured: params.isFeatured || false,
        requiresLogin: params.requiresLogin ?? true,
        allowDownload: params.allowDownload || false,
        allowOfflineView: params.allowOfflineView || false,
        stats,
        seoTitle: params.seoTitle,
        seoKeywords: params.seoKeywords,
        seoDescription: params.seoDescription,
        platformId: platformId || getDefaultPlatformId(),
        createdBy
      });

      await product.save();
      return product;
    } catch (error) {
      console.error('创建课程失败:', error);
      throw new Error('创建课程失败');
    }
  }

  /**
   * 更新课程
   * @param productId 课程ID
   * @param params 更新参数
   * @returns 更新后的课程
   */
  async updateProduct(productId: string, params: UpdateProductParams): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      // 更新基本信息
      Object.keys(params).forEach(key => {
        if (params[key as keyof UpdateProductParams] !== undefined) {
          (product as any)[key] = params[key as keyof UpdateProductParams];
        }
      });

      // 如果更新了章节，重新计算统计信息
      if (params.chapters) {
        product.updateStats();
      }

      await product.save();
      return product;
    } catch (error) {
      console.error('更新课程失败:', error);
      throw error;
    }
  }

  /**
   * 删除课程（软删除）
   * @param productId 课程ID
   * @returns 删除结果
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      product.status = ProductStatus.DELETED;
      await product.save();
      return true;
    } catch (error) {
      console.error('删除课程失败:', error);
      throw error;
    }
  }

  /**
   * 批量删除课程
   * @param productIds 课程ID列表
   * @returns 删除结果
   */
  async batchDeleteProducts(productIds: string[]): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const productId of productIds) {
      try {
        await this.deleteProduct(productId);
        success.push(productId);
      } catch (error) {
        failed.push(productId);
      }
    }

    return { success, failed };
  }

  /**
   * 获取课程详情
   * @param productId 课程ID
   * @returns 课程详情
   */
  async getProductDetail(productId: string): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      return product;
    } catch (error) {
      console.error('获取课程详情失败:', error);
      throw new Error('获取课程详情失败');
    }
  }

  /**
   * 获取课程列表
   * @param platformId 平台ID
   * @param params 查询参数
   * @returns 课程列表和分页信息
   */
  async getProductList(
    platformId: string,
    params: ProductQueryParams
  ): Promise<{
    products: IProduct[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        keyword,
        categoryId,
        status,
        courseType,
        difficulty,
        isRecommended,
        isFeatured,
        instructor,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        tags,
        skills,
        isFreeTrialEnabled
      } = params;

      // 构建查询条件
      const query: any = {
        platformId,
        status: { $ne: ProductStatus.DELETED }
      };

      if (status) {
        query.status = status;
      }

      if (courseType) {
        query.courseType = courseType;
      }

      if (difficulty) {
        query.difficulty = difficulty;
      }

      if (categoryId) {
        query.categoryId = categoryId;
      }

      if (isRecommended !== undefined) {
        query.isRecommended = isRecommended;
      }

      if (isFeatured !== undefined) {
        query.isFeatured = isFeatured;
      }

      if (instructor) {
        query.instructor = { $regex: instructor, $options: 'i' };
      }

      if (isFreeTrialEnabled !== undefined) {
        query.isFreeTrialEnabled = isFreeTrialEnabled;
      }

      // 价格筛选基于会员定价
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceQuery: any = {};
        if (minPrice !== undefined) priceQuery.$gte = minPrice * 100; // 转换为分
        if (maxPrice !== undefined) priceQuery.$lte = maxPrice * 100;
        query['membershipPricing.price'] = priceQuery;
      }

      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      if (skills && skills.length > 0) {
        query.skills = { $in: skills };
      }

      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { instructor: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(keyword, 'i')] } },
          { skills: { $in: [new RegExp(keyword, 'i')] } }
        ];
      }

      // 构建排序
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // 查询课程
      const products = await Product.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      // 查询总数
      const total = await Product.countDocuments(query);
      const pages = Math.ceil(total / limit);

      return {
        products,
        total,
        page,
        limit,
        pages
      };
    } catch (error) {
      console.error('获取课程列表失败:', error);
      throw new Error('获取课程列表失败');
    }
  }

  /**
   * 搜索课程
   * @param platformId 平台ID
   * @param keyword 关键词
   * @param filters 过滤条件
   * @returns 搜索结果
   */
  async searchCourses(
    platformId: string,
    keyword: string,
    filters: Partial<ProductQueryParams> = {}
  ): Promise<IProduct[]> {
    try {
      return await Product.searchCourses(platformId, keyword, filters);
    } catch (error) {
      console.error('搜索课程失败:', error);
      throw new Error('搜索课程失败');
    }
  }

  /**
   * 获取推荐课程
   * @param platformId 平台ID
   * @param limit 数量限制
   * @returns 推荐课程列表
   */
  async getRecommendedCourses(platformId: string, limit: number = 10): Promise<IProduct[]> {
    try {
      return await Product.getRecommendedCourses(platformId, limit);
    } catch (error) {
      console.error('获取推荐课程失败:', error);
      throw new Error('获取推荐课程失败');
    }
  }

  /**
   * 获取精选课程
   * @param platformId 平台ID
   * @param limit 数量限制
   * @returns 精选课程列表
   */
  async getFeaturedCourses(platformId: string, limit: number = 10): Promise<IProduct[]> {
    try {
      return await Product.getFeaturedCourses(platformId, limit);
    } catch (error) {
      console.error('获取精选课程失败:', error);
      throw new Error('获取精选课程失败');
    }
  }

  /**
   * 按类型获取课程
   * @param platformId 平台ID
   * @param courseType 课程类型
   * @param limit 数量限制
   * @returns 课程列表
   */
  async getCoursesByType(platformId: string, courseType: CourseType, limit: number = 10): Promise<IProduct[]> {
    try {
      return await Product.getCoursesByType(platformId, courseType, limit);
    } catch (error) {
      console.error('按类型获取课程失败:', error);
      throw new Error('按类型获取课程失败');
    }
  }

  /**
   * 按难度获取课程
   * @param platformId 平台ID
   * @param difficulty 课程难度
   * @param limit 数量限制
   * @returns 课程列表
   */
  async getCoursesByDifficulty(platformId: string, difficulty: CourseDifficulty, limit: number = 10): Promise<IProduct[]> {
    try {
      return await Product.getCoursesByDifficulty(platformId, difficulty, limit);
    } catch (error) {
      console.error('按难度获取课程失败:', error);
      throw new Error('按难度获取课程失败');
    }
  }

  /**
   * 学员报名课程
   * @param productId 课程ID
   * @returns 报名结果
   */
  async enrollStudent(productId: string): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      await product.enrollStudent();
      return product;
    } catch (error) {
      console.error('学员报名失败:', error);
      throw error;
    }
  }

  /**
   * 更新课程评分
   * @param productId 课程ID
   * @param rating 评分
   * @returns 更新结果
   */
  async updateRating(productId: string, rating: number): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      if (rating < 0 || rating > 5) {
        throw new Error('评分必须在0-5之间');
      }

      await product.updateRating(rating);
      return product;
    } catch (error) {
      console.error('更新课程评分失败:', error);
      throw error;
    }
  }

  /**
   * 添加课程章节
   * @param productId 课程ID
   * @param chapterData 章节数据
   * @returns 更新结果
   */
  async addChapter(productId: string, chapterData: Omit<CourseChapter, 'chapterId'>): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      await product.addChapter(chapterData);
      return product;
    } catch (error) {
      console.error('添加课程章节失败:', error);
      throw error;
    }
  }

  /**
   * 更新课程章节
   * @param productId 课程ID
   * @param chapterId 章节ID
   * @param updateData 更新数据
   * @returns 更新结果
   */
  async updateChapter(productId: string, chapterId: string, updateData: Partial<CourseChapter>): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      await product.updateChapter(chapterId, updateData);
      return product;
    } catch (error) {
      console.error('更新课程章节失败:', error);
      throw error;
    }
  }

  /**
   * 删除课程章节
   * @param productId 课程ID
   * @param chapterId 章节ID
   * @returns 删除结果
   */
  async removeChapter(productId: string, chapterId: string): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      await product.removeChapter(chapterId);
      return product;
    } catch (error) {
      console.error('删除课程章节失败:', error);
      throw error;
    }
  }

  /**
   * 添加会员定价套餐
   * @param productId 课程ID
   * @param pricingData 定价数据
   * @returns 更新结果
   */
  async addMembershipPricing(productId: string, pricingData: Omit<MembershipPricing, 'pricingId'>): Promise<IProduct | null> {
    try {
      const product = await Product.findByProductId(productId);
      if (!product) {
        throw new Error('课程不存在');
      }

      await product.addMembershipPricing(pricingData);
      return product;
    } catch (error) {
      console.error('添加会员定价失败:', error);
      throw error;
    }
  }

  /**
   * 批量更新课程状态
   * @param productIds 课程ID列表
   * @param status 新状态
   * @returns 更新结果
   */
  async batchUpdateStatus(
    productIds: string[], 
    status: ProductStatus
  ): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const productId of productIds) {
      try {
        const product = await Product.findByProductId(productId);
        if (product) {
          product.status = status;
          await product.save();
          success.push(productId);
        } else {
          failed.push(productId);
        }
      } catch (error) {
        failed.push(productId);
      }
    }

    return { success, failed };
  }

  /**
   * 获取课程统计信息
   * @param platformId 平台ID
   * @returns 统计信息
   */
  async getCourseStatistics(platformId: string): Promise<{
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
  }> {
    try {
      const [
        totalCourses,
        activeCourses,
        draftCourses,
        recommendedCourses,
        featuredCourses
      ] = await Promise.all([
        Product.countDocuments({ platformId, status: { $ne: ProductStatus.DELETED } }),
        Product.countDocuments({ platformId, status: ProductStatus.ACTIVE }),
        Product.countDocuments({ platformId, status: ProductStatus.DRAFT }),
        Product.countDocuments({ platformId, isRecommended: true, status: { $ne: ProductStatus.DELETED } }),
        Product.countDocuments({ platformId, isFeatured: true, status: { $ne: ProductStatus.DELETED } })
      ]);

      // 计算总学员数、总时长和平均评分
      const statsResult = await Product.aggregate([
        { $match: { platformId, status: { $ne: ProductStatus.DELETED } } },
        { 
          $group: { 
            _id: null, 
            totalStudents: { $sum: '$stats.studentCount' },
            totalDuration: { $sum: '$stats.totalDuration' },
            avgRating: { $avg: '$stats.avgRating' }
          } 
        }
      ]);

      const { totalStudents = 0, totalDuration = 0, avgRating = 0 } = statsResult[0] || {};

      // 按类型统计
      const typeResult = await Product.aggregate([
        { $match: { platformId, status: { $ne: ProductStatus.DELETED } } },
        { $group: { _id: '$courseType', count: { $sum: 1 } } }
      ]);

      const coursesByType: { [key in CourseType]: number } = {
        [CourseType.VIDEO]: 0,
        [CourseType.AUDIO]: 0,
        [CourseType.LIVE]: 0,
        [CourseType.TEXT]: 0,
        [CourseType.MIXED]: 0
      };

      typeResult.forEach(item => {
        coursesByType[item._id as CourseType] = item.count;
      });

      // 按难度统计
      const difficultyResult = await Product.aggregate([
        { $match: { platformId, status: { $ne: ProductStatus.DELETED } } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ]);

      const coursesByDifficulty: { [key in CourseDifficulty]: number } = {
        [CourseDifficulty.BEGINNER]: 0,
        [CourseDifficulty.INTERMEDIATE]: 0,
        [CourseDifficulty.ADVANCED]: 0,
        [CourseDifficulty.EXPERT]: 0
      };

      difficultyResult.forEach(item => {
        coursesByDifficulty[item._id as CourseDifficulty] = item.count;
      });

      return {
        totalCourses,
        activeCourses,
        draftCourses,
        totalStudents,
        totalDuration,
        avgRating,
        recommendedCourses,
        featuredCourses,
        coursesByType,
        coursesByDifficulty
      };
    } catch (error) {
      console.error('获取课程统计失败:', error);
      throw new Error('获取课程统计失败');
    }
  }
}