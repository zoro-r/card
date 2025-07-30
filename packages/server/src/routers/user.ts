import Router from '@koa/router';
import { 
  userLogin, 
  getUserInfo, 
  getUserListAPI, 
  createUserAPI, 
  updateUserAPI, 
  deleteUserAPI, 
  batchDeleteUsersAPI,
  updateUserRolesAPI,
  resetUserPasswordAPI,
  changePasswordAPI,
  updateProfileAPI,
  firstTimeChangePasswordAPI
} from '@/controller/user';

export default function userRouter(router: Router) {
  // 用户登录
  router.post('/api/user/login', userLogin);
  
  // 获取用户信息
  router.get('/api/user/info', getUserInfo);
  
  // 用户管理接口
  router.get('/api/users', getUserListAPI);
  router.post('/api/users', createUserAPI);
  router.put('/api/users/:uuid', updateUserAPI);
  router.delete('/api/users/:uuid', deleteUserAPI);
  router.post('/api/users/batch-delete', batchDeleteUsersAPI);
  
  // 用户角色管理接口
  router.put('/api/users/:uuid/roles', updateUserRolesAPI);
  
  // 重置用户密码接口
  router.post('/api/users/:uuid/reset-password', resetUserPasswordAPI);
  
  // 用户修改自己的密码接口
  router.post('/api/user/change-password', changePasswordAPI);
  
  // 首次修改密码接口
  router.post('/api/user/first-time-change-password', firstTimeChangePasswordAPI);
  
  // 用户更新自己的个人信息接口
  router.put('/api/user/profile', updateProfileAPI);
}
