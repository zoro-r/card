import Router from '@koa/router';

import { WechatConfigController } from '@/controller/wechatConfig';

const router = new Router({ prefix: '/api/wechat' });

// 获取完整的微信生态配置
router.get('/', WechatConfigController.getWechatConfig);

// 保存微信配置（兼容前端现有接口）
router.post('/', WechatConfigController.saveWechatConfig);

// 获取指定类型的微信配置
router.get('/:type', WechatConfigController.getWechatConfigByType);

// 测试微信配置连接
router.post('/test', WechatConfigController.testWechatConnection);

// 重置微信配置为默认值
router.post('/:type/reset', WechatConfigController.resetWechatConfig);

// 删除微信配置
router.delete('/:type', WechatConfigController.deleteWechatConfig);

// 启用/禁用微信配置
router.put('/:type/toggle', WechatConfigController.toggleWechatConfig);

// 获取微信配置状态
router.get('/status/all', WechatConfigController.getWechatConfigStatus);

export default router;
