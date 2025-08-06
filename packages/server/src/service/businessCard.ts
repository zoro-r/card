import { BusinessCard, IBusinessCard } from '@/models/businessCard';
import { Company } from '@/models/company';
import { updateCompanyEmployeeCount } from './company';

/**
 * 获取名片列表
 */
export async function getBusinessCardList(params: {
  appId: string;
  page?: number;
  limit?: number;
  keyword?: string;
  companyId?: string;
  category?: string;
  isPublic?: boolean;
  isVerified?: boolean;
}) {
  const { appId, page = 1, limit = 20, keyword, companyId, category, isPublic, isVerified } = params;
  
  const query: any = { appId, isActive: true };
  
  if (keyword) {
    query.$or = [
      { name: new RegExp(keyword, 'i') },
      { title: new RegExp(keyword, 'i') },
      { company: new RegExp(keyword, 'i') },
      { introduction: new RegExp(keyword, 'i') },
      { email: new RegExp(keyword, 'i') },
      { phone: new RegExp(keyword, 'i') }
    ];
  }
  
  if (companyId) query.companyId = companyId;
  if (category) query.category = category;
  if (typeof isPublic === 'boolean') query.isPublic = isPublic;
  if (typeof isVerified === 'boolean') query.isVerified = isVerified;
  
  const skip = (page - 1) * limit;
  
  const [list, total] = await Promise.all([
    BusinessCard.find(query)
      .populate('companyInfo', 'name displayName logo industry')
      .populate('createdBy', 'loginName realName')
      .populate('lastModifiedBy', 'loginName realName')
      .sort({ viewCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BusinessCard.countDocuments(query)
  ]);
  
  return {
    list,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * 获取名片详情
 */
export async function getBusinessCardById(id: string, appId: string) {
  const card = await BusinessCard.findOne({ _id: id, appId, isActive: true })
    .populate('companyInfo', 'name displayName logo industry address website')
    .populate('createdBy', 'loginName realName')
    .populate('lastModifiedBy', 'loginName realName');
    
  if (!card) {
    throw new Error('名片不存在');
  }
  
  return card;
}

/**
 * 创建名片
 */
export async function createBusinessCard(data: Partial<IBusinessCard>, createdBy: string) {
  const { name, title, appId, email, phone } = data;
  
  if (!name || !title || !appId) {
    throw new Error('姓名、职位和平台ID不能为空');
  }
  
  // 检查邮箱是否已存在
  if (email) {
    const existingEmail = await BusinessCard.findByEmail(email, appId);
    if (existingEmail) {
      throw new Error('该邮箱已被使用');
    }
  }
  
  // 检查手机号是否已存在
  if (phone) {
    const existingPhone = await BusinessCard.findByPhone(phone, appId);
    if (existingPhone) {
      throw new Error('该手机号已被使用');
    }
  }
  
  const card = new BusinessCard({
    ...data,
    createdBy: createdBy === 'system' ? undefined : createdBy,
    isActive: true,
    viewCount: 0,
    shareCount: 0,
    contactCount: 0
  });
  
  const savedCard = await card.save();
  
  // 更新关联企业的员工数量
  if (savedCard.companyId) {
    await updateCompanyEmployeeCount(savedCard.companyId.toString());
  }
  
  return savedCard;
}

/**
 * 更新名片
 */
export async function updateBusinessCard(id: string, data: Partial<IBusinessCard>, updatedBy: string) {
  const card = await BusinessCard.findOne({ _id: id, isActive: true });
  
  if (!card) {
    throw new Error('名片不存在');
  }
  
  // 检查邮箱是否与其他名片重复
  if (data.email && data.email !== card.email) {
    const existingEmail = await BusinessCard.findByEmail(data.email, card.appId);
    if (existingEmail && (existingEmail._id as any).toString() !== id) {
      throw new Error('该邮箱已被使用');
    }
  }
  
  // 检查手机号是否与其他名片重复
  if (data.phone && data.phone !== card.phone) {
    const existingPhone = await BusinessCard.findByPhone(data.phone, card.appId);
    if (existingPhone && (existingPhone._id as any).toString() !== id) {
      throw new Error('该手机号已被使用');
    }
  }
  
  const oldCompanyId = card.companyId?.toString();
  
  Object.assign(card, data, { 
    lastModifiedBy: updatedBy === 'system' ? undefined : updatedBy 
  });
  
  const savedCard = await card.save();
  
  // 更新企业员工数量
  const newCompanyId = savedCard.companyId?.toString();
  if (oldCompanyId !== newCompanyId) {
    if (oldCompanyId) {
      await updateCompanyEmployeeCount(oldCompanyId);
    }
    if (newCompanyId) {
      await updateCompanyEmployeeCount(newCompanyId);
    }
  }
  
  return savedCard;
}

/**
 * 删除名片
 */
export async function deleteBusinessCard(id: string, appId: string) {
  const card = await BusinessCard.findOne({ _id: id, appId, isActive: true });
  
  if (!card) {
    throw new Error('名片不存在');
  }
  
  const companyId = card.companyId?.toString();
  
  card.isActive = false;
  await card.save();
  
  // 更新关联企业的员工数量
  if (companyId) {
    await updateCompanyEmployeeCount(companyId);
  }
  
  return card;
}

/**
 * 批量删除名片
 */
export async function batchDeleteBusinessCards(ids: string[], appId: string) {
  const cards = await BusinessCard.find({ _id: { $in: ids }, appId, isActive: true });
  
  if (cards.length !== ids.length) {
    throw new Error('部分名片不存在');
  }
  
  // 收集所有关联的企业ID
  const companyIds = new Set<string>();
  cards.forEach(card => {
    if (card.companyId) {
      companyIds.add(card.companyId.toString());
    }
  });
  
  await BusinessCard.updateMany(
    { _id: { $in: ids }, appId },
    { isActive: false }
  );
  
  // 更新所有关联企业的员工数量
  for (const companyId of companyIds) {
    await updateCompanyEmployeeCount(companyId);
  }
  
  return { deletedCount: ids.length };
}

/**
 * 根据企业ID获取名片
 */
export async function getBusinessCardsByCompany(companyId: string, appId: string) {
  return await BusinessCard.findByCompany(companyId, appId);
}

/**
 * 根据企业名称获取名片
 */
export async function getBusinessCardsByCompanyName(companyName: string, appId: string) {
  return await BusinessCard.findByCompanyName(companyName, appId);
}

/**
 * 搜索名片
 */
export async function searchBusinessCards(params: {
  keyword: string;
  appId: string;
  category?: string;
  isPublic?: boolean;
  limit?: number;
  skip?: number;
}) {
  return await BusinessCard.searchCards(params.keyword, params.appId, params);
}

/**
 * 获取热门名片
 */
export async function getPopularBusinessCards(appId: string, limit: number = 10) {
  return await BusinessCard.getPopularCards(appId, limit);
}

/**
 * 更新名片浏览次数
 */
export async function updateCardViewCount(id: string, appId: string) {
  const card = await BusinessCard.findOne({ _id: id, appId, isActive: true });
  if (card) {
    await card.updateViewCount();
    return card;
  }
  throw new Error('名片不存在');
}

/**
 * 更新名片分享次数
 */
export async function updateCardShareCount(id: string, appId: string) {
  const card = await BusinessCard.findOne({ _id: id, appId, isActive: true });
  if (card) {
    await card.updateShareCount();
    return card;
  }
  throw new Error('名片不存在');
}

/**
 * 更新名片联系次数
 */
export async function updateCardContactCount(id: string, appId: string) {
  const card = await BusinessCard.findOne({ _id: id, appId, isActive: true });
  if (card) {
    await card.updateContactCount();
    return card;
  }
  throw new Error('名片不存在');
}

/**
 * 生成名片二维码
 */
export async function generateCardQRCode(id: string, appId: string) {
  const card = await BusinessCard.findOne({ _id: id, appId, isActive: true });
  if (card) {
    const qrCode = await card.generateQRCode();
    return { qrCode, expiryTime: card.qrCodeExpiry };
  }
  throw new Error('名片不存在');
}

/**
 * 根据openid获取名片
 */
export async function getBusinessCardByOpenid(openid: string, appId: string) {
  return await BusinessCard.findByOpenid(openid, appId);
}

/**
 * 获取分类列表
 */
export async function getCategoryList(appId: string) {
  const categories = await BusinessCard.distinct('category', { appId, isActive: true, category: { $ne: null } });
  return categories.filter(Boolean).sort();
}

/**
 * 名片验证
 */
export async function verifyBusinessCard(id: string, verifiedBy: string) {
  const card = await BusinessCard.findById(id);
  
  if (!card) {
    throw new Error('名片不存在');
  }
  
  card.isVerified = true;
  card.lastModifiedBy = verifiedBy === 'system' ? undefined : verifiedBy;
  
  return await card.save();
}

/**
 * 取消名片验证
 */
export async function unverifyBusinessCard(id: string, unverifiedBy: string) {
  const card = await BusinessCard.findById(id);
  
  if (!card) {
    throw new Error('名片不存在');
  }
  
  card.isVerified = false;
  card.lastModifiedBy = unverifiedBy === 'system' ? undefined : unverifiedBy;
  
  return await card.save();
}