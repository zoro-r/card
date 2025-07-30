import { Context } from 'koa';
import { WechatConfigService } from '@/service/wechatConfig';
import { success, fail } from '@/utils/tool';
import {
  WECHAT_CONFIG_KEYS,
  WECHAT_CONFIG_TEMPLATES,
  WECHAT_CONFIG_DESCRIPTIONS
} from '@/constants/wechatConfig';

export class WechatConfigController {
  // 获取微信生态完整配置
  static async getWechatConfig(ctx: Context) {
    try {
      const config = await WechatConfigService.getWechatConfig();
      console.log(1111);
      ctx.body = success(config, '获取微信配置成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '获取微信配置失败');
    }
  }

  // 保存微信生态配置
  static async saveWechatConfig(ctx: Context) {
    try {
      const { key, data, description } = ctx.request.body as any;

      if (!key || data === undefined) {
        ctx.body = fail('key 和 data 是必填字段');
        return;
      }

      // 验证是否为有效的微信配置key
      if (!Object.values(WECHAT_CONFIG_KEYS).includes(key)) {
        ctx.body = fail('无效的微信配置类型');
        return;
      }

      const config = await WechatConfigService.saveWechatConfig(key, data, description);

      ctx.body = success(config, '微信配置保存成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '保存微信配置失败');
    }
  }

  // 获取指定类型的微信配置
  static async getWechatConfigByType(ctx: Context) {
    try {
      const { type } = ctx.params;

      if (!type) {
        ctx.body = fail('配置类型参数是必需的');
        return;
      }

      // 验证配置类型
      if (!Object.values(WECHAT_CONFIG_KEYS).includes(type)) {
        ctx.body = fail('无效的微信配置类型');
        return;
      }

      const config = await WechatConfigService.getWechatConfigByType(type);

      if (!config) {
        // 如果配置不存在，返回默认配置模板
        const defaultConfig = {
          key: type,
          data: WECHAT_CONFIG_TEMPLATES[type as keyof typeof WECHAT_CONFIG_TEMPLATES],
          description: WECHAT_CONFIG_DESCRIPTIONS[type as keyof typeof WECHAT_CONFIG_DESCRIPTIONS]
        };
        ctx.body = success(defaultConfig, '返回默认配置');
        return;
      }

      ctx.body = success(config, '获取微信配置成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '获取微信配置失败');
    }
  }

  // 测试微信配置连接
  static async testWechatConnection(ctx: Context) {
    try {
      const { type, config } = ctx.request.body as any;

      if (!type || !config) {
        ctx.body = fail('配置类型和配置数据是必需的');
        return;
      }

      // 验证配置类型
      if (!Object.values(WECHAT_CONFIG_KEYS).includes(type)) {
        ctx.body = fail('无效的微信配置类型');
        return;
      }

      const result: any = await WechatConfigService.testWechatConnection(type, config);

      if (result.success) {
        ctx.body = success(result.data, result.message || '连接测试成功');
      } else {
        ctx.body = fail(result.message || '连接测试失败');
      }
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '测试连接失败');
    }
  }

  // 重置微信配置为默认值
  static async resetWechatConfig(ctx: Context) {
    try {
      const { type } = ctx.params;

      if (!type) {
        ctx.body = fail('配置类型参数是必需的');
        return;
      }

      // 验证配置类型
      if (!Object.values(WECHAT_CONFIG_KEYS).includes(type)) {
        ctx.body = fail('无效的微信配置类型');
        return;
      }

      const config = await WechatConfigService.resetWechatConfig(type);

      ctx.body = success(config, '微信配置重置成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '重置微信配置失败');
    }
  }

  // 删除微信配置
  static async deleteWechatConfig(ctx: Context) {
    try {
      const { type } = ctx.params;

      if (!type) {
        ctx.body = fail('配置类型参数是必需的');
        return;
      }

      // 验证配置类型
      if (!Object.values(WECHAT_CONFIG_KEYS).includes(type)) {
        ctx.body = fail('无效的微信配置类型');
        return;
      }

      const deleted = await WechatConfigService.deleteWechatConfig(type);

      if (!deleted) {
        ctx.body = fail('配置不存在');
        return;
      }

      ctx.body = success(null, '微信配置删除成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '删除微信配置失败');
    }
  }

  // 启用/禁用微信配置
  static async toggleWechatConfig(ctx: Context) {
    try {
      const { type } = ctx.params;
      const { enabled } = ctx.request.body as any;

      if (!type) {
        ctx.body = fail('配置类型参数是必需的');
        return;
      }

      if (typeof enabled !== 'boolean') {
        ctx.body = fail('enabled 参数必须是布尔值');
        return;
      }

      // 验证配置类型
      if (!Object.values(WECHAT_CONFIG_KEYS).includes(type)) {
        ctx.body = fail('无效的微信配置类型');
        return;
      }

      const config = await WechatConfigService.toggleWechatConfig(type, enabled);

      if (!config) {
        ctx.body = fail('配置不存在');
        return;
      }

      ctx.body = success(config, `微信配置已${enabled ? '启用' : '禁用'}`);
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '切换微信配置状态失败');
    }
  }

  // 批量获取微信配置状态
  static async getWechatConfigStatus(ctx: Context) {
    try {
      const status = await WechatConfigService.getWechatConfigStatus();
      ctx.body = success(status, '获取微信配置状态成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '获取微信配置状态失败');
    }
  }
}
