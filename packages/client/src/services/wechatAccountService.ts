import request from '@/utils/request';

export interface WechatAccount {
  _id: string;
  accountId: string;
  name: string;
  displayName: string;
  description?: string;
  avatar?: string;
  type: 'MINIPROGRAM' | 'OFFICIAL_ACCOUNT' | 'ENTERPRISE' | 'OPEN_PLATFORM';
  typeText: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  statusText: string;
  platformId: string;
  appId: string;
  originalId?: string;
  mchId?: string;
  payNotifyUrl?: string;
  refundNotifyUrl?: string;
  enablePayment: boolean;
  enableRefund: boolean;
  enableMessage: boolean;
  dailyApiLimit?: number;
  monthlyTransactionLimit?: number;
  monthlyTransactionLimitYuan?: string;
  stats: {
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    totalRevenueYuan?: string;
    lastActiveTime?: string;
    apiCallsToday: number;
  };
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  validFrom?: string;
  validTo?: string;
  remark?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WechatAccountListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  type?: string;
  platformId?: string;
}

export interface WechatAccountListResponse {
  accounts: WechatAccount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateWechatAccountParams {
  name: string;
  displayName: string;
  description?: string;
  avatar?: string;
  type: 'MINIPROGRAM' | 'OFFICIAL_ACCOUNT' | 'ENTERPRISE' | 'OPEN_PLATFORM';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  platformId: string;
  appId: string;
  appSecret: string;
  originalId?: string;
  mchId?: string;
  mchKey?: string;
  payNotifyUrl?: string;
  refundNotifyUrl?: string;
  enablePayment?: boolean;
  enableRefund?: boolean;
  enableMessage?: boolean;
  dailyApiLimit?: number;
  monthlyTransactionLimit?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  validFrom?: string;
  validTo?: string;
  remark?: string;
  tags?: string[];
}

export interface UpdateWechatAccountParams {
  name?: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  appSecret?: string;
  originalId?: string;
  mchId?: string;
  mchKey?: string;
  payNotifyUrl?: string;
  refundNotifyUrl?: string;
  enablePayment?: boolean;
  enableRefund?: boolean;
  enableMessage?: boolean;
  dailyApiLimit?: number;
  monthlyTransactionLimit?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  validFrom?: string;
  validTo?: string;
  remark?: string;
  tags?: string[];
}

export interface WechatAccountStats {
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  accountsByType: {
    [key: string]: number;
  };
  recentActiveAccounts: WechatAccount[];
}

export interface WechatAccountOptions {
  status: Array<{ value: string; label: string }>;
  type: Array<{ value: string; label: string }>;
}

/**
 * 获取微信账号列表
 */
export async function getWechatAccountList(params: WechatAccountListParams = {}) {
  return request<WechatAccountListResponse>('/api/admin/wechat-accounts', {
    method: 'GET',
    params,
  });
}

/**
 * 创建微信账号
 */
export async function createWechatAccount(data: CreateWechatAccountParams) {
  return request<WechatAccount>('/api/admin/wechat-accounts', {
    method: 'POST',
    data,
  });
}

/**
 * 获取微信账号详情
 */
export async function getWechatAccountDetail(accountId: string) {
  return request<WechatAccount>(`/api/admin/wechat-accounts/${accountId}`, {
    method: 'GET',
  });
}

/**
 * 更新微信账号
 */
export async function updateWechatAccount(
  accountId: string,
  data: UpdateWechatAccountParams
) {
  return request<WechatAccount>(`/api/admin/wechat-accounts/${accountId}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除微信账号
 */
export async function deleteWechatAccount(accountId: string) {
  return request<null>(`/api/admin/wechat-accounts/${accountId}`, {
    method: 'DELETE',
  });
}

/**
 * 激活微信账号
 */
export async function activateWechatAccount(accountId: string) {
  return request<WechatAccount>(`/api/admin/wechat-accounts/${accountId}/activate`, {
    method: 'POST',
  });
}

/**
 * 暂停微信账号
 */
export async function suspendWechatAccount(accountId: string, reason?: string) {
  return request<WechatAccount>(`/api/admin/wechat-accounts/${accountId}/suspend`, {
    method: 'POST',
    data: { reason },
  });
}

/**
 * 测试微信账号配置
 */
export async function testWechatAccountConfig(accountId: string) {
  return request<{
    valid: boolean;
    checks: Record<string, boolean>;
    message: string;
  }>(`/api/admin/wechat-accounts/${accountId}/test`, {
    method: 'POST',
  });
}

/**
 * 获取微信账号统计
 */
export async function getWechatAccountStats(platformId?: string) {
  return request<WechatAccountStats>('/api/admin/wechat-accounts/stats', {
    method: 'GET',
    params: { platformId },
  });
}

/**
 * 获取微信账号配置选项
 */
export async function getWechatAccountOptions() {
  return request<WechatAccountOptions>('/api/admin/wechat-accounts/options', {
    method: 'GET',
  });
}

/**
 * 批量操作微信账号
 */
export async function batchOperateWechatAccounts(
  accountIds: string[],
  operation: 'activate' | 'suspend' | 'delete',
  params?: any
) {
  return request<{
    results: Array<{ accountId: string; success: boolean; error?: string }>;
    summary: {
      total: number;
      success: number;
      failed: number;
    };
  }>('/api/admin/wechat-accounts/batch', {
    method: 'POST',
    data: {
      accountIds,
      operation,
      params,
    },
  });
}

/**
 * 获取指定平台的微信账号选择列表
 */
export async function getPlatformWechatAccounts(
  platformId: string,
  type?: string
) {
  return request<Array<{
    accountId: string;
    name: string;
    displayName: string;
    type: string;
    typeText: string;
    appId: string;
    enablePayment: boolean;
  }>>(`/api/admin/platforms/${platformId}/wechat-accounts`, {
    method: 'GET',
    params: { type },
  });
}