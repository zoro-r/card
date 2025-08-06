/**
 * 公司管理模块权限配置
 * 用于菜单显示和路由权限控制
 */

export const companyPermissions = {
  // 企业管理权限
  COMPANY_READ: 'company:read',
  COMPANY_CREATE: 'company:create', 
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  COMPANY_MANAGE: 'company:manage',
  
  // 员工管理权限
  EMPLOYEE_READ: 'employee:read',
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_UPDATE: 'employee:update', 
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_MANAGE: 'employee:manage',
  
  // 统计权限
  STATS_READ: 'stats:read',
} as const;

// 企业管理路由配置
export const companyRoutes = [
  {
    path: '/company',
    name: '企业管理',
    icon: 'BuildOutlined',
    access: 'canManageCompany',
    routes: [
      {
        path: '/company',
        redirect: '/company/list',
      },
      {
        path: '/company/list',
        name: '企业列表',
        component: './Company',
        access: 'canRead("company")',
      },
      {
        path: '/company/:id',
        name: '企业详情',
        component: './Company/Detail',
        access: 'canRead("company")',
        hideInMenu: true,
      },
    ],
  },
];

// 权限说明文档
export const permissionDoc = {
  'company:read': '查看企业信息',
  'company:create': '创建企业',
  'company:update': '编辑企业信息',
  'company:delete': '删除企业',
  'company:manage': '企业管理（包含所有企业操作权限）',
  'employee:read': '查看员工信息',
  'employee:create': '创建员工',
  'employee:update': '编辑员工信息',
  'employee:delete': '删除员工',
  'employee:manage': '员工管理（包含所有员工操作权限）',
  'stats:read': '查看统计信息',
};