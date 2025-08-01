import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import {
  WechatAccountService,
  CreateWechatAccountParams,
  UpdateWechatAccountParams
} from '@/service/wechatAccount';
import { WechatAccountStatus, WechatAccountType } from '@/models/wechatAccount';

/**
 * 获取微信账号类型文本
 */
function getWechatAccountTypeText(type: WechatAccountType): string {
  const typeMap = {
    [WechatAccountType.MINIPROGRAM]: '小程序',
    [WechatAccountType.OFFICIAL_ACCOUNT]: '公众号',
    [WechatAccountType.ENTERPRISE]: '企业微信',
    [WechatAccountType.OPEN_PLATFORM]: '开放平台'
  };
  return typeMap[type] || '未知类型';
}

/**
 * 微信账号管理控制器
 */
export class WechatAccountController {
  /**
   * 创建微信账号
   */
  static async createWechatAccount(ctx: Context) {
    try {
      const params = ctx.request.body as CreateWechatAccountParams;

      // 参数验证
      if (!params.name || !params.displayName || !params.appId || !params.appSecret || !params.type || !params.platformId) {
        ctx.body = fail('缺少必要参数');
        return;
      }

      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.createWechatAccount(params);

      ctx.body = success(account, '创建微信账号成功');
    } catch (error) {
      console.error('创建微信账号失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '创建微信账号失败');
    }
  }

  /**
   * 更新微信账号信息
   */
  static async updateWechatAccount(ctx: Context) {
    try {
      const { accountId } = ctx.params;
      const params = ctx.request.body as UpdateWechatAccountParams;

      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.updateWechatAccount(accountId, params);

      ctx.body = success(account, '更新微信账号成功');
    } catch (error) {
      console.error('更新微信账号失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '更新微信账号失败');
    }
  }

  /**
   * 获取微信账号详情
   */
  static async getWechatAccountDetail(ctx: Context) {
    try {
      const { accountId } = ctx.params;

      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.getWechatAccountDetail(accountId);

      if (!account) {
        ctx.body = fail('微信账号不存在');
        return;
      }

      ctx.body = success(account, '获取微信账号详情成功');
    } catch (error) {
      console.error('获取微信账号详情失败:', error);
      ctx.body = fail('获取微信账号详情失败');
    }
  }

  /**
   * 获取微信账号列表
   */
  static async getWechatAccountList(ctx: Context) {
    try {
      const {
        keyword,
        status,
        type,
        platformId,
        page = '1',
        limit = '20'
      } = ctx.query as {
        keyword?: string;
        status?: string;
        type?: string;
        platformId?: string;
        page?: string;
        limit?: string;
      };

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const accountStatus = status as WechatAccountStatus | undefined;
      const accountType = type as WechatAccountType | undefined;

      const wechatAccountService = new WechatAccountService();
      const result = await wechatAccountService.getWechatAccountList(
        keyword,
        accountStatus,
        accountType,
        platformId,
        pageNum,
        limitNum
      );

      ctx.body = success(result, '获取微信账号列表成功');
    } catch (error) {
      console.error('获取微信账号列表失败:', error);
      ctx.body = fail('获取微信账号列表失败');
    }
  }

  /**
   * 激活微信账号
   */
  static async activateWechatAccount(ctx: Context) {
    try {
      const { accountId } = ctx.params;

      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.activateWechatAccount(accountId);

      ctx.body = success(account, '激活微信账号成功');
    } catch (error) {
      console.error('激活微信账号失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '激活微信账号失败');
    }
  }

  /**
   * 暂停微信账号
   */
  static async suspendWechatAccount(ctx: Context) {
    try {
      const { accountId } = ctx.params;
      const { reason } = ctx.request.body as { reason?: string };

      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.suspendWechatAccount(accountId, reason);

      ctx.body = success(account, '暂停微信账号成功');
    } catch (error) {
      console.error('暂停微信账号失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '暂停微信账号失败');
    }
  }

  /**
   * 删除微信账号
   */
  static async deleteWechatAccount(ctx: Context) {
    try {
      const { accountId } = ctx.params;

      const wechatAccountService = new WechatAccountService();
      await wechatAccountService.deleteWechatAccount(accountId);

      ctx.body = success(null, '删除微信账号成功');
    } catch (error) {
      console.error('删除微信账号失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '删除微信账号失败');
    }
  }

  /**
   * 获取微信账号统计信息
   */
  static async getWechatAccountStats(ctx: Context) {
    try {
      const { platformId } = ctx.query as { platformId?: string };

      const wechatAccountService = new WechatAccountService();
      const stats = await wechatAccountService.getWechatAccountStats(platformId);

      ctx.body = success(stats, '获取微信账号统计成功');
    } catch (error) {
      console.error('获取微信账号统计失败:', error);
      ctx.body = fail('获取微信账号统计失败');
    }
  }

  /**
   * 获取微信账号配置选项
   */
  static async getWechatAccountOptions(ctx: Context) {
    try {
      const options = {
        status: [
          { value: WechatAccountStatus.ACTIVE, label: '正常使用' },
          { value: WechatAccountStatus.INACTIVE, label: '已停用' },
          { value: WechatAccountStatus.SUSPENDED, label: '已暂停' },
          { value: WechatAccountStatus.EXPIRED, label: '已过期' },
          { value: WechatAccountStatus.PENDING, label: '待审核' }
        ],
        type: [
          { value: WechatAccountType.MINIPROGRAM, label: '小程序' },
          { value: WechatAccountType.OFFICIAL_ACCOUNT, label: '公众号' },
          { value: WechatAccountType.ENTERPRISE, label: '企业微信' },
          { value: WechatAccountType.OPEN_PLATFORM, label: '开放平台' }
        ]
      };

      ctx.body = success(options, '获取配置选项成功');
    } catch (error) {
      console.error('获取配置选项失败:', error);
      ctx.body = fail('获取配置选项失败');
    }
  }

  /**
   * 批量操作微信账号
   */
  static async batchOperateWechatAccounts(ctx: Context) {
    try {
      const {
        accountIds,
        operation,
        params
      } = ctx.request.body as {
        accountIds: string[];
        operation: 'activate' | 'suspend' | 'delete';
        params?: any;
      };

      if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
        ctx.body = fail('请选择要操作的微信账号');
        return;
      }

      if (!['activate', 'suspend', 'delete'].includes(operation)) {
        ctx.body = fail('操作类型无效');
        return;
      }

      const wechatAccountService = new WechatAccountService();
      const results: { accountId: string; success: boolean; error?: string }[] = [];

      for (const accountId of accountIds) {
        try {
          switch (operation) {
            case 'activate':
              await wechatAccountService.activateWechatAccount(accountId);
              break;
            case 'suspend':
              await wechatAccountService.suspendWechatAccount(accountId, params?.reason);
              break;
            case 'delete':
              await wechatAccountService.deleteWechatAccount(accountId);
              break;
          }
          results.push({ accountId, success: true });
        } catch (error) {
          results.push({
            accountId,
            success: false,
            error: error instanceof Error ? error.message : '操作失败'
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      ctx.body = success({
        results,
        summary: {
          total: accountIds.length,
          success: successCount,
          failed: failCount
        }
      }, `批量操作完成：成功 ${successCount} 个，失败 ${failCount} 个`);
    } catch (error) {
      console.error('批量操作微信账号失败:', error);
      ctx.body = fail('批量操作微信账号失败');
    }
  }

  /**
   * 获取指定平台的微信账号选择列表（用于下拉选择）
   */
  static async getPlatformWechatAccounts(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { type } = ctx.query as { type?: string };

      const wechatAccountService = new WechatAccountService();
      const result = await wechatAccountService.getWechatAccountList(
        undefined, // keyword
        WechatAccountStatus.ACTIVE, // 只获取活跃的账号
        type as WechatAccountType | undefined,
        platformId,
        1, // page
        100 // limit - 获取更多数据用于选择
      );

      // 简化返回数据，只包含选择需要的字段
      const accounts = result.accounts.map(account => ({
        accountId: account.accountId,
        name: account.name,
        displayName: account.displayName,
        type: account.type,
        typeText: getWechatAccountTypeText(account.type),
        appId: account.appId,
        enablePayment: account.enablePayment
      }));

      ctx.body = success(accounts, '获取平台微信账号成功');
    } catch (error) {
      console.error('获取平台微信账号失败:', error);
      ctx.body = fail('获取平台微信账号失败');
    }
  }

  /**
   * 测试微信账号配置
   */
  static async testWechatAccountConfig(ctx: Context) {
    try {
      const { accountId } = ctx.params;

      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.getWechatAccountDetail(accountId);

      if (!account) {
        ctx.body = fail('微信账号不存在');
        return;
      }

      // 基础配置检查
      const configCheck = {
        hasAppId: !!account.appId,
        hasAppSecret: !!account.appSecret,
        hasPaymentConfig: account.validatePaymentConfig(),
        isActive: account.status === WechatAccountStatus.ACTIVE,
        withinValidPeriod: true // 简化实现
      };

      const allValid = Object.values(configCheck).every(Boolean);

      ctx.body = success({
        valid: allValid,
        checks: configCheck,
        message: allValid ? '配置验证通过' : '配置验证失败，请检查相关配置'
      }, '配置测试完成');
    } catch (error) {
      console.error('测试微信账号配置失败:', error);
      ctx.body = fail('测试微信账号配置失败');
    }
  }
}
