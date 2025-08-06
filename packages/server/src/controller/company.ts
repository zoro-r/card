import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import {
  getCompanyList,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  batchDeleteCompanies,
  getIndustryList,
  getScaleOptions,
  searchCompanies,
  getVerifiedCompanies,
  getCompaniesByIndustry,
  verifyCompany,
  unverifyCompany
} from '@/service/company';

/**
 * 获取企业列表
 */
export async function getCompanies(ctx: Context) {
  try {
    const { appId, page, limit, keyword, industry, scale, isVerified } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getCompanyList({
      appId: appId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      keyword: keyword as string,
      industry: industry as string,
      scale: scale as string,
      isVerified: isVerified ? isVerified === 'true' : undefined
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取企业详情
 */
export async function getCompanyDetail(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getCompanyById(id, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 创建企业
 */
export async function createCompanyController(ctx: Context) {
  try {
    const data = ctx.request.body as any;
    const userId = (ctx.state.user as any)?.id || 'system'; // 默认使用system作为创建者
    
    const result = await createCompany(data, userId);
    ctx.body = success(result, '企业创建成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 更新企业
 */
export async function updateCompanyController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const data = ctx.request.body as any;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    const result = await updateCompany(id, data, userId);
    ctx.body = success(result, '企业更新成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 删除企业
 */
export async function deleteCompanyController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    await deleteCompany(id, appId as string);
    ctx.body = success(null, '企业删除成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 批量删除企业
 */
export async function batchDeleteCompaniesController(ctx: Context) {
  try {
    const { ids, appId } = ctx.request.body as any;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      ctx.body = fail('请选择要删除的企业');
      return;
    }
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await batchDeleteCompanies(ids, appId);
    ctx.body = success(result, `成功删除 ${result.deletedCount} 个企业`);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取行业列表
 */
export async function getIndustries(ctx: Context) {
  try {
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getIndustryList(appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取企业规模选项
 */
export async function getScales(ctx: Context) {
  try {
    const result = getScaleOptions();
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 搜索企业
 */
export async function searchCompaniesController(ctx: Context) {
  try {
    const { keyword, appId, industry, scale, isVerified, limit, skip } = ctx.query;
    
    if (!keyword || !appId) {
      ctx.body = fail('搜索关键词和平台ID不能为空');
      return;
    }

    const result = await searchCompanies({
      keyword: keyword as string,
      appId: appId as string,
      industry: industry as string,
      scale: scale as string,
      isVerified: isVerified ? isVerified === 'true' : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取认证企业
 */
export async function getVerifiedCompaniesController(ctx: Context) {
  try {
    const { appId, limit } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getVerifiedCompanies(
      appId as string,
      limit ? parseInt(limit as string) : undefined
    );

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 根据行业获取企业
 */
export async function getCompaniesByIndustryController(ctx: Context) {
  try {
    const { industry, appId } = ctx.query;
    
    if (!industry || !appId) {
      ctx.body = fail('行业和平台ID不能为空');
      return;
    }

    const result = await getCompaniesByIndustry(industry as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 企业认证
 */
export async function verifyCompanyController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { verifyType, verifyExpiry } = ctx.request.body as any;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    if (!verifyType) {
      ctx.body = fail('认证类型不能为空');
      return;
    }

    const result = await verifyCompany(id, {
      verifyType,
      verifyTime: new Date(),
      verifyExpiry: verifyExpiry ? new Date(verifyExpiry) : undefined
    }, userId);

    ctx.body = success(result, '企业认证成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 取消企业认证
 */
export async function unverifyCompanyController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const userId = (ctx.state.user as any)?.id || 'system';

    const result = await unverifyCompany(id, userId);
    ctx.body = success(result, '取消认证成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}