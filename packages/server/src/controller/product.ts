import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import { ProductService, CreateProductParams, UpdateProductParams, ProductQueryParams } from '@/service/product';
import { ProductStatus, CourseType, CourseDifficulty } from '@/models/product';
import { getDefaultPlatformId } from '@/utils/platform';

/**
 * 课程控制器
 */
export class ProductController {
  /**
   * 创建课程
   */
  static async createProduct(ctx: Context) {
    try {
      const productData = ctx.request.body as CreateProductParams;

      // 验证必要参数
      if (!productData.name) {
        ctx.body = fail('课程名称不能为空');
        return;
      }

      if (!productData.instructor) {
        ctx.body = fail('讲师姓名不能为空');
        return;
      }

      if (!productData.courseType) {
        ctx.body = fail('课程类型不能为空');
        return;
      }

      if (!productData.difficulty) {
        ctx.body = fail('课程难度不能为空');
        return;
      }

      if (!productData.membershipPricing || productData.membershipPricing.length === 0) {
        ctx.body = fail('至少需要设置一个会员定价套餐');
        return;
      }

      if (!productData.images || productData.images.length === 0) {
        ctx.body = fail('至少需要上传一张课程封面图片');
        return;
      }

      // 验证会员定价数据
      for (const pricing of productData.membershipPricing) {
        if (!pricing.duration || pricing.duration <= 0) {
          ctx.body = fail('套餐时长必须大于0');
          return;
        }
        if (!pricing.price || pricing.price <= 0) {
          ctx.body = fail('套餐价格必须大于0');
          return;
        }
        if (!pricing.unit) {
          ctx.body = fail('套餐时长单位不能为空');
          return;
        }
      }

      // 获取平台ID和创建者
      const platformId = getDefaultPlatformId();
      const createdBy = ctx.state.user?.userId || 'system';

      // 创建课程
      const productService = new ProductService();
      const product = await productService.createProduct(platformId, createdBy, productData);

      ctx.body = success(product, '创建课程成功');
    } catch (error) {
      console.error('创建课程失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '创建课程失败');
    }
  }

  /**
   * 更新课程
   */
  static async updateProduct(ctx: Context) {
    try {
      const { productId } = ctx.params;
      const updateData = ctx.request.body as UpdateProductParams;

      if (!productId) {
        ctx.body = fail('课程ID不能为空');
        return;
      }

      // 验证会员定价数据
      if (updateData.membershipPricing) {
        for (const pricing of updateData.membershipPricing) {
          if (pricing.duration !== undefined && pricing.duration <= 0) {
            ctx.body = fail('套餐时长必须大于0');
            return;
          }
          if (pricing.price !== undefined && pricing.price <= 0) {
            ctx.body = fail('套餐价格必须大于0');
            return;
          }
        }
      }

      const productService = new ProductService();
      const product = await productService.updateProduct(productId, updateData);

      if (!product) {
        ctx.body = fail('课程不存在');
        return;
      }

      ctx.body = success(product, '更新课程成功');
    } catch (error) {
      console.error('更新课程失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '更新课程失败');
    }
  }

  /**
   * 删除课程
   */
  static async deleteProduct(ctx: Context) {
    try {
      const { productId } = ctx.params;

      if (!productId) {
        ctx.body = fail('课程ID不能为空');
        return;
      }

      const productService = new ProductService();
      await productService.deleteProduct(productId);

      ctx.body = success(null, '删除课程成功');
    } catch (error) {
      console.error('删除课程失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '删除课程失败');
    }
  }

  /**
   * 批量删除课程
   */
  static async batchDeleteProducts(ctx: Context) {
    try {
      const { productIds } = ctx.request.body as { productIds: string[] };

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        ctx.body = fail('课程ID列表不能为空');
        return;
      }

      const productService = new ProductService();
      const result = await productService.batchDeleteProducts(productIds);

      ctx.body = success(result, '批量删除完成');
    } catch (error) {
      console.error('批量删除课程失败:', error);
      ctx.body = fail('批量删除课程失败');
    }
  }

  /**
   * 获取课程详情
   */
  static async getProductDetail(ctx: Context) {
    try {
      const { productId } = ctx.params;

      if (!productId) {
        ctx.body = fail('课程ID不能为空');
        return;
      }

      const productService = new ProductService();
      const product = await productService.getProductDetail(productId);

      if (!product) {
        ctx.body = fail('课程不存在');
        return;
      }

      ctx.body = success(product, '获取课程详情成功');
    } catch (error) {
      console.error('获取课程详情失败:', error);
      ctx.body = fail('获取课程详情失败');
    }
  }

  /**
   * 获取课程列表
   */
  static async getProductList(ctx: Context) {
    try {
      const queryParams = ctx.query as any;
      
      // 解析查询参数
      const params: ProductQueryParams = {
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 20,
        keyword: queryParams.keyword,
        categoryId: queryParams.categoryId,
        status: queryParams.status as ProductStatus,
        courseType: queryParams.courseType as CourseType,
        difficulty: queryParams.difficulty as CourseDifficulty,
        isRecommended: queryParams.isRecommended === 'true' ? true : 
                      queryParams.isRecommended === 'false' ? false : undefined,
        isFeatured: queryParams.isFeatured === 'true' ? true : 
                   queryParams.isFeatured === 'false' ? false : undefined,
        instructor: queryParams.instructor,
        minPrice: queryParams.minPrice ? parseInt(queryParams.minPrice) : undefined,
        maxPrice: queryParams.maxPrice ? parseInt(queryParams.maxPrice) : undefined,
        sortBy: queryParams.sortBy || 'createdAt',
        sortOrder: queryParams.sortOrder || 'desc',
        tags: queryParams.tags ? (Array.isArray(queryParams.tags) ? queryParams.tags : [queryParams.tags]) : undefined,
        skills: queryParams.skills ? (Array.isArray(queryParams.skills) ? queryParams.skills : [queryParams.skills]) : undefined,
        isFreeTrialEnabled: queryParams.isFreeTrialEnabled === 'true' ? true : 
                           queryParams.isFreeTrialEnabled === 'false' ? false : undefined
      };

      const platformId = getDefaultPlatformId();
      const productService = new ProductService();
      const result = await productService.getProductList(platformId, params);

      ctx.body = success(result, '获取课程列表成功');
    } catch (error) {
      console.error('获取课程列表失败:', error);
      ctx.body = fail('获取课程列表失败');
    }
  }

  /**
   * 搜索课程
   */
  static async searchProducts(ctx: Context) {
    try {
      const { keyword } = ctx.query as { keyword: string };

      if (!keyword) {
        ctx.body = fail('搜索关键词不能为空');
        return;
      }

      const platformId = getDefaultPlatformId();
      const productService = new ProductService();
      const products = await productService.searchCourses(platformId, keyword);

      ctx.body = success(products, '搜索课程成功');
    } catch (error) {
      console.error('搜索课程失败:', error);
      ctx.body = fail('搜索课程失败');
    }
  }

  /**
   * 获取推荐课程
   */
  static async getRecommendedProducts(ctx: Context) {
    try {
      const { limit } = ctx.query as { limit?: string };
      const limitNum = limit ? parseInt(limit) : 10;

      const platformId = getDefaultPlatformId();
      const productService = new ProductService();
      const products = await productService.getRecommendedCourses(platformId, limitNum);

      ctx.body = success(products, '获取推荐课程成功');
    } catch (error) {
      console.error('获取推荐课程失败:', error);
      ctx.body = fail('获取推荐课程失败');
    }
  }

  /**
   * 获取精选课程
   */
  static async getFeaturedProducts(ctx: Context) {
    try {
      const { limit } = ctx.query as { limit?: string };
      const limitNum = limit ? parseInt(limit) : 10;

      const platformId = getDefaultPlatformId();
      const productService = new ProductService();
      const products = await productService.getFeaturedCourses(platformId, limitNum);

      ctx.body = success(products, '获取精选课程成功');
    } catch (error) {
      console.error('获取精选课程失败:', error);
      ctx.body = fail('获取精选课程失败');
    }
  }

  /**
   * 学员报名课程
   */
  static async enrollStudent(ctx: Context) {
    try {
      const { productId } = ctx.params;

      if (!productId) {
        ctx.body = fail('课程ID不能为空');
        return;
      }

      const productService = new ProductService();
      const product = await productService.enrollStudent(productId);

      if (!product) {
        ctx.body = fail('课程不存在');
        return;
      }

      ctx.body = success(product, '报名成功');
    } catch (error) {
      console.error('报名失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '报名失败');
    }
  }

  /**
   * 更新课程评分
   */
  static async updateRating(ctx: Context) {
    try {
      const { productId } = ctx.params;
      const { rating } = ctx.request.body as { rating: number };

      if (!productId) {
        ctx.body = fail('课程ID不能为空');
        return;
      }

      if (rating === undefined || isNaN(rating)) {
        ctx.body = fail('评分必须是数字');
        return;
      }

      const productService = new ProductService();
      const product = await productService.updateRating(productId, rating);

      if (!product) {
        ctx.body = fail('课程不存在');
        return;
      }

      ctx.body = success(product, '评分成功');
    } catch (error) {
      console.error('评分失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '评分失败');
    }
  }

  /**
   * 批量更新课程状态
   */
  static async batchUpdateStatus(ctx: Context) {
    try {
      const { productIds, status } = ctx.request.body as { 
        productIds: string[];
        status: ProductStatus;
      };

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        ctx.body = fail('课程ID列表不能为空');
        return;
      }

      if (!status || !Object.values(ProductStatus).includes(status)) {
        ctx.body = fail('无效的课程状态');
        return;
      }

      const productService = new ProductService();
      const result = await productService.batchUpdateStatus(productIds, status);

      ctx.body = success(result, '批量更新状态完成');
    } catch (error) {
      console.error('批量更新状态失败:', error);
      ctx.body = fail('批量更新状态失败');
    }
  }

  /**
   * 获取课程统计信息
   */
  static async getProductStatistics(ctx: Context) {
    try {
      const platformId = getDefaultPlatformId();
      const productService = new ProductService();
      const statistics = await productService.getCourseStatistics(platformId);

      ctx.body = success(statistics, '获取统计信息成功');
    } catch (error) {
      console.error('获取统计信息失败:', error);
      ctx.body = fail('获取统计信息失败');
    }
  }

  /**
   * 小程序端获取课程列表
   */
  static async getWechatProductList(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const queryParams = ctx.query as any;

      // 小程序端只显示上架课程
      const params: ProductQueryParams = {
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 20,
        keyword: queryParams.keyword,
        categoryId: queryParams.categoryId,
        status: ProductStatus.ACTIVE,
        courseType: queryParams.courseType as CourseType,
        difficulty: queryParams.difficulty as CourseDifficulty,
        instructor: queryParams.instructor,
        minPrice: queryParams.minPrice ? parseInt(queryParams.minPrice) : undefined,
        maxPrice: queryParams.maxPrice ? parseInt(queryParams.maxPrice) : undefined,
        sortBy: queryParams.sortBy || 'stats.studentCount',
        sortOrder: queryParams.sortOrder || 'desc',
        tags: queryParams.tags ? (Array.isArray(queryParams.tags) ? queryParams.tags : [queryParams.tags]) : undefined,
        skills: queryParams.skills ? (Array.isArray(queryParams.skills) ? queryParams.skills : [queryParams.skills]) : undefined
      };

      const productService = new ProductService();
      const result = await productService.getProductList(platformId, params);

      ctx.body = success(result, '获取课程列表成功');
    } catch (error) {
      console.error('获取课程列表失败:', error);
      ctx.body = fail('获取课程列表失败');
    }
  }

  /**
   * 小程序端获取课程详情
   */
  static async getWechatProductDetail(ctx: Context) {
    try {
      const { platformId, productId } = ctx.params;

      if (!productId) {
        ctx.body = fail('课程ID不能为空');
        return;
      }

      const productService = new ProductService();
      const product = await productService.getProductDetail(productId);

      if (!product) {
        ctx.body = fail('课程不存在');
        return;
      }

      // 小程序端只能查看上架课程
      if (product.status !== ProductStatus.ACTIVE) {
        ctx.body = fail('课程已下架');
        return;
      }

      ctx.body = success(product, '获取课程详情成功');
    } catch (error) {
      console.error('获取课程详情失败:', error);
      ctx.body = fail('获取课程详情失败');
    }
  }

  /**
   * 小程序端搜索课程
   */
  static async searchWechatProducts(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { keyword, limit } = ctx.query as { keyword: string; limit?: string };

      if (!keyword) {
        ctx.body = fail('搜索关键词不能为空');
        return;
      }

      const productService = new ProductService();
      const filters = {
        status: ProductStatus.ACTIVE
      };
      
      let products = await productService.searchCourses(platformId, keyword, filters);
      
      // 限制返回数量
      if (limit) {
        const limitNum = parseInt(limit);
        products = products.slice(0, limitNum);
      }

      ctx.body = success(products, '搜索课程成功');
    } catch (error) {
      console.error('搜索课程失败:', error);
      ctx.body = fail('搜索课程失败');
    }
  }

  /**
   * 小程序端获取推荐课程
   */
  static async getWechatRecommendedProducts(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { limit } = ctx.query as { limit?: string };
      const limitNum = limit ? parseInt(limit) : 10;

      const productService = new ProductService();
      const products = await productService.getRecommendedCourses(platformId, limitNum);

      ctx.body = success(products, '获取推荐课程成功');
    } catch (error) {
      console.error('获取推荐课程失败:', error);
      ctx.body = fail('获取推荐课程失败');
    }
  }

  /**
   * 小程序端获取精选课程
   */
  static async getWechatFeaturedProducts(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { limit } = ctx.query as { limit?: string };
      const limitNum = limit ? parseInt(limit) : 10;

      const productService = new ProductService();
      const products = await productService.getFeaturedCourses(platformId, limitNum);

      ctx.body = success(products, '获取精选课程成功');
    } catch (error) {
      console.error('获取精选课程失败:', error);
      ctx.body = fail('获取精选课程失败');
    }
  }
}