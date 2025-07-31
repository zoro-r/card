import request from '@/utils/request';

export interface WechatUser {
  _id: string;
  openid: string;
  unionid?: string;
  nickName?: string;
  avatarUrl?: string;
  gender?: number;
  city?: string;
  province?: string;
  country?: string;
  language?: string;
  phone?: string;
  phoneCountryCode?: string;
  platformId: string;
  isActive: boolean;
  isBlocked: boolean;
  lastLoginTime?: string;
  registerTime: string;
  loginCount: number;
  tags?: string[];
  remark?: string;
  source?: string;
  genderText: string;
  createdAt: string;
  updatedAt: string;
}

export interface WechatUserListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  accountId: string; // 直接使用accountId
}

export interface WechatUserListResponse {
  users: WechatUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateUserStatusParams {
  isActive?: boolean;
  isBlocked?: boolean;
  remark?: string;
}

/**
 * 获取微信用户列表
 */
export async function getWechatUserList(params: WechatUserListParams) {
  return request<WechatUserListResponse>(`/api/admin/wechat/accounts/${params.accountId}/users`, {
    method: 'GET',
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      keyword: params.keyword,
    },
  });
}

/**
 * 更新微信用户状态
 */
export async function updateWechatUserStatus(
  accountId: string,
  userId: string,
  data: UpdateUserStatusParams
) {
  return request<WechatUser>(`/api/admin/wechat/accounts/${accountId}/users/${userId}/status`, {
    method: 'PUT',
    data,
  });
}

/**
 * 获取微信用户详情
 */
export async function getWechatUserDetail(accountId: string, userId: string) {
  return request<WechatUser>(`/api/admin/wechat/accounts/${accountId}/users/${userId}`, {
    method: 'GET',
  });
}