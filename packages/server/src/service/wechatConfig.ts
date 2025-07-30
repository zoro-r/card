import { ConfigService } from '@/service/config';
import { 
  WECHAT_CONFIG_KEYS, 
  WECHAT_CONFIG_TEMPLATES,
  WECHAT_CONFIG_DESCRIPTIONS 
} from '@/constants/wechatConfig';
import { WECHAT_CONFIG_SCHEMAS } from '@/schemas/wechatConfig';
import axios from 'axios';

export class WechatConfigService {
  // 获取微信生态完整配置
  static async getWechatConfig() {
    const configKeys = Object.values(WECHAT_CONFIG_KEYS);
    const configs = await ConfigService.getConfigsByKeys(configKeys);
    
    const result: any = {};
    
    // 手动映射key名称，确保与前端一致
    const keyMapping = {
      [WECHAT_CONFIG_KEYS.MINIPROGRAM]: 'miniProgram',
      [WECHAT_CONFIG_KEYS.OFFICIAL_ACCOUNT]: 'officialAccount', 
      [WECHAT_CONFIG_KEYS.PAYMENT]: 'payment',
      [WECHAT_CONFIG_KEYS.WORK]: 'work',
      [WECHAT_CONFIG_KEYS.COMMON]: 'common'
    };
    
    // 遍历所有微信配置类型
    for (const [configKey, frontendKey] of Object.entries(keyMapping)) {
      const config = configs.find(c => c.key === configKey);
      
      if (config) {
        result[frontendKey] = config.data;
      } else {
        // 如果配置不存在，使用默认模板
        result[frontendKey] = WECHAT_CONFIG_TEMPLATES[configKey as keyof typeof WECHAT_CONFIG_TEMPLATES];
      }
    }
    
    return result;
  }

  // 保存微信配置
  static async saveWechatConfig(key: string, data: any, description?: string) {
    // 验证配置数据
    const schema = WECHAT_CONFIG_SCHEMAS[key as keyof typeof WECHAT_CONFIG_SCHEMAS];
    if (schema) {
      const { error, value } = schema.validate(data);
      if (error) {
        throw new Error(`配置验证失败: ${error.details.map((d: any) => d.message).join(', ')}`);
      }
      data = value; // 使用验证后的数据
    }

    const finalDescription = description || WECHAT_CONFIG_DESCRIPTIONS[key as keyof typeof WECHAT_CONFIG_DESCRIPTIONS];
    
    return await ConfigService.upsertConfig(key, data, finalDescription);
  }

  // 获取指定类型的微信配置
  static async getWechatConfigByType(type: string) {
    return await ConfigService.getConfig(type);
  }

  // 测试微信配置连接
  static async testWechatConnection(type: string, config: any) {
    try {
      switch (type) {
        case WECHAT_CONFIG_KEYS.MINIPROGRAM:
          return await this.testMiniprogramConnection(config);
        case WECHAT_CONFIG_KEYS.OFFICIAL_ACCOUNT:
          return await this.testOfficialAccountConnection(config);
        case WECHAT_CONFIG_KEYS.PAYMENT:
          return await this.testPaymentConnection(config);
        case WECHAT_CONFIG_KEYS.WORK:
          return await this.testWorkConnection(config);
        default:
          return { success: false, message: '不支持的配置类型' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '连接测试失败' 
      };
    }
  }

  // 重置微信配置
  static async resetWechatConfig(type: string) {
    const defaultData = WECHAT_CONFIG_TEMPLATES[type as keyof typeof WECHAT_CONFIG_TEMPLATES];
    const description = WECHAT_CONFIG_DESCRIPTIONS[type as keyof typeof WECHAT_CONFIG_DESCRIPTIONS];
    
    return await ConfigService.upsertConfig(type, defaultData, description);
  }

  // 删除微信配置
  static async deleteWechatConfig(type: string) {
    return await ConfigService.deleteConfig(type);
  }

  // 启用/禁用微信配置
  static async toggleWechatConfig(type: string, enabled: boolean) {
    const config = await ConfigService.getConfig(type);
    if (!config) {
      return null;
    }

    const updatedData = { ...config.data, enabled };
    return await ConfigService.upsertConfig(type, updatedData, config.description);
  }

  // 获取微信配置状态
  static async getWechatConfigStatus() {
    const configKeys = Object.values(WECHAT_CONFIG_KEYS);
    const configs = await ConfigService.getConfigsByKeys(configKeys);
    
    const status: any = {};
    
    // 使用相同的key映射
    const keyMapping = {
      [WECHAT_CONFIG_KEYS.MINIPROGRAM]: 'miniProgram',
      [WECHAT_CONFIG_KEYS.OFFICIAL_ACCOUNT]: 'officialAccount', 
      [WECHAT_CONFIG_KEYS.PAYMENT]: 'payment',
      [WECHAT_CONFIG_KEYS.WORK]: 'work',
      [WECHAT_CONFIG_KEYS.COMMON]: 'common'
    };
    
    for (const [configKey, frontendKey] of Object.entries(keyMapping)) {
      const config = configs.find(c => c.key === configKey);
      
      status[frontendKey] = {
        exists: !!config,
        enabled: config?.data?.enabled || false,
        lastUpdated: config?.updatedAt || null
      };
    }
    
    return status;
  }

  // 测试小程序连接
  private static async testMiniprogramConnection(config: any) {
    const { appId, appSecret } = config;
    
    if (!appId || !appSecret) {
      return { success: false, message: 'AppID和AppSecret不能为空' };
    }

    try {
      // 获取小程序Access Token
      const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token';
      const response = await axios.get(tokenUrl, {
        params: {
          grant_type: 'client_credential',
          appid: appId,
          secret: appSecret
        },
        timeout: 10000
      });

      if (response.data.access_token) {
        return { 
          success: true, 
          message: '小程序连接测试成功',
          data: { access_token: response.data.access_token }
        };
      } else {
        return { 
          success: false, 
          message: response.data.errmsg || '获取Access Token失败' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: '网络连接失败，请检查网络或配置信息' 
      };
    }
  }

  // 测试公众号连接
  private static async testOfficialAccountConnection(config: any) {
    const { appId, appSecret } = config;
    
    if (!appId || !appSecret) {
      return { success: false, message: 'AppID和AppSecret不能为空' };
    }

    try {
      // 获取公众号Access Token
      const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token';
      const response = await axios.get(tokenUrl, {
        params: {
          grant_type: 'client_credential',
          appid: appId,
          secret: appSecret
        },
        timeout: 10000
      });

      if (response.data.access_token) {
        return { 
          success: true, 
          message: '公众号连接测试成功',
          data: { access_token: response.data.access_token }
        };
      } else {
        return { 
          success: false, 
          message: response.data.errmsg || '获取Access Token失败' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: '网络连接失败，请检查网络或配置信息' 
      };
    }
  }

  // 测试微信支付连接
  private static async testPaymentConnection(config: any) {
    const { mchId, key } = config;
    
    if (!mchId || !key) {
      return { success: false, message: '商户号和API密钥不能为空' };
    }

    // 微信支付的连接测试通常需要真实的证书文件
    // 这里只做基本的参数验证
    try {
      if (!/^\d+$/.test(mchId)) {
        return { success: false, message: '商户号格式不正确' };
      }

      if (key.length !== 32) {
        return { success: false, message: 'API密钥长度不正确' };
      }

      return { 
        success: true, 
        message: '微信支付配置验证通过（需要实际交易才能完全验证）' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: '微信支付配置验证失败' 
      };
    }
  }

  // 测试企业微信连接
  private static async testWorkConnection(config: any) {
    const { corpId, corpSecret } = config;
    
    if (!corpId || !corpSecret) {
      return { success: false, message: '企业ID和应用Secret不能为空' };
    }

    try {
      // 获取企业微信Access Token
      const tokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
      const response = await axios.get(tokenUrl, {
        params: {
          corpid: corpId,
          corpsecret: corpSecret
        },
        timeout: 10000
      });

      if (response.data.access_token) {
        return { 
          success: true, 
          message: '企业微信连接测试成功',
          data: { access_token: response.data.access_token }
        };
      } else {
        return { 
          success: false, 
          message: response.data.errmsg || '获取Access Token失败' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: '网络连接失败，请检查网络或配置信息' 
      };
    }
  }

}