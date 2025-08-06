import Router from '@koa/router';
import { CompanyController } from '@/controller/companyController';
import { CompanyEmployeeController } from '@/controller/companyEmployeeController';
import { requirePermission } from '@/middleware/permission';

const companyController = new CompanyController();
const employeeController = new CompanyEmployeeController();

export default function companyRouter(router: Router) {
  // 企业管理路由
  // 获取企业列表（需要查看权限）
  router.get('/api/companies', requirePermission('company:read'), companyController.getList);

  // 创建企业（需要创建权限）
  router.post('/api/companies', requirePermission('company:create'), companyController.create);

  // 获取企业详情（需要查看权限）
  router.get('/api/companies/:id', requirePermission('company:read'), companyController.getDetail);

  // 更新企业信息（需要编辑权限）
  router.put('/api/companies/:id', requirePermission('company:update'), companyController.update);

  // 删除企业（需要删除权限）
  router.delete('/api/companies/:id', requirePermission('company:delete'), companyController.delete);

  // 获取企业统计信息（需要查看权限）
  router.get('/api/companies/:id/stats', requirePermission('company:read'), companyController.getStats);

  // 获取行业列表（公开接口）
  router.get('/api/companies/options/industries', companyController.getIndustries);

  // 获取企业规模选项（公开接口）
  router.get('/api/companies/options/scales', companyController.getScales);

  // 企业员工管理路由
  // 获取企业员工列表（需要查看权限）
  router.get('/api/companies/:companyId/employees', requirePermission('employee:read'), employeeController.getListByCompany);

  // 创建员工（需要创建权限）
  router.post('/api/companies/:companyId/employees', requirePermission('employee:create'), employeeController.create);

  // 获取员工详情（需要查看权限）
  router.get('/api/employees/:id', requirePermission('employee:read'), employeeController.getDetail);

  // 更新员工信息（需要编辑权限）
  router.put('/api/employees/:id', requirePermission('employee:update'), employeeController.update);

  // 删除员工（需要删除权限）
  router.delete('/api/employees/:id', requirePermission('employee:delete'), employeeController.delete);

  // 更新员工状态（需要编辑权限）
  router.patch('/api/employees/:id/status', requirePermission('employee:update'), employeeController.updateStatus);

  // 绑定微信用户（需要编辑权限）
  router.post('/api/employees/:id/bind-wechat', requirePermission('employee:update'), employeeController.bindWechat);

  // 解绑微信用户（需要编辑权限）
  router.delete('/api/employees/:id/bind-wechat', requirePermission('employee:update'), employeeController.unbindWechat);

  // 设置上下级关系（需要编辑权限）
  router.put('/api/employees/:id/supervisor', requirePermission('employee:update'), employeeController.setSupervisor);

  // 获取部门列表
  router.get('/api/companies/:companyId/departments', requirePermission('employee:read'), employeeController.getDepartments);

  // 获取职级列表
  router.get('/api/companies/:companyId/levels', requirePermission('employee:read'), employeeController.getLevels);

  // 获取员工状态选项（公开接口）
  router.get('/api/employees/options/status', employeeController.getStatusOptions);

  // 获取职级选项（公开接口）
  router.get('/api/employees/options/levels', employeeController.getLevelOptions);

  // 获取合同类型选项（公开接口）
  router.get('/api/employees/options/contract-types', employeeController.getContractTypeOptions);
}