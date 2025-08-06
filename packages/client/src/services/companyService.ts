import request from '@/utils/request';

export interface Company {
  _id: string;
  name: string;
  displayName: string;
  englishName?: string;
  logo?: string;
  description?: string;
  industry?: string;
  scale?: string;
  establishedYear?: number;
  legalPerson?: string;
  registeredCapital?: string;
  businessScope?: string;
  address?: string;
  officeAddress?: string;
  phone?: string;
  email?: string;
  website?: string;
  wechatAccount?: string;
  weiboAccount?: string;
  linkedinAccount?: string;
  businessLicense?: string;
  taxNumber?: string;
  organizationCode?: string;
  creditCode?: string;
  isVerified: boolean;
  verifyType?: string;
  verifyTime?: string;
  verifyExpiry?: string;
  appId: string;
  isActive: boolean;
  isPublic: boolean;
  employeeCount: number;
  viewCount: number;
  theme?: string;
  settings?: {
    allowPublicSearch: boolean;
    allowEmployeeJoin: boolean;
    requireApproval: boolean;
  };
  createdBy?: any;
  lastModifiedBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListParams {
  appId: string;
  page?: number;
  limit?: number;
  keyword?: string;
  industry?: string;
  scale?: string;
  isVerified?: boolean;
}

export interface CompanyListResponse {
  list: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 获取企业列表
export async function getCompanyList(params: CompanyListParams): Promise<CompanyListResponse> {
  return request('/api/companies', {
    method: 'GET',
    params,
  });
}

// 获取企业详情
export async function getCompanyDetail(id: string, appId: string): Promise<Company> {
  return request(`/api/companies/${id}`, {
    method: 'GET',
    params: { appId },
  });
}

// 创建企业
export async function createCompany(data: Partial<Company>): Promise<Company> {
  return request('/api/companies', {
    method: 'POST',
    data,
  });
}

// 更新企业
export async function updateCompany(id: string, data: Partial<Company>): Promise<Company> {
  return request(`/api/companies/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除企业
export async function deleteCompany(id: string, appId: string): Promise<void> {
  return request(`/api/companies/${id}`, {
    method: 'DELETE',
    params: { appId },
  });
}

// 批量删除企业
export async function batchDeleteCompanies(ids: string[], appId: string): Promise<{ deletedCount: number }> {
  return request('/api/companies/batch-delete', {
    method: 'POST',
    data: { ids, appId },
  });
}

// 获取行业列表
export async function getIndustryList(appId: string): Promise<string[]> {
  return request('/api/companies/options/industries', {
    method: 'GET',
    params: { appId },
  });
}

// 获取企业规模选项
export async function getScaleOptions(): Promise<string[]> {
  return request('/api/companies/options/scales', {
    method: 'GET',
  });
}

// 搜索企业
export async function searchCompanies(params: {
  keyword: string;
  appId: string;
  industry?: string;
  scale?: string;
  isVerified?: boolean;
  limit?: number;
  skip?: number;
}): Promise<Company[]> {
  return request('/api/companies/search', {
    method: 'GET',
    params,
  });
}

// 获取认证企业
export async function getVerifiedCompanies(appId: string, limit?: number): Promise<Company[]> {
  return request('/api/companies/verified', {
    method: 'GET',
    params: { appId, limit },
  });
}

// 根据行业获取企业
export async function getCompaniesByIndustry(industry: string, appId: string): Promise<Company[]> {
  return request('/api/companies/industry/' + industry, {
    method: 'GET',
    params: { appId },
  });
}

// 企业认证
export async function verifyCompany(id: string, data: {
  verifyType: string;
  verifyExpiry?: string;
}): Promise<Company> {
  return request(`/api/companies/${id}/verify`, {
    method: 'POST',
    data,
  });
}

// 取消企业认证
export async function unverifyCompany(id: string): Promise<Company> {
  return request(`/api/companies/${id}/unverify`, {
    method: 'POST',
  });
}