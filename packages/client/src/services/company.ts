import request from '@/utils/request';

/**
 * 企业接口类型定义
 */
export interface CompanyItem {
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
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  industry?: string;
  scale?: string;
  isVerified?: boolean;
  isPublic?: boolean;
}

export interface CompanyListResponse {
  list: CompanyItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CompanyStats {
  company: CompanyItem;
  employeeStats: {
    totalEmployees: number;
    activeEmployees: number;
    managers: number;
    departments: string[];
    levels: string[];
  };
  businessCardCount: number;
  lastUpdate: string;
}

/**
 * 获取企业列表
 */
export async function getCompanyList(params?: CompanyListParams): Promise<CompanyListResponse> {
  return request('/api/companies', {
    method: 'GET',
    params,
  });
}

/**
 * 获取企业详情
 */
export async function getCompanyDetail(id: string): Promise<CompanyItem> {
  return request(`/api/companies/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建企业
 */
export async function createCompany(data: Partial<CompanyItem>): Promise<CompanyItem> {
  return request('/api/companies', {
    method: 'POST',
    data,
  });
}

/**
 * 更新企业信息
 */
export async function updateCompany(id: string, data: Partial<CompanyItem>): Promise<CompanyItem> {
  return request(`/api/companies/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除企业
 */
export async function deleteCompany(id: string): Promise<void> {
  return request(`/api/companies/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 获取企业统计信息
 */
export async function getCompanyStats(id: string): Promise<CompanyStats> {
  return request(`/api/companies/${id}/stats`, {
    method: 'GET',
  });
}

/**
 * 获取行业列表
 */
export async function getIndustries(): Promise<string[]> {
  return request('/api/companies/options/industries', {
    method: 'GET',
  });
}

/**
 * 获取企业规模选项
 */
export async function getScales(): Promise<string[]> {
  return request('/api/companies/options/scales', {
    method: 'GET',
  });
}