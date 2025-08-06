import { Company, ICompany } from '@/models/company';
import { BusinessCard } from '@/models/businessCard';
import { getDefaultPlatformId } from '@/utils/platform';

/**
 * 获取企业列表
 */
export async function getCompanyList(params: {
  appId: string;
  page?: number;
  limit?: number;
  keyword?: string;
  industry?: string;
  scale?: string;
  isVerified?: boolean;
}) {
  const { appId, page = 1, limit = 20, keyword, industry, scale, isVerified } = params;
  
  const query: any = { appId, isActive: true };
  
  if (keyword) {
    query.$or = [
      { name: new RegExp(keyword, 'i') },
      { displayName: new RegExp(keyword, 'i') },
      { englishName: new RegExp(keyword, 'i') },
      { description: new RegExp(keyword, 'i') }
    ];
  }
  
  if (industry) query.industry = industry;
  if (scale) query.scale = scale;
  if (typeof isVerified === 'boolean') query.isVerified = isVerified;
  
  const skip = (page - 1) * limit;
  
  const [list, total] = await Promise.all([
    Company.find(query)
      .sort({ isVerified: -1, employeeCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'loginName realName')
      .populate('lastModifiedBy', 'loginName realName'),
    Company.countDocuments(query)
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
 * 获取企业详情
 */
export async function getCompanyById(id: string, appId: string) {
  const company = await Company.findOne({ _id: id, appId, isActive: true })
    .populate('createdBy', 'loginName realName')
    .populate('lastModifiedBy', 'loginName realName');
    
  if (!company) {
    throw new Error('企业不存在');
  }
  
  return company;
}

/**
 * 创建企业
 */
export async function createCompany(data: Partial<ICompany>, createdBy: string) {
  const { name, appId } = data;
  
  if (!name || !appId) {
    throw new Error('企业名称和平台ID不能为空');
  }
  
  // 检查企业名称是否已存在
  const existingCompany = await Company.findByName(name, appId);
  if (existingCompany) {
    throw new Error('企业名称已存在');
  }
  
  // 如果提供了统一社会信用代码，检查是否已存在
  if (data.creditCode) {
    const existingCreditCode = await Company.findByCreditCode(data.creditCode, appId);
    if (existingCreditCode) {
      throw new Error('统一社会信用代码已存在');
    }
  }
  
  const company = new Company({
    ...data,
    createdBy: createdBy === 'system' ? undefined : createdBy,
    isActive: true,
    employeeCount: 0,
    viewCount: 0
  });
  
  return await company.save();
}

/**
 * 更新企业
 */
export async function updateCompany(id: string, data: Partial<ICompany>, updatedBy: string) {
  const company = await Company.findOne({ _id: id, isActive: true });
  
  if (!company) {
    throw new Error('企业不存在');
  }
  
  // 检查企业名称是否与其他企业重复
  if (data.name && data.name !== company.name) {
    const existingCompany = await Company.findByName(data.name, company.appId);
    if (existingCompany && (existingCompany._id as any).toString() !== id) {
      throw new Error('企业名称已存在');
    }
  }
  
  // 检查统一社会信用代码是否与其他企业重复
  if (data.creditCode && data.creditCode !== company.creditCode) {
    const existingCreditCode = await Company.findByCreditCode(data.creditCode, company.appId);
    if (existingCreditCode && (existingCreditCode._id as any).toString() !== id) {
      throw new Error('统一社会信用代码已存在');
    }
  }
  
  Object.assign(company, data, { 
    lastModifiedBy: updatedBy === 'system' ? undefined : updatedBy 
  });
  
  return await company.save();
}

/**
 * 删除企业
 */
export async function deleteCompany(id: string, appId: string) {
  const company = await Company.findOne({ _id: id, appId, isActive: true });
  
  if (!company) {
    throw new Error('企业不存在');
  }
  
  // 检查是否有关联的名片
  const cardCount = await BusinessCard.countDocuments({ companyId: id, isActive: true });
  if (cardCount > 0) {
    throw new Error(`该企业下还有 ${cardCount} 张名片，无法删除`);
  }
  
  company.isActive = false;
  return await company.save();
}

/**
 * 批量删除企业
 */
export async function batchDeleteCompanies(ids: string[], appId: string) {
  const companies = await Company.find({ _id: { $in: ids }, appId, isActive: true });
  
  if (companies.length !== ids.length) {
    throw new Error('部分企业不存在');
  }
  
  // 检查是否有关联的名片
  for (const company of companies) {
    const cardCount = await BusinessCard.countDocuments({ companyId: company._id, isActive: true });
    if (cardCount > 0) {
      throw new Error(`企业"${company.name}"下还有 ${cardCount} 张名片，无法删除`);
    }
  }
  
  await Company.updateMany(
    { _id: { $in: ids }, appId },
    { isActive: false }
  );
  
  return { deletedCount: ids.length };
}

/**
 * 更新企业员工数量
 */
export async function updateCompanyEmployeeCount(companyId: string) {
  const company = await Company.findById(companyId);
  if (company) {
    await company.updateEmployeeCount();
  }
}

/**
 * 获取行业列表
 */
export async function getIndustryList(appId: string) {
  const industries = await Company.distinct('industry', { appId, isActive: true, industry: { $ne: null } });
  return industries.filter(Boolean).sort();
}

/**
 * 获取企业规模选项
 */
export function getScaleOptions() {
  return ['1-10人', '11-50人', '51-200人', '201-500人', '501-1000人', '1000人以上'];
}

/**
 * 搜索企业
 */
export async function searchCompanies(params: {
  keyword: string;
  appId: string;
  industry?: string;
  scale?: string;
  isVerified?: boolean;
  limit?: number;
  skip?: number;
}) {
  return await Company.searchCompanies(params.keyword, params.appId, params);
}

/**
 * 获取认证企业
 */
export async function getVerifiedCompanies(appId: string, limit: number = 10) {
  return await Company.getVerifiedCompanies(appId, limit);
}

/**
 * 根据行业获取企业
 */
export async function getCompaniesByIndustry(industry: string, appId: string) {
  return await Company.getCompaniesByIndustry(industry, appId);
}

/**
 * 企业认证
 */
export async function verifyCompany(id: string, verifyData: {
  verifyType: string;
  verifyTime: Date;
  verifyExpiry?: Date;
}, verifiedBy: string) {
  const company = await Company.findById(id);
  
  if (!company) {
    throw new Error('企业不存在');
  }
  
  company.isVerified = true;
  company.verifyType = verifyData.verifyType;
  company.verifyTime = verifyData.verifyTime;
  company.verifyExpiry = verifyData.verifyExpiry;
  company.lastModifiedBy = verifiedBy === 'system' ? undefined : verifiedBy;
  
  return await company.save();
}

/**
 * 取消企业认证
 */
export async function unverifyCompany(id: string, unverifiedBy: string) {
  const company = await Company.findById(id);
  
  if (!company) {
    throw new Error('企业不存在');
  }
  
  company.isVerified = false;
  company.verifyType = undefined;
  company.verifyTime = undefined;
  company.verifyExpiry = undefined;
  company.lastModifiedBy = unverifiedBy === 'system' ? undefined : unverifiedBy;
  
  return await company.save();
}