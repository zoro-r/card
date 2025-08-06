import { Context } from 'koa';
import { CompanyService } from '@/service/companyService';
import { success, error } from '../utils/tool';
import { ICompany } from '@/models/company';

/**
 * 企业控制器
 */
export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  /**
   * 创建企业
   */
  create = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const userId = ctx.state.user?.id;
      const companyData = ctx.request.body as Partial<ICompany>;

      // 验证必填字段
      if (!companyData.name) {
        return ctx.body = error('企业名称不能为空');
      }

      // 验证 appId
      if (!appId || appId === 'undefined') {
        return ctx.body = error('缺少应用标识');
      }

      if (!companyData.displayName) {
        companyData.displayName = companyData.name;
      }

      const company = await this.companyService.createCompany(companyData, appId, userId);
      
      ctx.body = success(company, '企业创建成功');
    } catch (err: any) {
      ctx.body = error(err.message || '创建企业失败');
    }
  };

  /**
   * 更新企业信息
   */
  update = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const userId = ctx.state.user?.id;
      const companyId = ctx.params.id;
      const updateData = ctx.request.body as Partial<ICompany>;

      const company = await this.companyService.updateCompany(companyId, updateData, appId, userId);
      
      if (!company) {
        return ctx.body = error('企业不存在');
      }

      ctx.body = success(company, '企业信息更新成功');
    } catch (err: any) {
      ctx.body = error(err.message || '更新企业信息失败');
    }
  };

  /**
   * 删除企业
   */
  delete = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const userId = ctx.state.user?.id;
      const companyId = ctx.params.id;

      const result = await this.companyService.deleteCompany(companyId, appId, userId);
      
      if (!result) {
        return ctx.body = error('删除企业失败');
      }

      ctx.body = success(null, '企业删除成功');
    } catch (err: any) {
      ctx.body = error(err.message || '删除企业失败');
    }
  };

  /**
   * 获取企业详情
   */
  getDetail = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const companyId = ctx.params.id;

      const company = await this.companyService.getCompanyById(companyId, appId);
      
      if (!company) {
        return ctx.body = error('企业不存在');
      }

      ctx.body = success(company);
    } catch (err: any) {
      ctx.body = error(err.message || '获取企业详情失败');
    }
  };

  /**
   * 获取企业列表
   */
  getList = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const {
        page = 1,
        pageSize = 20,
        keyword,
        industry,
        scale,
        isVerified,
        isPublic = true
      } = ctx.query;

      const params = {
        appId,
        page: Number(page),
        pageSize: Number(pageSize),
        keyword: keyword as string,
        industry: industry as string,
        scale: scale as string,
        isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
        isPublic: isPublic === 'false' ? false : true
      };

      const result = await this.companyService.getCompanies(params);
      
      ctx.body = success(result);
    } catch (err: any) {
      ctx.body = error(err.message || '获取企业列表失败');
    }
  };

  /**
   * 获取企业统计信息
   */
  getStats = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const companyId = ctx.params.id;

      const stats = await this.companyService.getCompanyStats(companyId, appId);
      
      ctx.body = success(stats);
    } catch (err: any) {
      ctx.body = error(err.message || '获取企业统计失败');
    }
  };

  /**
   * 获取行业列表（用于筛选）
   */
  getIndustries = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      
      // 这里可以从配置文件或数据库获取行业列表
      const industries = [
        '互联网/软件',
        '金融/投资',
        '房地产/建筑',
        '制造业',
        '教育培训',
        '医疗健康',
        '零售/电商',
        '物流/运输',
        '旅游/餐饮',
        '媒体/广告',
        '能源/环保',
        '农业/林业',
        '政府/非营利',
        '其他'
      ];
      
      ctx.body = success(industries);
    } catch (err: any) {
      ctx.body = error(err.message || '获取行业列表失败');
    }
  };

  /**
   * 获取企业规模选项
   */
  getScales = async (ctx: Context) => {
    try {
      const scales = [
        '1-10人',
        '11-50人', 
        '51-200人',
        '201-500人',
        '501-1000人',
        '1000人以上'
      ];
      
      ctx.body = success(scales);
    } catch (err: any) {
      ctx.body = error(err.message || '获取企业规模选项失败');
    }
  };
}