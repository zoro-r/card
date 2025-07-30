import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Space, 
  message, 
  Divider, 
  Typography, 
  Row, 
  Col,
  Alert,
  Tabs,
  Tooltip,
  Select,
  InputNumber,
  Tag,
  Collapse
} from 'antd';
import { 
  WechatOutlined, 
  SaveOutlined, 
  ReloadOutlined, 
  QuestionCircleOutlined,
  EyeOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  TeamOutlined
} from '@ant-design/icons';
import request from '@/utils/request';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

interface WechatConfig {
  // 小程序配置
  miniProgram: {
    appId: string;
    appSecret: string;
    originalId: string;
    enabled: boolean;
    // 高级配置
    serverDomain?: string;
    businessDomain?: string;
    downloadFile?: boolean;
    uploadFile?: boolean;
  };
  // 公众号配置
  officialAccount: {
    appId: string;
    appSecret: string;
    token: string;
    encodingAESKey: string;
    enabled: boolean;
    // 高级配置
    messageEncrypt?: boolean;
    autoReply?: {
      enabled: boolean;
      defaultMessage: string;
    };
    menuConfig?: any;
  };
  // 微信支付配置
  payment: {
    mchId: string;
    key: string;
    certPath: string;
    keyPath: string;
    enabled: boolean;
    // 高级配置
    notifyUrl?: string;
    refundNotifyUrl?: string;
    sandboxMode?: boolean;
  };
  // 企业微信配置
  work: {
    corpId: string;
    corpSecret: string;
    agentId: string;
    enabled: boolean;
    // 高级配置
    chatSecret?: string;
    contactSecret?: string;
    approvalSecret?: string;
  };
  // 通用配置
  common: {
    timezone: string;
    language: string;
    logLevel: string;
    cacheExpire: number;
    rateLimitEnabled: boolean;
    maxApiCallsPerMinute: number;
  };
}

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [testLoading, setTestLoading] = useState<string>('');
  const [, setConfig] = useState<WechatConfig | null>(null);
  const [activeTab, setActiveTab] = useState('miniProgram');
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

  // 加载配置
  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await request('/api/wechat', {
        method: 'GET',
      });
      
      const wechatConfig = response.data || getDefaultConfig();
      setConfig(wechatConfig);
      form.setFieldsValue(wechatConfig);
    } catch (error: any) {
      message.error(error.message || '加载配置失败');
      const defaultConfig = getDefaultConfig();
      setConfig(defaultConfig);
      form.setFieldsValue(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  // 获取默认配置
  const getDefaultConfig = (): WechatConfig => ({
    miniProgram: { 
      appId: '', 
      appSecret: '', 
      originalId: '', 
      enabled: false,
      serverDomain: '',
      businessDomain: '',
      downloadFile: true,
      uploadFile: true
    },
    officialAccount: { 
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
    },
    payment: { 
      mchId: '', 
      key: '', 
      certPath: '', 
      keyPath: '', 
      enabled: false,
      notifyUrl: '',
      refundNotifyUrl: '',
      sandboxMode: false
    },
    work: { 
      corpId: '', 
      corpSecret: '', 
      agentId: '', 
      enabled: false,
      chatSecret: '',
      contactSecret: '',
      approvalSecret: ''
    },
    common: {
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
      logLevel: 'info',
      cacheExpire: 3600,
      rateLimitEnabled: true,
      maxApiCallsPerMinute: 1000
    }
  });

  // 保存配置
  const handleSave = async (values: WechatConfig) => {
    setSaveLoading(true);
    try {
      // 验证配置
      const validationResult = await validateConfig(values);
      if (!validationResult.isValid) {
        message.error(`配置验证失败: ${validationResult.errors.join(', ')}`);
        return;
      }

      await request('/api/config', {
        method: 'POST',
        data: {
          key: 'wechat',
          data: values,
          description: '微信生态配置'
        }
      });
      
      message.success('配置保存成功');
      setConfig(values);
    } catch (error: any) {
      message.error(error.message || '保存配置失败');
    } finally {
      setSaveLoading(false);
    }
  };

  // 验证配置
  const validateConfig = async (config: WechatConfig) => {
    const errors: string[] = [];
    
    // 验证小程序配置
    if (config.miniProgram.enabled) {
      if (!config.miniProgram.appId) errors.push('小程序AppID不能为空');
      if (!config.miniProgram.appSecret) errors.push('小程序AppSecret不能为空');
      if (config.miniProgram.appId && !/^wx[a-f0-9]{16}$/.test(config.miniProgram.appId)) {
        errors.push('小程序AppID格式不正确');
      }
    }
    
    // 验证公众号配置
    if (config.officialAccount.enabled) {
      if (!config.officialAccount.appId) errors.push('公众号AppID不能为空');
      if (!config.officialAccount.appSecret) errors.push('公众号AppSecret不能为空');
      if (!config.officialAccount.token) errors.push('公众号Token不能为空');
    }
    
    // 验证微信支付配置
    if (config.payment.enabled) {
      if (!config.payment.mchId) errors.push('商户号不能为空');
      if (!config.payment.key) errors.push('API密钥不能为空');
      if (config.payment.key && config.payment.key.length !== 32) {
        errors.push('API密钥必须是32位字符');
      }
    }
    
    // 验证企业微信配置
    if (config.work.enabled) {
      if (!config.work.corpId) errors.push('企业ID不能为空');
      if (!config.work.corpSecret) errors.push('应用Secret不能为空');
      if (!config.work.agentId) errors.push('应用ID不能为空');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 测试连接
  const testConnection = async (type: string) => {
    const values = form.getFieldsValue();
    setTestLoading(type);
    
    try {
      await request('/api/wechat/test', {
        method: 'POST',
        data: {
          type,
          config: values[type]
        }
      });
      
      setConnectionStatus(prev => ({ ...prev, [type]: true }));
      message.success(`${getTypeName(type)}连接测试成功`);
    } catch (error: any) {
      setConnectionStatus(prev => ({ ...prev, [type]: false }));
      message.error(error.message || `${getTypeName(type)}连接测试失败`);
    } finally {
      setTestLoading('');
    }
  };

  // 获取类型名称
  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      miniProgram: '小程序',
      officialAccount: '公众号',
      payment: '微信支付',
      work: '企业微信'
    };
    return names[type] || type;
  };

  // 复制配置到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  // 生成随机Token
  const generateToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 获取连接状态标签
  const getConnectionStatusTag = (type: string) => {
    if (connectionStatus[type] === true) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>已连接</Tag>;
    } else if (connectionStatus[type] === false) {
      return <Tag color="error" icon={<ExclamationCircleOutlined />}>连接失败</Tag>;
    }
    return <Tag color="default">未测试</Tag>;
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const renderMiniProgramTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card 
        title={
          <Space>
            <WechatOutlined />
            小程序基础配置
            {getConnectionStatusTag('miniProgram')}
          </Space>
        } 
        extra={
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => testConnection('miniProgram')}
              loading={testLoading === 'miniProgram'}
            >
              测试连接
            </Button>
          </Space>
        }
      >
        <Alert
          message="配置说明"
          description="配置微信小程序的基本信息，用于小程序登录、用户信息获取等功能。请确保AppID和AppSecret的正确性。"
          type="info"
          style={{ marginBottom: 24 }}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['miniProgram', 'appId']}
              label={
                <Space>
                  AppID
                  <Tooltip title="小程序的唯一标识符，格式：wxXXXXXXXXXXXXXXXX">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[
                { required: true, message: '请输入小程序AppID' },
                { pattern: /^wx[a-f0-9]{16}$/, message: 'AppID格式不正确' }
              ]}
            >
              <Input 
                placeholder="wxXXXXXXXXXXXXXXXX" 
                suffix={
                  <Button 
                    type="text" 
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(form.getFieldValue(['miniProgram', 'appId']) || '')}
                  />
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['miniProgram', 'originalId']}
              label={
                <Space>
                  原始ID
                  <Tooltip title="小程序的原始ID，通常以gh_开头">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <Input placeholder="gh_XXXXXXXXXXXXXXXX" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name={['miniProgram', 'appSecret']}
          label={
            <Space>
              AppSecret
              <Tooltip title="小程序的密钥，32位字符，请妥善保管">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          rules={[
            { required: true, message: '请输入小程序AppSecret' },
            { len: 32, message: 'AppSecret必须是32位字符' }
          ]}
        >
          <Input.Password placeholder="请输入小程序AppSecret" />
        </Form.Item>
        
        <Form.Item
          name={['miniProgram', 'enabled']}
          label="启用小程序"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="高级配置" type="inner">
        <Collapse ghost>
          <Panel header="域名配置" key="domain">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['miniProgram', 'serverDomain']}
                  label="服务器域名"
                  tooltip="小程序后端接口的域名"
                >
                  <Input placeholder="https://api.example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['miniProgram', 'businessDomain']}
                  label="业务域名"
                  tooltip="小程序业务页面的域名"
                >
                  <Input placeholder="https://www.example.com" />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
          
          <Panel header="功能权限" key="permissions">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['miniProgram', 'downloadFile']}
                  label="允许下载文件"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['miniProgram', 'uploadFile']}
                  label="允许上传文件"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Card>
    </Space>
  );

  const renderOfficialAccountTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card 
        title={
          <Space>
            <WechatOutlined />
            公众号基础配置
            {getConnectionStatusTag('officialAccount')}
          </Space>
        } 
        extra={
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => testConnection('officialAccount')}
              loading={testLoading === 'officialAccount'}
            >
              测试连接
            </Button>
          </Space>
        }
      >
        <Alert
          message="配置说明"
          description="配置微信公众号的基本信息，用于公众号消息推送、用户管理等功能。"
          type="info"
          style={{ marginBottom: 24 }}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['officialAccount', 'appId']}
              label="AppID"
              rules={[{ required: true, message: '请输入公众号AppID' }]}
            >
              <Input placeholder="请输入公众号AppID" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['officialAccount', 'token']}
              label={
                <Space>
                  Token
                  <Tooltip title="接口配置信息中的Token，3-32位字符">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[
                { required: true, message: '请输入Token' },
                { min: 3, max: 32, message: 'Token长度必须在3-32位之间' }
              ]}
            >
              <Input 
                placeholder="请输入Token" 
                suffix={
                  <Button 
                    type="text" 
                    size="small"
                    onClick={() => form.setFieldsValue({
                      officialAccount: {
                        ...form.getFieldValue('officialAccount'),
                        token: generateToken().substring(0, 16)
                      }
                    })}
                  >
                    生成
                  </Button>
                }
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name={['officialAccount', 'appSecret']}
          label="AppSecret"
          rules={[{ required: true, message: '请输入公众号AppSecret' }]}
        >
          <Input.Password placeholder="请输入公众号AppSecret" />
        </Form.Item>
        
        <Form.Item
          name={['officialAccount', 'encodingAESKey']}
          label={
            <Space>
              EncodingAESKey
              <Tooltip title="消息加解密密钥，43位字符组成，用于安全模式">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          rules={[
            { len: 43, message: 'EncodingAESKey必须是43位字符' }
          ]}
        >
          <Input 
            placeholder="请输入EncodingAESKey（消息加密时必填）" 
            suffix={
              <Button 
                type="text" 
                size="small"
                onClick={() => form.setFieldsValue({
                  officialAccount: {
                    ...form.getFieldValue('officialAccount'),
                    encodingAESKey: generateToken() + generateToken().substring(0, 11)
                  }
                })}
              >
                生成
              </Button>
            }
          />
        </Form.Item>
        
        <Form.Item
          name={['officialAccount', 'enabled']}
          label="启用公众号"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="高级配置" type="inner">
        <Collapse ghost>
          <Panel header="消息配置" key="message">
            <Form.Item
              name={['officialAccount', 'messageEncrypt']}
              label="消息加密"
              valuePropName="checked"
              tooltip="启用后需要配置EncodingAESKey"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['officialAccount', 'autoReply', 'enabled']}
              label="自动回复"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name={['officialAccount', 'autoReply', 'defaultMessage']}
              label="默认回复内容"
              dependencies={[['officialAccount', 'autoReply', 'enabled']]}
            >
              <TextArea 
                rows={3}
                placeholder="请输入默认回复内容"
                disabled={!form.getFieldValue(['officialAccount', 'autoReply', 'enabled'])}
              />
            </Form.Item>
          </Panel>
        </Collapse>
      </Card>
    </Space>
  );

  const renderPaymentTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card 
        title={
          <Space>
            <WechatOutlined />
            微信支付基础配置
            {getConnectionStatusTag('payment')}
          </Space>
        } 
        extra={
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => testConnection('payment')}
              loading={testLoading === 'payment'}
            >
              测试连接
            </Button>
          </Space>
        }
      >
        <Alert
          message="重要提醒"
          description="微信支付配置涉及资金安全，请确保API密钥和证书文件的安全性。建议在生产环境中使用专门的密钥管理服务。"
          type="warning"
          style={{ marginBottom: 24 }}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['payment', 'mchId']}
              label={
                <Space>
                  商户号
                  <Tooltip title="微信支付分配的商户号，纯数字">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[
                { required: true, message: '请输入商户号' },
                { pattern: /^\d+$/, message: '商户号必须是纯数字' }
              ]}
            >
              <Input placeholder="请输入商户号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['payment', 'key']}
              label={
                <Space>
                  API密钥
                  <Tooltip title="32位字符的API密钥，用于签名验证">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[
                { required: true, message: '请输入API密钥' },
                { len: 32, message: 'API密钥必须是32位字符' }
              ]}
            >
              <Input.Password placeholder="请输入32位API密钥" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['payment', 'certPath']}
              label="证书路径"
              tooltip="apiclient_cert.pem文件路径"
            >
              <Input placeholder="/path/to/apiclient_cert.pem" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['payment', 'keyPath']}
              label="密钥路径"
              tooltip="apiclient_key.pem文件路径"
            >
              <Input placeholder="/path/to/apiclient_key.pem" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name={['payment', 'enabled']}
          label="启用微信支付"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="高级配置" type="inner">
        <Collapse ghost>
          <Panel header="回调配置" key="callback">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['payment', 'notifyUrl']}
                  label="支付回调地址"
                  tooltip="支付成功后的回调URL"
                >
                  <Input placeholder="https://api.example.com/pay/notify" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['payment', 'refundNotifyUrl']}
                  label="退款回调地址"
                  tooltip="退款成功后的回调URL"
                >
                  <Input placeholder="https://api.example.com/refund/notify" />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
          
          <Panel header="环境配置" key="environment">
            <Form.Item
              name={['payment', 'sandboxMode']}
              label="沙箱模式"
              valuePropName="checked"
              tooltip="启用后将使用微信支付沙箱环境进行测试"
            >
              <Switch />
            </Form.Item>
          </Panel>
        </Collapse>
      </Card>
    </Space>
  );

  const renderWorkTab = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card 
        title={
          <Space>
            <TeamOutlined />
            企业微信基础配置
            {getConnectionStatusTag('work')}
          </Space>
        } 
        extra={
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => testConnection('work')}
              loading={testLoading === 'work'}
            >
              测试连接
            </Button>
          </Space>
        }
      >
        <Alert
          message="配置说明"
          description="配置企业微信应用信息，用于企业内部通讯、通知推送等功能。请确保企业ID和应用Secret的正确性。"
          type="info"
          style={{ marginBottom: 24 }}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['work', 'corpId']}
              label={
                <Space>
                  企业ID
                  <Tooltip title="企业微信的唯一标识，在企业微信管理后台可查看">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[{ required: true, message: '请输入企业ID' }]}
            >
              <Input placeholder="请输入企业ID" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['work', 'agentId']}
              label={
                <Space>
                  应用ID
                  <Tooltip title="企业应用的AgentId，纯数字">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[
                { required: true, message: '请输入应用ID' },
                { pattern: /^\d+$/, message: '应用ID必须是纯数字' }
              ]}
            >
              <Input placeholder="请输入应用ID" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name={['work', 'corpSecret']}
          label={
            <Space>
              应用Secret
              <Tooltip title="企业应用的Secret，用于调用企业微信API">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          rules={[{ required: true, message: '请输入应用Secret' }]}
        >
          <Input.Password placeholder="请输入应用Secret" />
        </Form.Item>
        
        <Form.Item
          name={['work', 'enabled']}
          label="启用企业微信"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="扩展应用配置" type="inner">
        <Collapse ghost>
          <Panel header="其他应用Secret" key="secrets">
            <Alert
              message="说明"
              description="以下配置为可选项，根据实际需要的功能进行配置。"
              type="info"
              style={{ marginBottom: 16 }}
            />
            
            <Form.Item
              name={['work', 'chatSecret']}
              label="群聊应用Secret"
              tooltip="用于群聊机器人功能"
            >
              <Input.Password placeholder="群聊应用Secret" />
            </Form.Item>
            
            <Form.Item
              name={['work', 'contactSecret']}
              label="通讯录应用Secret"
              tooltip="用于获取通讯录信息"
            >
              <Input.Password placeholder="通讯录应用Secret" />
            </Form.Item>
            
            <Form.Item
              name={['work', 'approvalSecret']}
              label="审批应用Secret"
              tooltip="用于审批流程功能"  
            >
              <Input.Password placeholder="审批应用Secret" />
            </Form.Item>
          </Panel>
        </Collapse>
      </Card>
    </Space>
  );

  const renderCommonTab = () => (
    <Card title={<Space><SettingOutlined />通用配置</Space>}>
      <Alert
        message="通用配置"
        description="配置系统的通用参数，影响整个微信生态功能的运行。"
        type="info"
        style={{ marginBottom: 24 }}
      />
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={['common', 'timezone']}
            label="时区"
            rules={[{ required: true, message: '请选择时区' }]}
          >
            <Select placeholder="选择时区">
              <Option value="Asia/Shanghai">Asia/Shanghai (北京时间)</Option>
              <Option value="UTC">UTC (协调世界时)</Option>
              <Option value="America/New_York">America/New_York (纽约时间)</Option>
              <Option value="Europe/London">Europe/London (伦敦时间)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['common', 'language']}
            label="语言"
            rules={[{ required: true, message: '请选择语言' }]}
          >
            <Select placeholder="选择语言">
              <Option value="zh-CN">简体中文</Option>
              <Option value="zh-TW">繁体中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={['common', 'logLevel']}
            label="日志级别"
            rules={[{ required: true, message: '请选择日志级别' }]}
          >
            <Select placeholder="选择日志级别">
              <Option value="error">Error</Option>
              <Option value="warn">Warn</Option>
              <Option value="info">Info</Option>
              <Option value="debug">Debug</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['common', 'cacheExpire']}
            label="缓存过期时间（秒）"
            rules={[{ required: true, message: '请输入缓存过期时间' }]}
          >
            <InputNumber 
              min={60} 
              max={86400} 
              placeholder="3600" 
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Divider orientation="left">API限流配置</Divider>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name={['common', 'rateLimitEnabled']}
            label="启用API限流"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['common', 'maxApiCallsPerMinute']}
            label="每分钟最大API调用次数"
            dependencies={[['common', 'rateLimitEnabled']]}
          >
            <InputNumber 
              min={100} 
              max={10000} 
              placeholder="1000" 
              style={{ width: '100%' }}
              disabled={!form.getFieldValue(['common', 'rateLimitEnabled'])}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <WechatOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            系统设置
          </Title>
          <Paragraph type="secondary">
            配置微信生态相关功能，包括小程序、公众号、微信支付和企业微信等。请确保配置信息的准确性和安全性。
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane 
              tab={<span><WechatOutlined />小程序</span>} 
              key="miniProgram"
            >
              {renderMiniProgramTab()}
            </TabPane>
            
            <TabPane 
              tab={<span><WechatOutlined />公众号</span>} 
              key="officialAccount"
            >
              {renderOfficialAccountTab()}
            </TabPane>
            
            <TabPane 
              tab={<span><ThunderboltOutlined />微信支付</span>} 
              key="payment"
            >
              {renderPaymentTab()}
            </TabPane>
            
            <TabPane 
              tab={<span><TeamOutlined />企业微信</span>} 
              key="work"
            >
              {renderWorkTab()}
            </TabPane>

            <TabPane 
              tab={<span><SettingOutlined />通用配置</span>} 
              key="common"
            >
              {renderCommonTab()}
            </TabPane>
          </Tabs>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saveLoading}
                icon={<SaveOutlined />}
                size="large"
              >
                保存配置
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadConfig}
                loading={loading}
                size="large"
              >
                重新加载
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings;