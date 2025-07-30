import Joi from 'joi';
import { WECHAT_CONFIG_KEYS } from '@/constants/wechatConfig';

// 微信小程序配置验证模式
export const miniprogramConfigSchema = Joi.object({
  appId: Joi.string()
    .pattern(/^wx[a-f0-9]{16}$/)
    .required()
    .messages({
      'string.pattern.base': '小程序AppID格式不正确，应为wx开头的18位字符',
      'any.required': '小程序AppID不能为空'
    }),
  appSecret: Joi.string()
    .length(32)
    .required()
    .messages({
      'string.length': '小程序AppSecret必须是32位字符',
      'any.required': '小程序AppSecret不能为空'
    }),
  originalId: Joi.string().allow(''),
  enabled: Joi.boolean().default(false),
  serverDomain: Joi.string().uri().allow(''),
  businessDomain: Joi.string().uri().allow(''),
  downloadFile: Joi.boolean().default(true),
  uploadFile: Joi.boolean().default(true)
});

// 微信公众号配置验证模式
export const officialAccountConfigSchema = Joi.object({
  appId: Joi.string()
    .pattern(/^wx[a-f0-9]{16}$/)
    .required()
    .messages({
      'string.pattern.base': '公众号AppID格式不正确，应为wx开头的18位字符',
      'any.required': '公众号AppID不能为空'
    }),
  appSecret: Joi.string()
    .length(32)
    .required()
    .messages({
      'string.length': '公众号AppSecret必须是32位字符',
      'any.required': '公众号AppSecret不能为空'
    }),
  token: Joi.string()
    .min(3)
    .max(32)
    .required()
    .messages({
      'string.min': 'Token长度不能少于3位',
      'string.max': 'Token长度不能超过32位',
      'any.required': 'Token不能为空'
    }),
  encodingAESKey: Joi.string()
    .length(43)
    .allow('')
    .messages({
      'string.length': 'EncodingAESKey必须是43位字符'
    }),
  enabled: Joi.boolean().default(false),
  messageEncrypt: Joi.boolean().default(false),
  autoReply: Joi.object({
    enabled: Joi.boolean().default(false),
    defaultMessage: Joi.string().default('感谢您的关注！')
  }).default()
});

// 微信支付配置验证模式
export const paymentConfigSchema = Joi.object({
  mchId: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': '商户号必须是纯数字',
      'any.required': '商户号不能为空'
    }),
  key: Joi.string()
    .length(32)
    .required()
    .messages({
      'string.length': 'API密钥必须是32位字符',
      'any.required': 'API密钥不能为空'
    }),
  certPath: Joi.string().allow(''),
  keyPath: Joi.string().allow(''),
  enabled: Joi.boolean().default(false),
  notifyUrl: Joi.string().uri().allow(''),
  refundNotifyUrl: Joi.string().uri().allow(''),
  sandboxMode: Joi.boolean().default(false)
});

// 企业微信配置验证模式
export const workConfigSchema = Joi.object({
  corpId: Joi.string()
    .required()
    .messages({
      'any.required': '企业ID不能为空'
    }),
  corpSecret: Joi.string()
    .required()
    .messages({
      'any.required': '应用Secret不能为空'
    }),
  agentId: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': '应用ID必须是纯数字',
      'any.required': '应用ID不能为空'
    }),
  enabled: Joi.boolean().default(false),
  chatSecret: Joi.string().allow(''),
  contactSecret: Joi.string().allow(''),
  approvalSecret: Joi.string().allow('')
});

// 通用配置验证模式
export const commonConfigSchema = Joi.object({
  timezone: Joi.string()
    .valid('Asia/Shanghai', 'UTC', 'America/New_York', 'Europe/London')
    .default('Asia/Shanghai'),
  language: Joi.string()
    .valid('zh-CN', 'zh-TW', 'en-US')
    .default('zh-CN'),
  logLevel: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  cacheExpire: Joi.number()
    .integer()
    .min(60)
    .max(86400)
    .default(3600),
  rateLimitEnabled: Joi.boolean().default(true),
  maxApiCallsPerMinute: Joi.number()
    .integer()
    .min(100)
    .max(10000)
    .default(1000)
});

// 微信配置类型与验证模式映射
export const WECHAT_CONFIG_SCHEMAS = {
  [WECHAT_CONFIG_KEYS.MINIPROGRAM]: miniprogramConfigSchema,
  [WECHAT_CONFIG_KEYS.OFFICIAL_ACCOUNT]: officialAccountConfigSchema,
  [WECHAT_CONFIG_KEYS.PAYMENT]: paymentConfigSchema,
  [WECHAT_CONFIG_KEYS.WORK]: workConfigSchema,
  [WECHAT_CONFIG_KEYS.COMMON]: commonConfigSchema
} as const;

// 获取完整的微信配置验证模式
export const wechatConfigSchema = Joi.object({
  miniProgram: miniprogramConfigSchema,
  officialAccount: officialAccountConfigSchema,
  payment: paymentConfigSchema,
  work: workConfigSchema,
  common: commonConfigSchema
});