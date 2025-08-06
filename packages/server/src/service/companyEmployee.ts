import { CompanyEmployee, ICompanyEmployee } from '@/models/companyEmployee';
import { Company } from '@/models/company';
import { BusinessCard } from '@/models/businessCard';
import mongoose from 'mongoose';

/**
 * 获取企业员工列表
 */
export async function getCompanyEmployeeList(params: {
  companyId?: string;
  appId: string;
  page?: number;
  limit?: number;
  keyword?: string;
  department?: string;
  level?: string;
  status?: string;
  isManager?: boolean;
}) {
  const { companyId, appId, page = 1, limit = 20, keyword, department, level, status = '在职', isManager } = params;
  
  const query: any = { appId, isActive: true, status };
  
  if (companyId) query.companyId = companyId;
  if (department) query.department = department;
  if (level) query.level = level;
  if (typeof isManager === 'boolean') query.isManager = isManager;
  
  if (keyword) {
    query.$or = [
      { position: new RegExp(keyword, 'i') },
      { department: new RegExp(keyword, 'i') },
      { notes: new RegExp(keyword, 'i') }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const [list, total] = await Promise.all([
    CompanyEmployee.find(query)
      .populate('businessCard', 'qrCode isPublic isVerified viewCount shareCount contactCount')
      .populate('companyInfo', 'name displayName')
      .populate('supervisorInfo')
      .sort({ joinDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CompanyEmployee.countDocuments(query)
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
 * 获取员工详情
 */
export async function getCompanyEmployeeById(id: string, appId: string) {
  const employee = await CompanyEmployee.findOne({ _id: id, appId, isActive: true })
    .populate('businessCard')
    .populate('companyInfo')
    .populate('supervisorInfo')
    .populate('subordinateInfo');
    
  if (!employee) {
    throw new Error('员工不存在');
  }
  
  return employee;
}

/**
 * 添加企业员工
 */
export async function addCompanyEmployee(data: Partial<ICompanyEmployee>, createdBy: string) {
  const { companyId, name, phone, email, appId } = data;
  
  if (!companyId || !name || !appId) {
    throw new Error('企业ID、员工姓名和平台ID不能为空');
  }
  
  // 检查企业是否存在
  const company = await Company.findOne({ _id: companyId, appId, isActive: true });
  if (!company) {
    throw new Error('企业不存在');
  }
  
  // 检查同一企业中是否已有同手机号的员工（如果提供了手机号）
  if (phone) {
    const existingEmployeeByPhone = await CompanyEmployee.findOne({ 
      companyId, 
      phone, 
      appId, 
      isActive: true 
    });
    if (existingEmployeeByPhone) {
      throw new Error('该手机号已在企业中使用');
    }
  }
  
  // 检查同一企业中是否已有同邮箱的员工（如果提供了邮箱）
  if (email) {
    const existingEmployeeByEmail = await CompanyEmployee.findOne({ 
      companyId, 
      email, 
      appId, 
      isActive: true 
    });
    if (existingEmployeeByEmail) {
      throw new Error('该邮箱已在企业中使用');
    }
  }
  
  const employee = new CompanyEmployee({
    ...data,
    createdBy: createdBy === 'system' ? undefined : createdBy,
    isActive: true,
    status: data.status || '在职',
    joinDate: data.joinDate || new Date(),
    permissions: data.permissions || [],
    canManageEmployees: data.canManageEmployees || false,
    canEditCompanyInfo: data.canEditCompanyInfo || false,
    isManager: data.isManager || false
  });
  
  const savedEmployee = await employee.save();
  
  // 创建对应的名片
  const businessCard = new BusinessCard({
    employeeId: savedEmployee._id,
    name: savedEmployee.name,
    title: savedEmployee.position,
    companyName: company.displayName || company.name,
    department: savedEmployee.department,
    phone: savedEmployee.phone,
    email: savedEmployee.email,
    avatar: savedEmployee.avatar,
    appId: savedEmployee.appId,
    isActive: true,
    isPublic: true,
    isVerified: false,
    viewCount: 0,
    shareCount: 0,
    contactCount: 0
  });
  
  await businessCard.save();
  
  // 更新企业员工数量
  await company.updateEmployeeCount();
  
  return savedEmployee;
}

/**
 * 更新企业员工
 */
export async function updateCompanyEmployee(id: string, data: Partial<ICompanyEmployee>, updatedBy: string) {
  const employee = await CompanyEmployee.findOne({ _id: id, isActive: true });
  
  if (!employee) {
    throw new Error('员工不存在');
  }
  
  // 如果更改了企业，需要检查新企业是否存在
  if (data.companyId && data.companyId.toString() !== employee.companyId.toString()) {
    const company = await Company.findOne({ _id: data.companyId, appId: employee.appId, isActive: true });
    if (!company) {
      throw new Error('目标企业不存在');
    }
  }
  
  // 如果更改了手机号，检查是否重复
  if (data.phone && data.phone !== employee.phone) {
    const existingEmployee = await CompanyEmployee.findOne({ 
      companyId: data.companyId || employee.companyId,
      phone: data.phone,
      appId: employee.appId,
      isActive: true,
      _id: { $ne: id }
    });
    if (existingEmployee) {
      throw new Error('该手机号已在企业中使用');
    }
  }
  
  // 如果更改了邮箱，检查是否重复
  if (data.email && data.email !== employee.email) {
    const existingEmployee = await CompanyEmployee.findOne({ 
      companyId: data.companyId || employee.companyId,
      email: data.email,
      appId: employee.appId,
      isActive: true,
      _id: { $ne: id }
    });
    if (existingEmployee) {
      throw new Error('该邮箱已在企业中使用');
    }
  }
  
  const oldCompanyId = employee.companyId.toString();
  
  Object.assign(employee, data, { 
    lastModifiedBy: updatedBy === 'system' ? undefined : updatedBy 
  });
  
  const savedEmployee = await employee.save();
  
  // 同步更新对应的名片信息
  const businessCard = await BusinessCard.findOne({ employeeId: employee._id });
  if (businessCard) {
    const company = await Company.findOne({ _id: savedEmployee.companyId });
    
    await BusinessCard.findByIdAndUpdate(businessCard._id, {
      name: savedEmployee.name || businessCard.name,
      title: savedEmployee.position || businessCard.title,
      companyName: company?.displayName || company?.name || businessCard.companyName,
      department: savedEmployee.department || businessCard.department,
      phone: savedEmployee.phone || businessCard.phone,
      email: savedEmployee.email || businessCard.email,
      avatar: savedEmployee.avatar || businessCard.avatar
    });
  }
  
  // 更新企业员工数量
  if (data.companyId && data.companyId.toString() !== oldCompanyId) {
    // 更新旧企业员工数量
    const oldCompany = await Company.findById(oldCompanyId);
    if (oldCompany) {
      await oldCompany.updateEmployeeCount();
    }
    
    // 更新新企业员工数量  
    const newCompany = await Company.findById(data.companyId);
    if (newCompany) {
      await newCompany.updateEmployeeCount();
    }
  }
  
  return savedEmployee;
}

/**
 * 删除企业员工（离职）
 */
export async function removeCompanyEmployee(id: string, appId: string) {
  const employee = await CompanyEmployee.findOne({ _id: id, appId, isActive: true });
  
  if (!employee) {
    throw new Error('员工不存在');
  }
  
  const companyId = employee.companyId.toString();
  
  // 软删除：更新状态而不是真的删除
  employee.status = '离职';
  employee.isActive = false;
  await employee.save();
  
  // 同时删除对应的名片
  const businessCard = await BusinessCard.findOne({ employeeId: employee._id });
  if (businessCard) {
    businessCard.isActive = false;
    await businessCard.save();
  }
  
  // 更新企业员工数量
  const company = await Company.findById(companyId);
  if (company) {
    await company.updateEmployeeCount();
  }
  
  return employee;
}

/**
 * 批量删除企业员工
 */
export async function batchRemoveCompanyEmployees(ids: string[], appId: string) {
  const employees = await CompanyEmployee.find({ _id: { $in: ids }, appId, isActive: true });
  
  if (employees.length !== ids.length) {
    throw new Error('部分员工不存在');
  }
  
  // 收集所有关联的企业ID
  const companyIds = new Set<string>();
  employees.forEach(employee => {
    companyIds.add(employee.companyId.toString());
  });
  
  await CompanyEmployee.updateMany(
    { _id: { $in: ids }, appId },
    { status: '离职', isActive: false }
  );
  
  // 更新所有关联企业的员工数量
  for (const companyId of companyIds) {
    const company = await Company.findById(companyId);
    if (company) {
      await company.updateEmployeeCount();
    }
  }
  
  return { removedCount: ids.length };
}

/**
 * 根据企业获取员工
 */
export async function getEmployeesByCompany(companyId: string, appId: string) {
  return await CompanyEmployee.findByCompany(companyId, appId);
}

/**
 * 根据部门获取员工
 */
export async function getEmployeesByDepartment(companyId: string, department: string, appId: string) {
  return await CompanyEmployee.findByDepartment(companyId, department, appId);
}

/**
 * 获取管理人员
 */
export async function getManagers(companyId: string, appId: string) {
  return await CompanyEmployee.findManagers(companyId, appId);
}

/**
 * 获取下属员工
 */
export async function getSubordinates(supervisorId: string, appId: string) {
  return await CompanyEmployee.findSubordinates(supervisorId, appId);
}

/**
 * 搜索员工
 */
export async function searchEmployees(params: {
  keyword: string;
  companyId: string;
  appId: string;
  department?: string;
  level?: string;
  status?: string;
  isManager?: boolean;
  limit?: number;
  skip?: number;
}) {
  return await CompanyEmployee.searchEmployees(params.keyword, params.companyId, params.appId, params);
}

/**
 * 获取员工统计信息
 */
export async function getEmployeeStats(companyId: string, appId: string) {
  return await CompanyEmployee.getEmployeeStats(companyId, appId);
}

/**
 * 获取部门列表
 */
export async function getDepartmentList(companyId: string, appId: string) {
  const departments = await CompanyEmployee.distinct('department', { 
    companyId, 
    appId, 
    isActive: true, 
    department: { $ne: null } 
  });
  return departments.filter(Boolean).sort();
}

/**
 * 获取职级列表
 */
export function getLevelOptions() {
  return ['实习生', '初级', '中级', '高级', '专家', '主管', '经理', '总监', '副总', '总裁'];
}

/**
 * 获取合同类型选项
 */
export function getContractTypeOptions() {
  return ['全职', '兼职', '实习', '外包', '顾问', '临时'];
}

/**
 * 获取状态选项
 */
export function getStatusOptions() {
  return ['在职', '离职', '休假', '停职', '待入职'];
}

/**
 * 更新员工状态
 */
export async function updateEmployeeStatus(id: string, status: string, appId: string) {
  const employee = await CompanyEmployee.findOne({ _id: id, appId });
  
  if (!employee) {
    throw new Error('员工不存在');
  }
  
  await employee.updateStatus(status);
  
  // 如果状态变为离职，更新企业员工数量
  if (status === '离职') {
    const company = await Company.findById(employee.companyId);
    if (company) {
      await company.updateEmployeeCount();
    }
  }
  
  return employee;
}

/**
 * 添加员工权限
 */
export async function addEmployeePermission(id: string, permission: string, appId: string) {
  const employee = await CompanyEmployee.findOne({ _id: id, appId, isActive: true });
  
  if (!employee) {
    throw new Error('员工不存在');
  }
  
  return await employee.addPermission(permission);
}

/**
 * 移除员工权限
 */
export async function removeEmployeePermission(id: string, permission: string, appId: string) {
  const employee = await CompanyEmployee.findOne({ _id: id, appId, isActive: true });
  
  if (!employee) {
    throw new Error('员工不存在');
  }
  
  return await employee.removePermission(permission);
}

/**
 * 设置上下级关系
 */
export async function setSupervisorRelation(employeeId: string, supervisorId: string, appId: string) {
  const [employee, supervisor] = await Promise.all([
    CompanyEmployee.findOne({ _id: employeeId, appId, isActive: true }),
    CompanyEmployee.findOne({ _id: supervisorId, appId, isActive: true })
  ]);
  
  if (!employee) {
    throw new Error('员工不存在');
  }
  
  if (!supervisor) {
    throw new Error('上级不存在');
  }
  
  // 检查是否在同一企业
  if (employee.companyId.toString() !== supervisor.companyId.toString()) {
    throw new Error('员工和上级必须在同一企业');
  }
  
  // 更新员工的上级
  const oldSupervisorId = employee.supervisorId?.toString();
  employee.supervisorId = new mongoose.Types.ObjectId(supervisorId);
  await employee.save();
  
  // 更新新上级的下属列表
  if (!supervisor.subordinateIds.includes(new mongoose.Types.ObjectId(employeeId))) {
    supervisor.subordinateIds.push(new mongoose.Types.ObjectId(employeeId));
    await supervisor.save();
  }
  
  // 从旧上级的下属列表中移除
  if (oldSupervisorId && oldSupervisorId !== supervisorId) {
    const oldSupervisor = await CompanyEmployee.findById(oldSupervisorId);
    if (oldSupervisor) {
      oldSupervisor.subordinateIds = oldSupervisor.subordinateIds.filter(
        id => id.toString() !== employeeId
      );
      await oldSupervisor.save();
    }
  }
  
  return employee;
}