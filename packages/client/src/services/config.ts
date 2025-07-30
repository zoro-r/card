import request from '@/utils/request';

export interface ConfigItem {
  _id: string;
  key: string;
  data: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigResponse {
  success: boolean;
  data?: ConfigItem | ConfigItem[];
  total?: number;
  message?: string;
}

// 获取所有配置
export async function getConfigs(): Promise<ConfigResponse> {
  return request('/api/config/list');
}

// 获取单个配置
export async function getConfig(key: string): Promise<ConfigResponse> {
  return request(`/api/config/${key}`);
}

// 创建或更新配置
export async function upsertConfig(data: {
  key: string;
  data: any;
  description?: string;
}): Promise<ConfigResponse> {
  return request('/api/config', {
    method: 'POST',
    data,
  });
}

// 删除配置
export async function deleteConfig(key: string): Promise<ConfigResponse> {
  return request(`/api/config/${key}`, {
    method: 'DELETE',
  });
}

// 获取配置数据（公开接口）
export async function getConfigData(key: string): Promise<any> {
  return request(`/public/config/${key}`);
}