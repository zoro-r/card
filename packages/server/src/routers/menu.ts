import Router from '@koa/router';
import { 
  getMenuListAPI, 
  getMenuTreeAPI,
  getMenuByIdAPI, 
  createMenuAPI, 
  updateMenuAPI, 
  deleteMenuAPI, 
  batchDeleteMenusAPI 
} from '@/controller/menu';

export default function menuRouter(router: Router) {
  // 菜单管理接口
  router.get('/api/menus', getMenuListAPI);
  router.get('/api/menus/tree', getMenuTreeAPI);
  router.get('/api/menus/:uuid', getMenuByIdAPI);
  router.post('/api/menus', createMenuAPI);
  router.put('/api/menus/:uuid', updateMenuAPI);
  router.delete('/api/menus/:uuid', deleteMenuAPI);
  router.post('/api/menus/batch-delete', batchDeleteMenusAPI);
}