import Router from '@koa/router';
import { 
  getRoleListAPI, 
  getRoleByIdAPI, 
  createRoleAPI, 
  updateRoleAPI, 
  deleteRoleAPI, 
  batchDeleteRolesAPI,
  getRoleMenusAPI,
  updateRoleMenusAPI
} from '@/controller/role';

export default function roleRouter(router: Router) {
  // 角色管理接口
  router.get('/api/roles', getRoleListAPI);
  router.get('/api/roles/:uuid', getRoleByIdAPI);
  router.post('/api/roles', createRoleAPI);
  router.put('/api/roles/:uuid', updateRoleAPI);
  router.delete('/api/roles/:uuid', deleteRoleAPI);
  router.post('/api/roles/batch-delete', batchDeleteRolesAPI);
  
  // 角色菜单关系接口
  router.get('/api/roles/:uuid/menus', getRoleMenusAPI);
  router.put('/api/roles/:uuid/menus', updateRoleMenusAPI);
}