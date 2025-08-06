import request from '@/utils/request';

export interface BusinessCard {
  _id: string;
  name: string;
  title: string;
  companyId?: string;
  company?: string;
  department?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  wechat?: string;
  address?: string;
  website?: string;
  linkedin?: string;
  weibo?: string;
  introduction?: string;
  specialties?: string[];
  services?: string[];
  openid?: string;
  appId: string;
  qrCode?: string;
  qrCodeExpiry?: string;
  isActive: boolean;
  isPublic: boolean;
  isVerified: boolean;
  viewCount: number;
  shareCount: number;
  contactCount: number;
  tags?: string[];
  category?: string;
  theme?: string;
  backgroundColor?: string;
  textColor?: string;
  companyInfo?: any;
  createdBy?: any;
  lastModifiedBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessCardListParams {
  appId: string;
  page?: number;
  limit?: number;
  keyword?: string;
  companyId?: string;
  category?: string;
  isPublic?: boolean;
  isVerified?: boolean;
}

export interface BusinessCardListResponse {
  list: BusinessCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 获取名片列表
export async function getBusinessCardList(params: BusinessCardListParams): Promise<BusinessCardListResponse> {
  return request('/api/business-cards', {
    method: 'GET',
    params,
  });
}

// 获取名片详情
export async function getBusinessCardDetail(id: string, appId: string): Promise<BusinessCard> {
  return request(`/api/business-cards/${id}`, {
    method: 'GET',
    params: { appId },
  });
}

// 创建名片
export async function createBusinessCard(data: Partial<BusinessCard>): Promise<BusinessCard> {
  return request('/api/business-cards', {
    method: 'POST',
    data,
  });
}

// 更新名片
export async function updateBusinessCard(id: string, data: Partial<BusinessCard>): Promise<BusinessCard> {
  return request(`/api/business-cards/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除名片
export async function deleteBusinessCard(id: string, appId: string): Promise<void> {
  return request(`/api/business-cards/${id}`, {
    method: 'DELETE',
    params: { appId },
  });
}

// 批量删除名片
export async function batchDeleteBusinessCards(ids: string[], appId: string): Promise<{ deletedCount: number }> {
  return request('/api/business-cards/batch-delete', {
    method: 'POST',
    data: { ids, appId },
  });
}

// 根据企业获取名片
export async function getCardsByCompany(companyId: string, appId: string): Promise<BusinessCard[]> {
  return request('/api/business-cards/company/' + companyId, {
    method: 'GET',
    params: { appId },
  });
}

// 根据企业名称获取名片
export async function getCardsByCompanyName(companyName: string, appId: string): Promise<BusinessCard[]> {
  return request('/api/business-cards/company-name/' + companyName, {
    method: 'GET',
    params: { appId },
  });
}

// 搜索名片
export async function searchBusinessCards(params: {
  keyword: string;
  appId: string;
  category?: string;
  isPublic?: boolean;
  limit?: number;
  skip?: number;
}): Promise<BusinessCard[]> {
  return request('/api/business-cards/search', {
    method: 'GET',
    params,
  });
}

// 获取热门名片
export async function getPopularBusinessCards(appId: string, limit?: number): Promise<BusinessCard[]> {
  return request('/api/business-cards/popular', {
    method: 'GET',
    params: { appId, limit },
  });
}

// 更新浏览次数
export async function updateViewCount(id: string, appId: string): Promise<BusinessCard> {
  return request(`/api/business-cards/${id}/view`, {
    method: 'POST',
    data: { appId },
  });
}

// 更新分享次数
export async function updateShareCount(id: string, appId: string): Promise<BusinessCard> {
  return request(`/api/business-cards/${id}/share`, {
    method: 'POST',
    data: { appId },
  });
}

// 更新联系次数
export async function updateContactCount(id: string, appId: string): Promise<BusinessCard> {
  return request(`/api/business-cards/${id}/contact`, {
    method: 'POST',
    data: { appId },
  });
}

// 生成二维码
export async function generateQRCode(id: string, appId: string): Promise<{ qrCode: string; expiryTime: string }> {
  return request(`/api/business-cards/${id}/qrcode`, {
    method: 'GET',
    params: { appId },
  });
}

// 根据openid获取名片
export async function getCardByOpenid(openid: string, appId: string): Promise<BusinessCard> {
  return request('/api/business-cards/openid/' + openid, {
    method: 'GET',
    params: { appId },
  });
}

// 获取分类列表
export async function getCategoryList(appId: string): Promise<string[]> {
  return request('/api/business-cards/options/categories', {
    method: 'GET',
    params: { appId },
  });
}

// 名片验证
export async function verifyBusinessCard(id: string): Promise<BusinessCard> {
  return request(`/api/business-cards/${id}/verify`, {
    method: 'POST',
  });
}

// 取消名片验证
export async function unverifyBusinessCard(id: string): Promise<BusinessCard> {
  return request(`/api/business-cards/${id}/unverify`, {
    method: 'POST',
  });
}