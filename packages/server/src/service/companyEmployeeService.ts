import { CompanyEmployee, ICompanyEmployee } from '@/models/companyEmployee';
import { Company } from '@/models/company';
import { BusinessCard } from '@/models/businessCard';
import { Types } from 'mongoose';
// import dayjs from 'dayjs';

/**
 * 企业员工服务类
 */
export class CompanyEmployeeService {
  /**
   * 创建员工
   */
  async createEmployee(employeeData: Partial<ICompanyEmployee>, appId: string, createdBy?: string): Promise<ICompanyEmployee> {
    // 验证企业是否存在
    const company = await Company.findOne({ 
      _id: employeeData.companyId, 
      appId, 
      isActive: true 
    });
    if (!company) {
      throw new Error('企业不存在');
    }

    // 检查手机号是否在该企业中已存在（如果提供）
    if (employeeData.phone) {
      const existingPhone = await CompanyEmployee.findOne({
        companyId: employeeData.companyId,
        phone: employeeData.phone,
        appId,
        isActive: true
      });
      if (existingPhone) {
        throw new Error('该手机号在企业中已存在');
      }
    }

    // 检查邮箱是否在该企业中已存在（如果提供）
    if (employeeData.email) {
      const existingEmail = await CompanyEmployee.findOne({
        companyId: employeeData.companyId,
        email: employeeData.email.toLowerCase(),
        appId,
        isActive: true
      });
      if (existingEmail) {
        throw new Error('该邮箱在企业中已存在');
      }
    }

    // 检查unionid是否已被绑定（如果提供）
    if (employeeData.unionid) {
      const existingUnionid = await CompanyEmployee.findOne({
        unionid: employeeData.unionid,
        isActive: true
      });
      if (existingUnionid) {
        throw new Error('该微信账号已被其他员工绑定');
      }
    }

    const employee = new CompanyEmployee({
      ...employeeData,
      appId,
      createdBy: createdBy,
      isActive: true,
      status: employeeData.status || '在职',
      permissions: employeeData.permissions || [],
      canManageEmployees: employeeData.canManageEmployees || false,
      canEditCompanyInfo: employeeData.canEditCompanyInfo || false,
      isManager: employeeData.isManager || false,
      subordinateIds: [],
      approvalStatus: '已通过',
      approvedAt: new Date(),
      bindTime: employeeData.unionid ? new Date() : undefined
    });

    const savedEmployee = await employee.save();

    // 更新企业员工数量
    await company.updateEmployeeCount();

    return savedEmployee;
  }

  /**
   * 更新员工信息
   */
  async updateEmployee(employeeId: string, updateData: Partial<ICompanyEmployee>, appId: string, modifiedBy?: string): Promise<ICompanyEmployee | null> {
    const employee = await CompanyEmployee.findOne({ 
      _id: employeeId, 
      appId, 
      isActive: true 
    });
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 如果更新手机号，检查是否在该企业中重复
    if (updateData.phone && updateData.phone !== employee.phone) {
      const existingPhone = await CompanyEmployee.findOne({
        companyId: employee.companyId,
        phone: updateData.phone,
        appId,
        _id: { $ne: employeeId },
        isActive: true
      });
      if (existingPhone) {
        throw new Error('该手机号在企业中已存在');
      }
    }

    // 如果更新邮箱，检查是否在该企业中重复
    if (updateData.email && updateData.email.toLowerCase() !== employee.email) {
      const existingEmail = await CompanyEmployee.findOne({
        companyId: employee.companyId,
        email: updateData.email.toLowerCase(),
        appId,
        _id: { $ne: employeeId },
        isActive: true
      });
      if (existingEmail) {
        throw new Error('该邮箱在企业中已存在');
      }
    }

    // 如果更新unionid，检查是否已被其他员工绑定
    if (updateData.unionid && updateData.unionid !== employee.unionid) {
      const existingUnionid = await CompanyEmployee.findOne({
        unionid: updateData.unionid,
        _id: { $ne: employeeId },
        isActive: true
      });
      if (existingUnionid) {
        throw new Error('该微信账号已被其他员工绑定');
      }
    }

    const updateFields = {
      ...updateData,
      lastModifiedBy: modifiedBy,
      updatedAt: new Date(),
      // 如果绑定了新的unionid，更新绑定时间
      ...(updateData.unionid && updateData.unionid !== employee.unionid && {
        bindTime: new Date()
      })
    };

    const updatedEmployee = await CompanyEmployee.findOneAndUpdate(
      { _id: employeeId, appId, isActive: true },
      updateFields,
      { new: true, runValidators: true }
    ).populate('companyInfo');

    // 如果员工姓名或职位发生变化，同步更新相关名片信息
    if (updatedEmployee && (updateData.name || updateData.position)) {
      await this.syncEmployeeInfoToBusinessCard(employeeId, {
        name: updateData.name || updatedEmployee.name,
        title: updateData.position || updatedEmployee.position,
        companyName: (updatedEmployee as any).companyInfo?.name
      });
    }

    return updatedEmployee;
  }

  /**
   * 删除员工（软删除）
   */
  async deleteEmployee(employeeId: string, appId: string, deletedBy?: string): Promise<boolean> {
    const employee = await CompanyEmployee.findOne({ 
      _id: employeeId, 
      appId, 
      isActive: true 
    });
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 软删除员工
    employee.isActive = false;
    employee.status = '离职';
    if (deletedBy) {
      employee.lastModifiedBy = deletedBy as any;
    }
    await employee.save();

    // 软删除相关名片
    await BusinessCard.updateMany(
      { employeeId },
      { 
        isActive: false,
        lastModifiedBy: deletedBy,
        updatedAt: new Date()
      }
    );

    // 更新企业员工数量
    const company = await Company.findById(employee.companyId);
    if (company) {
      await company.updateEmployeeCount();
    }

    // 处理上下级关系
    if (employee.supervisorId) {
      await CompanyEmployee.findByIdAndUpdate(employee.supervisorId, {
        $pull: { subordinateIds: employeeId }
      });
    }

    // 将其下属的上级设置为空
    await CompanyEmployee.updateMany(
      { supervisorId: employeeId },
      { supervisorId: null }
    );

    return true;
  }

  /**
   * 获取员工详情
   */
  async getEmployeeById(employeeId: string, appId: string): Promise<ICompanyEmployee | null> {
    return await CompanyEmployee.findOne({ 
      _id: employeeId, 
      appId, 
      isActive: true 
    })
      .populate('companyInfo')
      .populate('supervisorInfo')
      .populate('subordinateInfo')
      .populate('businessCard');
  }

  /**
   * 获取企业员工列表（分页、搜索、筛选）
   */
  async getEmployeesByCompany(params: {
    companyId: string;
    appId: string;
    page?: number;
    pageSize?: number;
    keyword?: string;
    department?: string;
    level?: string;
    status?: string;
    isManager?: boolean;
  }) {
    const {
      companyId,
      appId,
      page = 1,
      pageSize = 20,
      keyword,
      department,
      level,
      status = '在职',
      isManager
    } = params;

    const skip = (page - 1) * pageSize;
    
    // 构建查询条件
    const query: any = {
      companyId,
      appId,
      isActive: true,
      status
    };

    if (department) query.department = department;
    if (level) query.level = level;
    if (typeof isManager === 'boolean') query.isManager = isManager;
    if (keyword) {
      query.$or = [
        { name: new RegExp(keyword, 'i') },
        { position: new RegExp(keyword, 'i') },
        { department: new RegExp(keyword, 'i') },
        { phone: new RegExp(keyword, 'i') },
        { email: new RegExp(keyword, 'i') },
        { notes: new RegExp(keyword, 'i') }
      ];
    }

    // 使用统一的查询条件获取数据和总数
    const [employees, total] = await Promise.all([
      CompanyEmployee.find(query)
        .populate('businessCard')
        .sort({ joinDate: -1 })
        .limit(pageSize)
        .skip(skip),
      CompanyEmployee.countDocuments(query)
    ]);

    return {
      list: employees,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 绑定微信用户
   */
  async bindWechatUser(employeeId: string, unionid: string, appId: string): Promise<ICompanyEmployee | null> {
    // 检查unionid是否已被其他员工绑定
    const existingBind = await CompanyEmployee.findOne({
      unionid,
      _id: { $ne: employeeId },
      isActive: true
    });
    if (existingBind) {
      throw new Error('该微信账号已被其他员工绑定');
    }

    const employee = await CompanyEmployee.findOne({ 
      _id: employeeId, 
      appId, 
      isActive: true 
    });
    if (!employee) {
      throw new Error('员工不存在');
    }

    return await employee.bindWechatUser(unionid);
  }

  /**
   * 解绑微信用户
   */
  async unbindWechatUser(employeeId: string, appId: string): Promise<ICompanyEmployee | null> {
    const employee = await CompanyEmployee.findOne({ 
      _id: employeeId, 
      appId, 
      isActive: true 
    });
    if (!employee) {
      throw new Error('员工不存在');
    }

    return await employee.unbindWechatUser();
  }

  /**
   * 更新员工状态
   */
  async updateEmployeeStatus(employeeId: string, status: string, appId: string, modifiedBy?: string): Promise<ICompanyEmployee | null> {
    const employee = await CompanyEmployee.findOne({ 
      _id: employeeId, 
      appId, 
      isActive: true 
    });
    if (!employee) {
      throw new Error('员工不存在');
    }

    await employee.updateStatus(status);
    
    if (modifiedBy) {
      employee.lastModifiedBy = modifiedBy as any;
      await employee.save();
    }

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
   * 设置上下级关系
   */
  async setSupervisor(employeeId: string, supervisorId: string | null, appId: string): Promise<ICompanyEmployee | null> {
    const employee = await CompanyEmployee.findOne({ 
      _id: employeeId, 
      appId, 
      isActive: true 
    });
    if (!employee) {
      throw new Error('员工不存在');
    }

    // 如果设置新的上级
    if (supervisorId) {
      const supervisor = await CompanyEmployee.findOne({ 
        _id: supervisorId, 
        companyId: employee.companyId,
        appId, 
        isActive: true 
      });
      if (!supervisor) {
        throw new Error('上级不存在或不在同一企业');
      }

      // 检查是否会形成循环引用
      if (await this.wouldCreateCircularReference(employeeId, supervisorId)) {
        throw new Error('设置上级会形成循环引用');
      }

      // 更新新上级的下属列表
      if (!supervisor.subordinateIds.includes(employeeId as any)) {
        supervisor.subordinateIds.push(employeeId as any);
        await supervisor.save();
      }
    }

    // 如果之前有上级，从旧上级的下属列表中移除
    if (employee.supervisorId) {
      await CompanyEmployee.findByIdAndUpdate(employee.supervisorId, {
        $pull: { subordinateIds: employeeId }
      });
    }

    // 更新员工的上级
    employee.supervisorId = supervisorId as any;
    return await employee.save();
  }

  /**
   * 检查是否会形成循环引用
   */
  private async wouldCreateCircularReference(employeeId: string, supervisorId: string): Promise<boolean> {
    let currentId: string | undefined = supervisorId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      if (currentId === employeeId) {
        return true; // 找到循环
      }
      
      visited.add(currentId);
      
      const current: any = await CompanyEmployee.findById(currentId).select('supervisorId');
      currentId = current?.supervisorId?.toString() || undefined;
    }

    return false;
  }

  /**
   * 同步员工信息到名片
   */
  private async syncEmployeeInfoToBusinessCard(employeeId: string, info: {
    name: string;
    title: string;
    companyName?: string;
  }): Promise<void> {
    await BusinessCard.updateOne(
      { employeeId },
      {
        name: info.name,
        title: info.title,
        ...(info.companyName && { companyName: info.companyName }),
        updatedAt: new Date()
      }
    );
  }

  /**
   * 获取部门列表
   */
  async getDepartments(companyId: string, appId: string): Promise<string[]> {
    const departments = await CompanyEmployee.distinct('department', {
      companyId,
      appId,
      isActive: true,
      $and: [
        { department: { $ne: null } },
        { department: { $ne: '' } }
      ]
    });
    return departments.filter(Boolean);
  }

  /**
   * 获取职级列表
   */
  async getLevels(companyId: string, appId: string): Promise<string[]> {
    const levels = await CompanyEmployee.distinct('level', {
      companyId,
      appId,
      isActive: true,
      $and: [
        { level: { $ne: null } },
        { level: { $ne: '' } }
      ]
    });
    return levels.filter(Boolean);
  }
}