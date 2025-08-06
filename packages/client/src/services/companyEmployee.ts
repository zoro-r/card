import request from '@/utils/request';

export interface CompanyEmployee {
  _id?: string;
  companyId: string;
  businessCardId: string;
  position: string;
  department?: string;
  level?: string;
  joinDate: string;
  probationEndDate?: string;
  contractType?: string;
  permissions?: string[];
  canManageEmployees?: boolean;
  canEditCompanyInfo?: boolean;
  status?: string;
  isActive?: boolean;
  isManager?: boolean;
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
  subordinateIds?: string[];
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  tags?: string[];
  appId: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  employeeInfo?: any;
  companyInfo?: any;
  supervisorInfo?: any;
  subordinateInfo?: any[];
}

export interface CompanyEmployeeListParams {
  companyId?: string;
  appId: string;
  page?: number;
  limit?: number;
  keyword?: string;
  department?: string;
  level?: string;
  status?: string;
  isManager?: boolean;
}

export interface CompanyEmployeeSearchParams {
  keyword: string;
  companyId: string;
  appId: string;
  department?: string;
  level?: string;
  status?: string;
  isManager?: boolean;
  limit?: number;
  skip?: number;
}

/**
 * 获取企业员工列表
 */
export async function getCompanyEmployeeList(params: CompanyEmployeeListParams) {
  return request('/api/company-employees', {
    method: 'GET',
    params,
  });
}

/**
 * 获取员工详情
 */
export async function getCompanyEmployeeDetail(id: string, appId: string) {
  return request(`/api/company-employees/${id}`, {
    method: 'GET',
    params: { appId },
  });
}

/**
 * 添加企业员工
 */
export async function addCompanyEmployee(data: Partial<CompanyEmployee>) {
  return request('/api/company-employees', {
    method: 'POST',
    data,
  });
}

/**
 * 更新企业员工
 */
export async function updateCompanyEmployee(id: string, data: Partial<CompanyEmployee>) {
  return request(`/api/company-employees/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除企业员工（离职）
 */
export async function removeCompanyEmployee(id: string, appId: string) {
  return request(`/api/company-employees/${id}`, {
    method: 'DELETE',
    params: { appId },
  });
}

/**
 * 批量删除企业员工
 */
export async function batchRemoveCompanyEmployees(ids: string[], appId: string) {
  return request('/api/company-employees/batch-remove', {
    method: 'POST',
    data: { ids, appId },
  });
}

/**
 * 根据企业获取员工
 */
export async function getEmployeesByCompany(companyId: string, appId: string) {
  return request(`/api/company-employees/company/${companyId}`, {
    method: 'GET',
    params: { appId },
  });
}

/**
 * 根据部门获取员工
 */
export async function getEmployeesByDepartment(companyId: string, department: string, appId: string) {
  return request('/api/company-employees/department', {
    method: 'GET',
    params: { companyId, department, appId },
  });
}

/**
 * 获取管理人员
 */
export async function getManagers(companyId: string, appId: string) {
  return request('/api/company-employees/managers', {
    method: 'GET',
    params: { companyId, appId },
  });
}

/**
 * 获取下属员工
 */
export async function getSubordinates(supervisorId: string, appId: string) {
  return request('/api/company-employees/subordinates', {
    method: 'GET',
    params: { supervisorId, appId },
  });
}

/**
 * 搜索员工
 */
export async function searchEmployees(params: CompanyEmployeeSearchParams) {
  return request('/api/company-employees/search', {
    method: 'GET',
    params,
  });
}

/**
 * 获取员工统计信息
 */
export async function getEmployeeStats(companyId: string, appId: string) {
  return request('/api/company-employees/stats', {
    method: 'GET',
    params: { companyId, appId },
  });
}

/**
 * 获取部门列表
 */
export async function getDepartments(companyId: string, appId: string) {
  return request('/api/company-employees/options/departments', {
    method: 'GET',
    params: { companyId, appId },
  });
}

/**
 * 获取职级选项
 */
export async function getLevels() {
  return request('/api/company-employees/options/levels', {
    method: 'GET',
  });
}

/**
 * 获取合同类型选项
 */
export async function getContractTypes() {
  return request('/api/company-employees/options/contract-types', {
    method: 'GET',
  });
}

/**
 * 获取状态选项
 */
export async function getStatuses() {
  return request('/api/company-employees/options/statuses', {
    method: 'GET',
  });
}

/**
 * 更新员工状态
 */
export async function updateEmployeeStatus(id: string, status: string, appId: string) {
  return request(`/api/company-employees/${id}/status`, {
    method: 'POST',
    data: { status, appId },
  });
}

/**
 * 添加员工权限
 */
export async function addEmployeePermission(id: string, permission: string, appId: string) {
  return request(`/api/company-employees/${id}/permissions/add`, {
    method: 'POST',
    data: { permission, appId },
  });
}

/**
 * 移除员工权限
 */
export async function removeEmployeePermission(id: string, permission: string, appId: string) {
  return request(`/api/company-employees/${id}/permissions/remove`, {
    method: 'POST',
    data: { permission, appId },
  });
}

/**
 * 设置上下级关系
 */
export async function setSupervisorRelation(employeeId: string, supervisorId: string, appId: string) {
  return request(`/api/company-employees/${employeeId}/supervisor`, {
    method: 'POST',
    data: { supervisorId, appId },
  });
}