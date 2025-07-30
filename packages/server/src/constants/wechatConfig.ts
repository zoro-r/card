// 微信生态配置常量定义

export const WECHAT_CONFIG_KEYS = {
  MINIPROGRAM: 'wechat_miniprogram',
  OFFICIAL_ACCOUNT: 'wechat_official_account',
  PAYMENT: 'wechat_payment',
  WORK: 'wechat_work',
  COMMON: 'wechat_common'
} as const;

// 微信小程序配置模板
export const MINIPROGRAM_CONFIG_TEMPLATE = {
  appId: '',
  appSecret: '',
  originalId: '',
  enabled: false,
  serverDomain: '',
  businessDomain: '',
  downloadFile: true,
  uploadFile: true
};

// 微信公众号配置模板
export const OFFICIAL_ACCOUNT_CONFIG_TEMPLATE = {
  appId: '',
  appSecret: '',
  token: '',
  encodingAESKey: '',
  enabled: false,
  messageEncrypt: false,
  autoReply: {
    enabled: false,
    defaultMessage: '感谢您的关注！'
  }
};

// 微信支付配置模板
export const PAYMENT_CONFIG_TEMPLATE = {
  mchId: '',
  key: '',
  certPath: '',
  keyPath: '',
  enabled: false,
  notifyUrl: '',
  refundNotifyUrl: '',
  sandboxMode: false
};

// 企业微信配置模板
export const WORK_CONFIG_TEMPLATE = {
  corpId: '',
  corpSecret: '',
  agentId: '',
  enabled: false,
  chatSecret: '',
  contactSecret: '',
  approvalSecret: ''
};

// 通用配置模板
export const COMMON_CONFIG_TEMPLATE = {
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  logLevel: 'info',
  cacheExpire: 3600,
  rateLimitEnabled: true,
  maxApiCallsPerMinute: 1000
};

// 微信配置类型映射
export const WECHAT_CONFIG_TEMPLATES = {
  [WECHAT_CONFIG_KEYS.MINIPROGRAM]: MINIPROGRAM_CONFIG_TEMPLATE,
  [WECHAT_CONFIG_KEYS.OFFICIAL_ACCOUNT]: OFFICIAL_ACCOUNT_CONFIG_TEMPLATE,
  [WECHAT_CONFIG_KEYS.PAYMENT]: PAYMENT_CONFIG_TEMPLATE,
  [WECHAT_CONFIG_KEYS.WORK]: WORK_CONFIG_TEMPLATE,
  [WECHAT_CONFIG_KEYS.COMMON]: COMMON_CONFIG_TEMPLATE
} as const;

// 配置描述
export const WECHAT_CONFIG_DESCRIPTIONS = {
  [WECHAT_CONFIG_KEYS.MINIPROGRAM]: '微信小程序配置',
  [WECHAT_CONFIG_KEYS.OFFICIAL_ACCOUNT]: '微信公众号配置',
  [WECHAT_CONFIG_KEYS.PAYMENT]: '微信支付配置',
  [WECHAT_CONFIG_KEYS.WORK]: '企业微信配置',
  [WECHAT_CONFIG_KEYS.COMMON]: '微信生态通用配置'
} as const;

// 配置验证规则
export const WECHAT_CONFIG_VALIDATION = {
  [WECHAT_CONFIG_KEYS.MINIPROGRAM]: {
    appId: {
      required: true,
      pattern: /^wx[a-f0-9]{16}$/,
      message: '小程序AppID格式不正确，应为wx开头的18位字符'
    },
    appSecret: {
      required: true,
      length: 32,
      message: '小程序AppSecret必须是32位字符'
    }
  },
  [WECHAT_CONFIG_KEYS.OFFICIAL_ACCOUNT]: {
    appId: {
      required: true,
      pattern: /^wx[a-f0-9]{16}$/,
      message: '公众号AppID格式不正确，应为wx开头的18位字符'
    },
    appSecret: {
      required: true,
      length: 32,
      message: '公众号AppSecret必须是32位字符'
    },
    token: {
      required: true,
      minLength: 3,
      maxLength: 32,
      message: 'Token长度必须在3-32位之间'
    },
    encodingAESKey: {
      required: false,
      length: 43,
      message: 'EncodingAESKey必须是43位字符'
    }
  },
  [WECHAT_CONFIG_KEYS.PAYMENT]: {
    mchId: {
      required: true,
      pattern: /^\d+$/,
      message: '商户号必须是纯数字'
    },
    key: {
      required: true,
      length: 32,
      message: 'API密钥必须是32位字符'
    }
  },
  [WECHAT_CONFIG_KEYS.WORK]: {
    corpId: {
      required: true,
      message: '企业ID不能为空'
    },
    corpSecret: {
      required: true,
      message: '应用Secret不能为空'
    },
    agentId: {
      required: true,
      pattern: /^\d+$/,
      message: '应用ID必须是纯数字'
    }
  }
} as const;