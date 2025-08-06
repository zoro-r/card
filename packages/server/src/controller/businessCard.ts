import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import {
  getBusinessCardList,
  getBusinessCardById,
  createBusinessCard,
  updateBusinessCard,
  deleteBusinessCard,
  batchDeleteBusinessCards,
  getBusinessCardsByCompany,
  getBusinessCardsByCompanyName,
  searchBusinessCards,
  getPopularBusinessCards,
  updateCardViewCount,
  updateCardShareCount,
  updateCardContactCount,
  generateCardQRCode,
  getBusinessCardByOpenid,
  getCategoryList,
  verifyBusinessCard,
  unverifyBusinessCard
} from '@/service/businessCard';

/**
 * 获取名片列表
 */
export async function getBusinessCards(ctx: Context) {
  try {
    const { appId, page, limit, keyword, companyId, category, isPublic, isVerified } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getBusinessCardList({
      appId: appId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      keyword: keyword as string,
      companyId: companyId as string,
      category: category as string,
      isPublic: isPublic ? isPublic === 'true' : undefined,
      isVerified: isVerified ? isVerified === 'true' : undefined
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取名片详情
 */
export async function getBusinessCardDetail(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getBusinessCardById(id, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 创建名片
 */
export async function createBusinessCardController(ctx: Context) {
  try {
    const data = ctx.request.body as any;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    const result = await createBusinessCard(data, userId);
    ctx.body = success(result, '名片创建成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 更新名片
 */
export async function updateBusinessCardController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const data = ctx.request.body as any;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    const result = await updateBusinessCard(id, data, userId);
    ctx.body = success(result, '名片更新成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 删除名片
 */
export async function deleteBusinessCardController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    await deleteBusinessCard(id, appId as string);
    ctx.body = success(null, '名片删除成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 批量删除名片
 */
export async function batchDeleteBusinessCardsController(ctx: Context) {
  try {
    const { ids, appId } = ctx.request.body as any;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      ctx.body = fail('请选择要删除的名片');
      return;
    }
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await batchDeleteBusinessCards(ids, appId);
    ctx.body = success(result, `成功删除 ${result.deletedCount} 张名片`);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 根据企业获取名片
 */
export async function getCardsByCompany(ctx: Context) {
  try {
    const { companyId, appId } = ctx.query;
    
    if (!companyId || !appId) {
      ctx.body = fail('企业ID和平台ID不能为空');
      return;
    }

    const result = await getBusinessCardsByCompany(companyId as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 根据企业名称获取名片
 */
export async function getCardsByCompanyName(ctx: Context) {
  try {
    const { companyName, appId } = ctx.query;
    
    if (!companyName || !appId) {
      ctx.body = fail('企业名称和平台ID不能为空');
      return;
    }

    const result = await getBusinessCardsByCompanyName(companyName as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 搜索名片
 */
export async function searchBusinessCardsController(ctx: Context) {
  try {
    const { keyword, appId, category, isPublic, limit, skip } = ctx.query;
    
    if (!keyword || !appId) {
      ctx.body = fail('搜索关键词和平台ID不能为空');
      return;
    }

    const result = await searchBusinessCards({
      keyword: keyword as string,
      appId: appId as string,
      category: category as string,
      isPublic: isPublic ? isPublic === 'true' : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取热门名片
 */
export async function getPopularCardsController(ctx: Context) {
  try {
    const { appId, limit } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getPopularBusinessCards(
      appId as string,
      limit ? parseInt(limit as string) : undefined
    );

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 更新浏览次数
 */
export async function updateViewCount(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.request.body as any;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await updateCardViewCount(id, appId);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 更新分享次数
 */
export async function updateShareCount(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.request.body as any;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await updateCardShareCount(id, appId);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 更新联系次数
 */
export async function updateContactCount(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.request.body as any;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await updateCardContactCount(id, appId);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 生成二维码
 */
export async function generateQRCode(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await generateCardQRCode(id, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 根据openid获取名片
 */
export async function getCardByOpenid(ctx: Context) {
  try {
    const { openid, appId } = ctx.query;
    
    if (!openid || !appId) {
      ctx.body = fail('OpenID和平台ID不能为空');
      return;
    }

    const result = await getBusinessCardByOpenid(openid as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取分类列表
 */
export async function getCategories(ctx: Context) {
  try {
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getCategoryList(appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 名片验证
 */
export async function verifyBusinessCardController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    const result = await verifyBusinessCard(id, userId);
    ctx.body = success(result, '名片验证成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 取消名片验证
 */
export async function unverifyBusinessCardController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    const result = await unverifyBusinessCard(id, userId);
    ctx.body = success(result, '取消验证成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}