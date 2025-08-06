import request from '@/utils/request';

/**
 * 员工接口类型定义
 */
export interface EmployeeItem {
  _id: string;
  companyId: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  position: string;
  department?: string;
  level?: string;
  joinDate: string;
  probationEndDate?: string;
  contractType?: string;
  permissions: string[];
  canManageEmployees: boolean;
  canEditCompanyInfo: boolean;
  status: string;
  isActive: boolean;
  isManager: boolean;
  workEmail?: string;
  workPhone?: string;
  extension?: string;
  workAddress?: string;
  salary?: number;
  salaryGrade?: string;
  workSchedule?: {
    workDays: string[];
    startTime: string;
    endTime: string;
    timezone?: string;
  };
  supervisorId?: string;
  subordinateIds: string[];
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  tags?: string[];
  unionid?: string;
  bindTime?: string;
  appId: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // 关联信息
  companyInfo?: {
    _id: string;
    name: string;
    displayName: string;
  };
  supervisorInfo?: {
    _id: string;
    name: string;
    position: string;
  };
  subordinateInfo?: Array<{
    _id: string;
    name: string;
    position: string;
  }>;
  businessCard?: {
    _id: string;
    qrCode?: string;
    isActive: boolean;
  };
}

export interface EmployeeListParams {
  companyId: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
  department?: string;
  level?: string;
  status?: string;
  isManager?: boolean;
}

export interface EmployeeListResponse {
  list: EmployeeItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StatusOption {
  value: string;
  label: string;
}

/**
 * 获取企业员工列表
 */
export async function getEmployeeList(params: EmployeeListParams): Promise<EmployeeListResponse> {
  const { companyId, ...restParams } = params;
  return request(`/api/companies/${companyId}/employees`, {
    method: 'GET',
    params: restParams,
  });
}

/**
 * 获取员工详情
 */
export async function getEmployeeDetail(id: string): Promise<EmployeeItem> {
  return request(`/api/employees/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建员工
 */
export async function createEmployee(companyId: string, data: Partial<EmployeeItem>): Promise<EmployeeItem> {
  return request(`/api/companies/${companyId}/employees`, {
    method: 'POST',
    data: {
      ...data,
      companyId,
    },
  });
}

/**
 * 更新员工信息
 */
export async function updateEmployee(id: string, data: Partial<EmployeeItem>): Promise<EmployeeItem> {
  return request(`/api/employees/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除员工
 */
export async function deleteEmployee(id: string): Promise<void> {
  return request(`/api/employees/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 更新员工状态
 */
export async function updateEmployeeStatus(id: string, status: string): Promise<EmployeeItem> {
  return request(`/api/employees/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

/**
 * 绑定微信用户
 */
export async function bindWechatUser(id: string, unionid: string): Promise<EmployeeItem> {
  return request(`/api/employees/${id}/bind-wechat`, {
    method: 'POST',
    data: { unionid },
  });
}

/**
 * 解绑微信用户
 */
export async function unbindWechatUser(id: string): Promise<EmployeeItem> {
  return request(`/api/employees/${id}/bind-wechat`, {
    method: 'DELETE',
  });
}

/**
 * 设置上下级关系
 */
export async function setSupervisor(id: string, supervisorId: string | null): Promise<EmployeeItem> {
  return request(`/api/employees/${id}/supervisor`, {
    method: 'PUT',
    data: { supervisorId },
  });
}

/**
 * 获取部门列表
 */
export async function getDepartments(companyId: string): Promise<string[]> {
  return request(`/api/companies/${companyId}/departments`, {
    method: 'GET',
  });
}

/**
 * 获取职级列表
 */
export async function getLevels(companyId: string): Promise<string[]> {
  return request(`/api/companies/${companyId}/levels`, {
    method: 'GET',
  });
}

/**
 * 获取员工状态选项
 */
export async function getStatusOptions(): Promise<StatusOption[]> {
  return request('/api/employees/options/status', {
    method: 'GET',
  });
}

/**
 * 获取职级选项
 */
export async function getLevelOptions(): Promise<StatusOption[]> {
  return request('/api/employees/options/levels', {
    method: 'GET',
  });
}

/**
 * 获取合同类型选项
 */
export async function getContractTypeOptions(): Promise<StatusOption[]> {
  return request('/api/employees/options/contract-types', {
    method: 'GET',
  });
}