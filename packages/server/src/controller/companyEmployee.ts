import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import {
  getCompanyEmployeeList,
  getCompanyEmployeeById,
  addCompanyEmployee,
  updateCompanyEmployee,
  removeCompanyEmployee,
  batchRemoveCompanyEmployees,
  getEmployeesByCompany,
  getEmployeesByDepartment,
  getManagers,
  getSubordinates,
  searchEmployees,
  getEmployeeStats,
  getDepartmentList,
  getLevelOptions,
  getContractTypeOptions,
  getStatusOptions,
  updateEmployeeStatus,
  addEmployeePermission,
  removeEmployeePermission,
  setSupervisorRelation
} from '@/service/companyEmployee';

/**
 * 获取企业员工列表
 */
export async function getCompanyEmployees(ctx: Context) {
  try {
    const { companyId, appId, page, limit, keyword, department, level, status, isManager } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getCompanyEmployeeList({
      companyId: companyId as string,
      appId: appId as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      keyword: keyword as string,
      department: department as string,
      level: level as string,
      status: status as string,
      isManager: isManager ? isManager === 'true' : undefined
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取员工详情
 */
export async function getCompanyEmployeeDetail(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await getCompanyEmployeeById(id, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 添加企业员工
 */
export async function addCompanyEmployeeController(ctx: Context) {
  try {
    const data = ctx.request.body as any;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    const result = await addCompanyEmployee(data, userId);
    ctx.body = success(result, '员工添加成功');
  } catch (err: any) {
    // 处理MongoDB重复键错误
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.phone) {
        ctx.body = fail('该手机号已在企业中使用');
        return;
      }
      if (err.keyPattern && err.keyPattern.email) {
        ctx.body = fail('该邮箱已在企业中使用');
        return;
      }
    }
    ctx.body = fail(err.message);
  }
}

/**
 * 更新企业员工
 */
export async function updateCompanyEmployeeController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const data = ctx.request.body as any;
    const userId = (ctx.state.user as any)?.id || 'system';
    
    const result = await updateCompanyEmployee(id, data, userId);
    ctx.body = success(result, '员工更新成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 删除企业员工（离职）
 */
export async function removeCompanyEmployeeController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { appId } = ctx.query;
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    await removeCompanyEmployee(id, appId as string);
    ctx.body = success(null, '员工离职成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 批量删除企业员工
 */
export async function batchRemoveCompanyEmployeesController(ctx: Context) {
  try {
    const { ids, appId } = ctx.request.body as any;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      ctx.body = fail('请选择要删除的员工');
      return;
    }
    
    if (!appId) {
      ctx.body = fail('平台ID不能为空');
      return;
    }

    const result = await batchRemoveCompanyEmployees(ids, appId);
    ctx.body = success(result, `成功删除 ${result.removedCount} 个员工`);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 根据企业获取员工
 */
export async function getEmployeesByCompanyController(ctx: Context) {
  try {
    const { companyId, appId } = ctx.query;
    
    if (!companyId || !appId) {
      ctx.body = fail('企业ID和平台ID不能为空');
      return;
    }

    const result = await getEmployeesByCompany(companyId as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 根据部门获取员工
 */
export async function getEmployeesByDepartmentController(ctx: Context) {
  try {
    const { companyId, department, appId } = ctx.query;
    
    if (!companyId || !department || !appId) {
      ctx.body = fail('企业ID、部门和平台ID不能为空');
      return;
    }

    const result = await getEmployeesByDepartment(companyId as string, department as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取管理人员
 */
export async function getManagersController(ctx: Context) {
  try {
    const { companyId, appId } = ctx.query;
    
    if (!companyId || !appId) {
      ctx.body = fail('企业ID和平台ID不能为空');
      return;
    }

    const result = await getManagers(companyId as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取下属员工
 */
export async function getSubordinatesController(ctx: Context) {
  try {
    const { supervisorId, appId } = ctx.query;
    
    if (!supervisorId || !appId) {
      ctx.body = fail('上级ID和平台ID不能为空');
      return;
    }

    const result = await getSubordinates(supervisorId as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 搜索员工
 */
export async function searchEmployeesController(ctx: Context) {
  try {
    const { keyword, companyId, appId, department, level, status, isManager, limit, skip } = ctx.query;
    
    if (!keyword || !companyId || !appId) {
      ctx.body = fail('搜索关键词、企业ID和平台ID不能为空');
      return;
    }

    const result = await searchEmployees({
      keyword: keyword as string,
      companyId: companyId as string,
      appId: appId as string,
      department: department as string,
      level: level as string,
      status: status as string,
      isManager: isManager ? isManager === 'true' : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined
    });

    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取员工统计信息
 */
export async function getEmployeeStatsController(ctx: Context) {
  try {
    const { companyId, appId } = ctx.query;
    
    if (!companyId || !appId) {
      ctx.body = fail('企业ID和平台ID不能为空');
      return;
    }

    const result = await getEmployeeStats(companyId as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取部门列表
 */
export async function getDepartments(ctx: Context) {
  try {
    const { companyId, appId } = ctx.query;
    
    if (!companyId || !appId) {
      ctx.body = fail('企业ID和平台ID不能为空');
      return;
    }

    const result = await getDepartmentList(companyId as string, appId as string);
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取职级选项
 */
export async function getLevels(ctx: Context) {
  try {
    const result = getLevelOptions();
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取合同类型选项
 */
export async function getContractTypes(ctx: Context) {
  try {
    const result = getContractTypeOptions();
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 获取状态选项
 */
export async function getStatuses(ctx: Context) {
  try {
    const result = getStatusOptions();
    ctx.body = success(result);
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 更新员工状态
 */
export async function updateEmployeeStatusController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { status, appId } = ctx.request.body as any;
    
    if (!status || !appId) {
      ctx.body = fail('状态和平台ID不能为空');
      return;
    }

    const result = await updateEmployeeStatus(id, status, appId);
    ctx.body = success(result, '状态更新成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 添加员工权限
 */
export async function addEmployeePermissionController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { permission, appId } = ctx.request.body as any;
    
    if (!permission || !appId) {
      ctx.body = fail('权限和平台ID不能为空');
      return;
    }

    const result = await addEmployeePermission(id, permission, appId);
    ctx.body = success(result, '权限添加成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 移除员工权限
 */
export async function removeEmployeePermissionController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { permission, appId } = ctx.request.body as any;
    
    if (!permission || !appId) {
      ctx.body = fail('权限和平台ID不能为空');
      return;
    }

    const result = await removeEmployeePermission(id, permission, appId);
    ctx.body = success(result, '权限移除成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}

/**
 * 设置上下级关系
 */
export async function setSupervisorRelationController(ctx: Context) {
  try {
    const { id } = ctx.params;
    const { supervisorId, appId } = ctx.request.body as any;
    
    if (!supervisorId || !appId) {
      ctx.body = fail('上级ID和平台ID不能为空');
      return;
    }

    const result = await setSupervisorRelation(id, supervisorId, appId);
    ctx.body = success(result, '上下级关系设置成功');
  } catch (err: any) {
    ctx.body = fail(err.message);
  }
}