import { Context, Next } from 'koa';
import { ConfigService } from '@/service/config';
import { success, fail } from '@/utils/tool';

export class ConfigController {
  // 创建或更新配置
  static async upsertConfig(ctx: Context, next: Next) {
    try {
      const { key, data, description } = ctx.request.body as any;
      
      if (!key || data === undefined) {
        ctx.body = fail('key 和 data 是必填字段');
        return;
      }

      const config = await ConfigService.upsertConfig(key, data, description);
      
      ctx.body = success(config, '配置保存成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '保存配置失败');
    }
  }

  // 获取单个配置
  static async getConfig(ctx: Context, next: Next) {
    try {
      const { key } = ctx.params;
      
      if (!key) {
        ctx.body = fail('key 参数是必需的');
        return;
      }

      const config = await ConfigService.getConfig(key);
      
      if (!config) {
        ctx.body = fail('配置不存在');
        return;
      }

      ctx.body = success(config);
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '获取配置失败');
    }
  }

  // 获取配置数据（仅返回data字段，供其他平台调用）
  static async getConfigData(ctx: Context, next: Next) {
    try {
      const { key } = ctx.params;
      
      if (!key) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'key 参数是必需的'
        };
        return;
      }

      const config = await ConfigService.getConfig(key);
      
      if (!config) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '配置不存在'
        };
        return;
      }

      // 直接返回配置数据
      ctx.body = config.data;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 获取所有配置（支持分页和搜索）
  static async getAllConfigs(ctx: Context, next: Next) {
    try {
      const { page, pageSize, key, description } = ctx.request.query as any;
      
      const result = await ConfigService.getConfigsList({
        page: page ? parseInt(page) : 1,
        pageSize: pageSize ? parseInt(pageSize) : 10,
        key,
        description
      });
      
      ctx.body = success({
        list: result.list,
        total: result.total
      });
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '获取配置列表失败');
    }
  }

  // 删除配置
  static async deleteConfig(ctx: Context, next: Next) {
    try {
      const { key } = ctx.params;
      
      if (!key) {
        ctx.body = fail('key 参数是必需的');
        return;
      }

      const deleted = await ConfigService.deleteConfig(key);
      
      if (!deleted) {
        ctx.body = fail('配置不存在');
        return;
      }

      ctx.body = success(null, '配置删除成功');
    } catch (error) {
      ctx.body = fail(error instanceof Error ? error.message : '删除配置失败');
    }
  }
}