import { Company, ICompany } from '@/models/company';
import { CompanyEmployee, ICompanyEmployee } from '@/models/companyEmployee';
import { BusinessCard } from '@/models/businessCard';
import { Types } from 'mongoose';
// import dayjs from 'dayjs';

/**
 * 企业服务类
 */
export class CompanyService {
  /**
   * 创建企业
   */
  async createCompany(companyData: Partial<ICompany>, appId: string, createdBy?: string): Promise<ICompany> {
    // 检查企业名称是否已存在
    const existingCompany = await Company.findByName(companyData.name!, appId);
    if (existingCompany) {
      throw new Error(`企业名称"${companyData.name}"已存在`);
    }

    // 检查统一社会信用代码是否已存在（如果提供）
    if (companyData.creditCode) {
      const existingCreditCode = await Company.findByCreditCode(companyData.creditCode, appId);
      if (existingCreditCode) {
        throw new Error(`统一社会信用代码"${companyData.creditCode}"已存在`);
      }
    }

    const company = new Company({
      ...companyData,
      appId,
      createdBy: createdBy,
      displayName: companyData.displayName || companyData.name,
      isActive: true,
      isPublic: companyData.isPublic ?? true,
      isVerified: false,
      employeeCount: 0,
      viewCount: 0,
      settings: {
        allowPublicSearch: true,
        allowEmployeeJoin: false,
        requireApproval: true,
        ...companyData.settings
      }
    });

    return await company.save();
  }

  /**
   * 更新企业信息
   */
  async updateCompany(companyId: string, updateData: Partial<ICompany>, appId: string, modifiedBy?: string): Promise<ICompany | null> {
    // 如果更新企业名称，检查是否重复
    if (updateData.name) {
      const existingCompany = await Company.findOne({
        name: updateData.name,
        appId,
        _id: { $ne: companyId },
        isActive: true
      });
      if (existingCompany) {
        throw new Error(`企业名称"${updateData.name}"已存在`);
      }
    }

    // 如果更新统一社会信用代码，检查是否重复
    if (updateData.creditCode) {
      const existingCreditCode = await Company.findOne({
        creditCode: updateData.creditCode,
        appId,
        _id: { $ne: companyId },
        isActive: true
      });
      if (existingCreditCode) {
        throw new Error(`统一社会信用代码"${updateData.creditCode}"已存在`);
      }
    }

    const updateFields = {
      ...updateData,
      lastModifiedBy: modifiedBy,
      updatedAt: new Date()
    };

    const company = await Company.findOneAndUpdate(
      { _id: companyId, appId, isActive: true },
      updateFields,
      { new: true, runValidators: true }
    );

    // 如果企业名称发生变化，同步更新相关员工和名片的冗余企业名称字段
    if (updateData.name && company) {
      await this.syncCompanyNameToRelatedData(companyId, updateData.name, appId);
    }

    return company;
  }

  /**
   * 删除企业（软删除）
   */
  async deleteCompany(companyId: string, appId: string, deletedBy?: string): Promise<boolean> {
    const company = await Company.findOne({ _id: companyId, appId, isActive: true });
    if (!company) {
      throw new Error('企业不存在');
    }

    // 检查是否还有在职员工
    const activeEmployees = await CompanyEmployee.countDocuments({
      companyId,
      appId,
      isActive: true,
      status: '在职'
    });

    if (activeEmployees > 0) {
      throw new Error('企业还有在职员工，无法删除');
    }

    // 软删除企业
    company.isActive = false;
    company.lastModifiedBy = deletedBy;
    await company.save();

    // 同时软删除相关员工和名片
    await CompanyEmployee.updateMany(
      { companyId, appId },
      { 
        isActive: false,
        lastModifiedBy: deletedBy,
        updatedAt: new Date()
      }
    );

    // 通过员工关联删除相关名片
    const employees = await CompanyEmployee.find({ companyId, appId }).select('_id');
    const employeeIds = employees.map(emp => emp._id);
    
    await BusinessCard.updateMany(
      { employeeId: { $in: employeeIds } },
      { 
        isActive: false,
        lastModifiedBy: deletedBy,
        updatedAt: new Date()
      }
    );

    return true;
  }

  /**
   * 获取企业详情
   */
  async getCompanyById(companyId: string, appId: string): Promise<ICompany | null> {
    const company = await Company.findOne({ _id: companyId, appId, isActive: true });
    if (company) {
      // 更新浏览次数
      await company.updateViewCount();
    }
    return company;
  }

  /**
   * 获取企业列表（分页、搜索、筛选）
   */
  async getCompanies(params: {
    appId: string;
    page?: number;
    pageSize?: number;
    keyword?: string;
    industry?: string;
    scale?: string;
    isVerified?: boolean;
    isPublic?: boolean;
  }) {
    const {
      appId,
      page = 1,
      pageSize = 20,
      keyword,
      industry,
      scale,
      isVerified,
      isPublic = true
    } = params;

    const skip = (page - 1) * pageSize;
    
    const companies = await Company.searchCompanies(keyword || '', appId, {
      industry,
      scale,
      isVerified,
      isPublic,
      limit: pageSize,
      skip
    });

    const total = await Company.countDocuments({
      appId,
      isActive: true,
      isPublic,
      ...(industry && { industry }),
      ...(scale && { scale }),
      ...(typeof isVerified === 'boolean' && { isVerified }),
      ...(keyword && {
        $or: [
          { name: new RegExp(keyword, 'i') },
          { displayName: new RegExp(keyword, 'i') },
          { englishName: new RegExp(keyword, 'i') },
          { description: new RegExp(keyword, 'i') }
        ]
      })
    });

    return {
      list: companies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 同步企业名称到相关数据
   */
  private async syncCompanyNameToRelatedData(companyId: string, newCompanyName: string, appId: string): Promise<void> {
    // 获取该企业的所有员工
    const employees = await CompanyEmployee.find({ companyId, appId }).select('_id');
    const employeeIds = employees.map(emp => emp._id);

    // 更新名片中的冗余企业名称字段
    await BusinessCard.updateMany(
      { employeeId: { $in: employeeIds } },
      { 
        companyName: newCompanyName,
        updatedAt: new Date()
      }
    );
  }

  /**
   * 获取企业统计信息
   */
  async getCompanyStats(companyId: string, appId: string) {
    const [company, employeeStats] = await Promise.all([
      Company.findOne({ _id: companyId, appId, isActive: true }),
      CompanyEmployee.getEmployeeStats(companyId, appId)
    ]);

    if (!company) {
      throw new Error('企业不存在');
    }

    // 获取名片统计
    const employees = await CompanyEmployee.find({ companyId, appId, isActive: true }).select('_id');
    const employeeIds = employees.map(emp => emp._id);
    
    const businessCardCount = await BusinessCard.countDocuments({
      employeeId: { $in: employeeIds },
      isActive: true
    });

    return {
      company,
      employeeStats,
      businessCardCount,
      lastUpdate: new Date().toISOString()
    };
  }
}