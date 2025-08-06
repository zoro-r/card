import { Context } from 'koa';
import { CompanyEmployeeService } from '@/service/companyEmployeeService';
import { success, error } from '../utils/tool';
import { ICompanyEmployee } from '@/models/companyEmployee';

/**
 * 企业员工控制器
 */
export class CompanyEmployeeController {
  private employeeService: CompanyEmployeeService;

  constructor() {
    this.employeeService = new CompanyEmployeeService();
  }

  /**
   * 创建员工
   */
  create = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const userId = ctx.state.user?.id;
      const employeeData = ctx.request.body as Partial<ICompanyEmployee>;

      // 验证必填字段
      if (!employeeData.companyId) {
        return ctx.body = error('企业ID不能为空');
      }
      if (!employeeData.name) {
        return ctx.body = error('员工姓名不能为空');
      }
      if (!employeeData.position) {
        return ctx.body = error('职位不能为空');
      }
      if (!employeeData.joinDate) {
        return ctx.body = error('入职日期不能为空');
      }

      const employee = await this.employeeService.createEmployee(employeeData, appId, userId);
      
      ctx.body = success(employee, '员工创建成功');
    } catch (err: any) {
      ctx.body = error(err.message || '创建员工失败');
    }
  };

  /**
   * 更新员工信息
   */
  update = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const userId = ctx.state.user?.id;
      const employeeId = ctx.params.id;
      const updateData = ctx.request.body as Partial<ICompanyEmployee>;

      const employee = await this.employeeService.updateEmployee(employeeId, updateData, appId, userId);
      
      if (!employee) {
        return ctx.body = error('员工不存在');
      }

      ctx.body = success(employee, '员工信息更新成功');
    } catch (err: any) {
      ctx.body = error(err.message || '更新员工信息失败');
    }
  };

  /**
   * 删除员工
   */
  delete = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const userId = ctx.state.user?.id;
      const employeeId = ctx.params.id;

      const result = await this.employeeService.deleteEmployee(employeeId, appId, userId);
      
      if (!result) {
        return ctx.body = error('删除员工失败');
      }

      ctx.body = success(null, '员工删除成功');
    } catch (err: any) {
      ctx.body = error(err.message || '删除员工失败');
    }
  };

  /**
   * 获取员工详情
   */
  getDetail = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const employeeId = ctx.params.id;

      const employee = await this.employeeService.getEmployeeById(employeeId, appId);
      
      if (!employee) {
        return ctx.body = error('员工不存在');
      }

      ctx.body = success(employee);
    } catch (err: any) {
      ctx.body = error(err.message || '获取员工详情失败');
    }
  };

  /**
   * 获取企业员工列表
   */
  getListByCompany = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const companyId = ctx.params.companyId;
      const {
        page = 1,
        pageSize = 20,
        keyword,
        name,  // ProTable 使用 name 参数进行姓名搜索
        department,
        level,
        status = '在职',
        isManager
      } = ctx.query;

      const params = {
        companyId,
        appId,
        page: Number(page),
        pageSize: Number(pageSize),
        keyword: (keyword || name) as string,  // 支持 keyword 和 name 参数
        department: department as string,
        level: level as string,
        status: status as string,
        isManager: isManager === 'true' ? true : isManager === 'false' ? false : undefined
      };

      const result = await this.employeeService.getEmployeesByCompany(params);
      
      ctx.body = success(result);
    } catch (err: any) {
      ctx.body = error(err.message || '获取员工列表失败');
    }
  };

  /**
   * 绑定微信用户
   */
  bindWechat = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const employeeId = ctx.params.id;
      const { unionid } = ctx.request.body as { unionid: string };

      if (!unionid) {
        return ctx.body = error('微信unionid不能为空');
      }

      const employee = await this.employeeService.bindWechatUser(employeeId, unionid, appId);
      
      if (!employee) {
        return ctx.body = error('绑定失败');
      }

      ctx.body = success(employee, '微信绑定成功');
    } catch (err: any) {
      ctx.body = error(err.message || '微信绑定失败');
    }
  };

  /**
   * 解绑微信用户
   */
  unbindWechat = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const employeeId = ctx.params.id;

      const employee = await this.employeeService.unbindWechatUser(employeeId, appId);
      
      if (!employee) {
        return ctx.body = error('解绑失败');
      }

      ctx.body = success(employee, '微信解绑成功');
    } catch (err: any) {
      ctx.body = error(err.message || '微信解绑失败');
    }
  };

  /**
   * 更新员工状态
   */
  updateStatus = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const userId = ctx.state.user?.id;
      const employeeId = ctx.params.id;
      const { status } = ctx.request.body as { status: string };

      if (!status) {
        return ctx.body = error('状态不能为空');
      }

      const employee = await this.employeeService.updateEmployeeStatus(employeeId, status, appId, userId);
      
      if (!employee) {
        return ctx.body = error('更新状态失败');
      }

      ctx.body = success(employee, '员工状态更新成功');
    } catch (err: any) {
      ctx.body = error(err.message || '更新员工状态失败');
    }
  };

  /**
   * 设置上下级关系
   */
  setSupervisor = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const employeeId = ctx.params.id;
      const { supervisorId } = ctx.request.body as { supervisorId: string | null };

      const employee = await this.employeeService.setSupervisor(employeeId, supervisorId, appId);
      
      if (!employee) {
        return ctx.body = error('设置上级失败');
      }

      ctx.body = success(employee, '上下级关系设置成功');
    } catch (err: any) {
      ctx.body = error(err.message || '设置上下级关系失败');
    }
  };

  /**
   * 获取部门列表
   */
  getDepartments = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const companyId = ctx.params.companyId;

      const departments = await this.employeeService.getDepartments(companyId, appId);
      
      ctx.body = success(departments);
    } catch (err: any) {
      ctx.body = error(err.message || '获取部门列表失败');
    }
  };

  /**
   * 获取职级列表
   */
  getLevels = async (ctx: Context) => {
    try {
      const appId = ctx.state.platformId || ctx.headers['x-app-id'] as string || 'default-app-id';
      const companyId = ctx.params.companyId;

      const levels = await this.employeeService.getLevels(companyId, appId);
      
      ctx.body = success(levels);
    } catch (err: any) {
      ctx.body = error(err.message || '获取职级列表失败');
    }
  };

  /**
   * 获取员工状态选项
   */
  getStatusOptions = async (ctx: Context) => {
    try {
      const statusOptions = [
        { value: '在职', label: '在职' },
        { value: '离职', label: '离职' },
        { value: '休假', label: '休假' },
        { value: '停职', label: '停职' },
        { value: '待入职', label: '待入职' }
      ];
      
      ctx.body = success(statusOptions);
    } catch (err: any) {
      ctx.body = error(err.message || '获取状态选项失败');
    }
  };

  /**
   * 获取职级选项
   */
  getLevelOptions = async (ctx: Context) => {
    try {
      const levelOptions = [
        { value: '实习生', label: '实习生' },
        { value: '初级', label: '初级' },
        { value: '中级', label: '中级' },
        { value: '高级', label: '高级' },
        { value: '专家', label: '专家' },
        { value: '主管', label: '主管' },
        { value: '经理', label: '经理' },
        { value: '总监', label: '总监' },
        { value: '副总', label: '副总' },
        { value: '总裁', label: '总裁' }
      ];
      
      ctx.body = success(levelOptions);
    } catch (err: any) {
      ctx.body = error(err.message || '获取职级选项失败');
    }
  };

  /**
   * 获取合同类型选项
   */
  getContractTypeOptions = async (ctx: Context) => {
    try {
      const contractTypeOptions = [
        { value: '全职', label: '全职' },
        { value: '兼职', label: '兼职' },
        { value: '实习', label: '实习' },
        { value: '外包', label: '外包' },
        { value: '顾问', label: '顾问' },
        { value: '临时', label: '临时' }
      ];
      
      ctx.body = success(contractTypeOptions);
    } catch (err: any) {
      ctx.body = error(err.message || '获取合同类型选项失败');
    }
  };
}