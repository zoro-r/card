import { WechatUser } from '@/models/wechatUser';
import { CompanyEmployee } from '@/models/companyEmployee';
import { BusinessCard } from '@/models/businessCard';
import { Company } from '@/models/company';

/**
 * 用户名片关联服务
 * 演示 WechatUser ↔ CompanyEmployee ↔ BusinessCard 的一对一关联查询
 */
export class UserCardService {

  /**
   * 根据微信用户unionid获取完整的用户信息（包含企业员工信息和名片信息）
   */
  static async getUserCompleteInfo(unionid: string, appId: string) {
    // 1. 查找微信用户
    const wechatUser = await WechatUser.findByUnionid(unionid, appId);
    if (!wechatUser) {
      return null;
    }

    // 2. 查找关联的企业员工
    const employee = await CompanyEmployee.findByUnionid(unionid);
    if (!employee) {
      return {
        wechatUser,
        employee: null,
        businessCard: null,
        company: null
      };
    }

    // 3. 查找员工的名片
    const businessCard = await BusinessCard.findOne({ employeeId: employee._id, isActive: true })
      .populate('employee');

    // 4. 查找企业信息
    const company = await Company.findById(employee.companyId);

    return {
      wechatUser,
      employee,
      businessCard,
      company
    };
  }

  /**
   * 绑定微信用户到企业员工
   */
  static async bindWechatUserToEmployee(unionid: string, employeeId: string, appId: string) {
    // 1. 验证微信用户存在
    const wechatUser = await WechatUser.findByUnionid(unionid, appId);
    if (!wechatUser) {
      throw new Error('微信用户不存在');
    }

    // 2. 验证企业员工存在且未绑定
    const employee = await CompanyEmployee.findById(employeeId);
    if (!employee) {
      throw new Error('企业员工不存在');
    }
    if (employee.unionid) {
      throw new Error('该员工已绑定其他微信用户');
    }

    // 3. 检查unionid是否已被其他员工绑定
    const existingEmployee = await CompanyEmployee.findByUnionid(unionid);
    if (existingEmployee) {
      throw new Error('该微信用户已绑定其他员工');
    }

    // 4. 执行绑定
    await employee.bindWechatUser(unionid);

    return {
      success: true,
      employee: await CompanyEmployee.findById(employeeId).populate('wechatUser')
    };
  }

  /**
   * 解绑微信用户与企业员工的关联
   */
  static async unbindWechatUserFromEmployee(employeeId: string) {
    const employee = await CompanyEmployee.findById(employeeId);
    if (!employee) {
      throw new Error('企业员工不存在');
    }

    if (!employee.unionid) {
      throw new Error('该员工未绑定微信用户');
    }

    await employee.unbindWechatUser();

    return {
      success: true,
      employee: await CompanyEmployee.findById(employeeId)
    };
  }

  /**
   * 根据微信用户查找其名片
   */
  static async getBusinessCardByWechatUser(unionid: string, appId: string) {
    return await BusinessCard.findByUnionid(unionid, appId);
  }

  /**
   * 获取企业内所有已绑定微信用户的员工
   */
  static async getCompanyEmployeesWithWechatUser(companyId: string, appId: string) {
    const employees = await CompanyEmployee.find({
      companyId,
      appId,
      isActive: true,
      unionid: { $exists: true, $ne: null }
    })
    .populate('wechatUser')
    .populate('businessCard')
    .populate('companyInfo');

    return employees;
  }

  /**
   * 批量绑定操作：为企业员工创建名片并绑定微信用户
   */
  static async createEmployeeWithWechatBinding(data: {
    companyId: string;
    unionid: string;
    appId: string;
    employeeInfo: {
      name: string;
      position: string;
      department?: string;
      phone?: string;
      email?: string;
    };
    cardInfo: {
      title: string;
      introduction?: string;
      specialties?: string[];
    };
  }) {
    const { companyId, unionid, appId, employeeInfo, cardInfo } = data;

    // 1. 验证微信用户存在
    const wechatUser = await WechatUser.findByUnionid(unionid, appId);
    if (!wechatUser) {
      throw new Error('微信用户不存在');
    }

    // 2. 验证企业存在
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('企业不存在');
    }

    // 3. 检查unionid是否已被绑定
    const existingEmployee = await CompanyEmployee.findByUnionid(unionid);
    if (existingEmployee) {
      throw new Error('该微信用户已绑定其他员工');
    }

    // 4. 创建企业员工
    const employee = new CompanyEmployee({
      companyId,
      appId,
      unionid,
      bindTime: new Date(),
      ...employeeInfo,
      joinDate: new Date(),
      status: '在职',
      isActive: true
    });
    await employee.save();

    // 5. 创建名片
    const businessCard = new BusinessCard({
      employeeId: employee._id,
      appId,
      companyName: company.displayName,
      name: employeeInfo.name,
      title: cardInfo.title,
      department: employeeInfo.department,
      phone: employeeInfo.phone,
      email: employeeInfo.email,
      introduction: cardInfo.introduction,
      specialties: cardInfo.specialties,
      isActive: true,
      isPublic: true
    });
    await businessCard.save();

    // 6. 更新企业员工数量
    await company.updateEmployeeCount();

    return {
      success: true,
      employee: await CompanyEmployee.findById(employee._id)
        .populate('wechatUser')
        .populate('businessCard')
        .populate('companyInfo')
    };
  }

  /**
   * 获取微信用户的完整名片展示信息
   */
  static async getCardDisplayInfo(unionid: string, appId: string) {
    const completeInfo = await this.getUserCompleteInfo(unionid, appId);

    if (!completeInfo?.businessCard) {
      return null;
    }

    const { wechatUser, employee, businessCard, company } = completeInfo;

    return {
      // 名片基本信息
      cardId: businessCard._id,
      name: businessCard.name,
      title: businessCard.title,
      avatar: businessCard.avatar || wechatUser?.avatarUrl,

      // 企业信息
      company: {
        id: company?._id,
        name: company?.displayName,
        logo: company?.logo,
        industry: company?.industry
      },

      // 联系方式
      contact: {
        phone: businessCard.phone,
        email: businessCard.email,
        wechat: businessCard.wechat,
        address: businessCard.address
      },

      // 员工信息
      employee: {
        department: employee?.department,
        level: employee?.level,
        joinDate: employee?.joinDate
      },

      // 个人信息
      personal: {
        introduction: businessCard.introduction,
        specialties: businessCard.specialties,
        services: businessCard.services
      },

      // 统计信息
      stats: {
        viewCount: businessCard.viewCount,
        shareCount: businessCard.shareCount,
        contactCount: businessCard.contactCount
      },

      // 微信用户信息（用于验证）
      wechatInfo: {
        nickName: wechatUser?.nickName,
        city: wechatUser?.city,
        province: wechatUser?.province
      }
    };
  }
}
