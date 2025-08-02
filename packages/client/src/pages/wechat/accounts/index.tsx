import React, { useState, useRef } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Drawer,
  Descriptions,
  Typography,
  Switch,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  WechatOutlined,
  FileOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { getWechatAccountList, createWechatAccount, updateWechatAccount, deleteWechatAccount, type WechatAccount } from '@/services/wechatAccountService';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

// 文件选择和文本输入混合组件
const FileTextArea: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  accept?: string;
  rows?: number;
  style?: React.CSSProperties;
}> = ({ value, onChange, placeholder, accept = '.pem,.key,.txt', rows = 6, style }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange?.(content);
        message.success(`文件 ${file.name} 读取成功`);
      };
      reader.onerror = () => {
        message.error('文件读取失败');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <Input.TextArea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={style}
      />
      <div style={{ marginTop: 8 }}>
        <Button 
          size="small" 
          icon={<UploadOutlined />} 
          onClick={handleFileSelect}
          type="dashed"
        >
          选择文件填充
        </Button>
        <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
          支持 .pem、.key、.txt 格式文件
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export interface WechatAccountFormData {
  name: string;
  appId: string;
  appSecret: string;
  type: 'MINIPROGRAM' | 'OFFICIAL_ACCOUNT' | 'ENTERPRISE' | 'OPEN_PLATFORM';
  displayName: string;
  description?: string;
  platformId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING';
  enablePayment?: boolean;
  mchId?: string;
  mchKey?: string;
  certPath?: string;
  keyPath?: string;
}

const WechatAccountList: React.FC = () => {
  const actionRef = useRef<any>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<WechatAccount | null>(null);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleEdit = (record: WechatAccount) => {
    setCurrentAccount(record);
    form.setFieldsValue({
      ...record,
      appSecret: '', // 不显示原密钥
      mchKey: record.enablePayment ? '' : undefined, // 不显示原密钥
    });
    setEditModalVisible(true);
  };

  const handleViewDetail = (record: WechatAccount) => {
    setCurrentAccount(record);
    setDetailDrawerVisible(true);
  };

  const handleDelete = async (accountId: string) => {
    try {
      await deleteWechatAccount(accountId);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
      console.error('删除微信账号失败:', error);
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: WechatAccountFormData = {
        ...values,
        status: values.status ?? 'ACTIVE',
        platformId: 'platform001', // 默认平台ID，可以从上下文获取
      };
      
      await createWechatAccount(formData);
      message.success('创建成功');
      setCreateModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('创建失败');
      console.error('创建微信账号失败:', error);
    }
  };

  const handleEditSubmit = async () => {
    if (!currentAccount) return;

    try {
      const values = await form.validateFields();
      const updateData: Partial<WechatAccountFormData> = {
        ...values,
      };
      
      // 如果密钥字段为空，则不更新
      if (!updateData.appSecret) {
        delete updateData.appSecret;
      }
      if (!updateData.mchKey) {
        delete updateData.mchKey;
      }
      
      await updateWechatAccount(currentAccount.accountId, updateData);
      message.success('更新成功');
      setEditModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('更新失败');
      console.error('更新微信账号失败:', error);
    }
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      MINIPROGRAM: '小程序',
      OFFICIAL_ACCOUNT: '公众号',
      ENTERPRISE: '企业微信',
      OPEN_PLATFORM: '开放平台',
    };
    return typeMap[type] || '未知类型';
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      MINIPROGRAM: 'purple',
      OFFICIAL_ACCOUNT: 'green',
      ENTERPRISE: 'orange',
      OPEN_PLATFORM: 'blue',
    };
    return colorMap[type] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: '正常',
      INACTIVE: '停用',
      SUSPENDED: '暂停',
      EXPIRED: '过期',
      PENDING: '待审核'
    };
    return statusMap[status] || '未知';
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      ACTIVE: 'success',
      INACTIVE: 'default',
      SUSPENDED: 'warning',
      EXPIRED: 'error',
      PENDING: 'processing'
    };
    return colorMap[status] || 'default';
  };

  const columns: ProColumns<WechatAccount>[] = [
    {
      title: '账号信息',
      key: 'accountInfo',
      width: 220,
      search: false,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WechatOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {record.displayName}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {record.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '搜索',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: {
        placeholder: '搜索账号名称或显示名称',
      },
    },
    {
      title: 'AppID',
      dataIndex: 'appId',
      width: 180,
      search: false,
      render: (text) => (
        <Text copyable style={{ fontSize: 12, fontFamily: 'Monaco, Consolas, monospace' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      search: false,
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 130,
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={getStatusColor(record.status)} style={{ margin: 0 }}>
            {getStatusText(record.status)}
          </Tag>
          {record.enablePayment && (
            <Tag color="processing" style={{ fontSize: 10, margin: 0 }}>
              支持支付
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      search: false,
      ellipsis: true,
      render: (text) => (
        <div title={text || ''} style={{ maxWidth: '200px' }}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 110,
      search: false,
      render: (_, record) => record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个微信账号吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.accountId)}
            okText="确定"
            cancelText="取消"
            placement="topRight"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderAccountForm = (isEdit = false) => (
    <Form form={form} layout="vertical">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          name="name"
          label="账号名称"
          rules={[{ required: true, message: '请输入账号名称' }]}
        >
          <Input placeholder="请输入账号名称（用于系统内部标识）" />
        </Form.Item>
        
        <Form.Item
          name="displayName"
          label="显示名称"
          rules={[{ required: true, message: '请输入显示名称' }]}
        >
          <Input placeholder="请输入显示名称（用于前端展示）" />
        </Form.Item>
      
        <Form.Item
          name="type"
          label="账号类型"
          rules={[{ required: true, message: '请选择账号类型' }]}
        >
          <Select placeholder="请选择账号类型">
            <Option value="MINIPROGRAM">小程序</Option>
            <Option value="OFFICIAL_ACCOUNT">公众号</Option>
            <Option value="ENTERPRISE">企业微信</Option>
            <Option value="OPEN_PLATFORM">开放平台</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="appId"
          label="AppID"
          rules={[{ required: true, message: '请输入AppID' }]}
        >
          <Input placeholder="请输入AppID" />
        </Form.Item>
      
        <Form.Item
          name="appSecret"
          label={isEdit ? "AppSecret（留空则不修改）" : "AppSecret"}
          rules={isEdit ? [] : [{ required: true, message: '请输入AppSecret' }]}
        >
          <Input.Password placeholder={isEdit ? "留空则不修改现有密钥" : "请输入AppSecret"} />
        </Form.Item>
        
        <Form.Item
          name="enablePayment"
          label="启用支付功能"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </div>
      
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => 
          prevValues.enablePayment !== currentValues.enablePayment
        }
      >
        {({ getFieldValue }) =>
          getFieldValue('enablePayment') ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item
                  name="mchId"
                  label="商户号"
                  rules={[{ required: true, message: '请输入商户号' }]}
                >
                  <Input placeholder="请输入微信支付商户号" />
                </Form.Item>
                
                <Form.Item
                  name="mchKey"
                  label={isEdit ? "API密钥（留空则不修改）" : "API密钥"}
                  rules={isEdit ? [] : [{ required: true, message: '请输入API密钥' }]}
                >
                  <Input.Password placeholder={isEdit ? "留空则不修改现有密钥" : "请输入API密钥"} />
                </Form.Item>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>              
                <Form.Item
                  name="certPath"
                  label="API证书内容"
                  tooltip="粘贴apiclient_cert.pem文件内容，用于微信支付退款等接口，可选"
                >
                  <FileTextArea
                    rows={6}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;证书内容...&#10;-----END CERTIFICATE-----"
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    accept=".pem,.crt,.cer,.txt"
                  />
                </Form.Item>
                
                <Form.Item
                  name="keyPath"
                  label="API密钥内容"
                  tooltip="粘贴apiclient_key.pem文件内容，用于微信支付退款等接口，可选"
                >
                  <FileTextArea
                    rows={6}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;密钥内容...&#10;-----END PRIVATE KEY-----"
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    accept=".pem,.key,.txt"
                  />
                </Form.Item>
              </div>
            </>
          ) : null
        }
      </Form.Item>
      
      <Form.Item name="description" label="描述">
        <Input.TextArea
          rows={3}
          placeholder="请输入账号描述（可选）"
          maxLength={500}
        />
      </Form.Item>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          name="status"
          label="账号状态"
          initialValue="ACTIVE"
        >
          <Select>
            <Option value="ACTIVE">正常</Option>
            <Option value="INACTIVE">停用</Option>
            <Option value="SUSPENDED">暂停</Option>
            <Option value="EXPIRED">过期</Option>
            <Option value="PENDING">待审核</Option>
          </Select>
        </Form.Item>
        <div></div>
      </div>
    </Form>
  );

  return (
    <div>
      <ProTable<WechatAccount>
        actionRef={actionRef}
        columns={columns}
        scroll={{ x: 1160 }}
        request={async (params) => {
          try {
            const response = await getWechatAccountList({
              page: params.current || 1,
              limit: params.pageSize || 20,
              keyword: params.keyword,
            });
            
            return {
              data: response.accounts,
              success: true,
              total: response.pagination.total,
            };
          } catch (error) {
            message.error('获取账号列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        rowKey="accountId"
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
        }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        headerTitle="微信账号管理"
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建账号
          </Button>,
        ]}
      />

      {/* 创建账号模态框 */}
      <Modal
        title="创建微信账号"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setCreateModalVisible(false)}
        width={800}
      >
        {renderAccountForm(false)}
      </Modal>

      {/* 编辑账号模态框 */}
      <Modal
        title="编辑微信账号"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={800}
      >
        {renderAccountForm(true)}
      </Modal>

      {/* 账号详情抽屉 */}
      <Drawer
        title="微信账号详情"
        placement="right"
        width={500}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {currentAccount && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <WechatOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 500 }}>
                {currentAccount.displayName}
              </div>
              <div style={{ marginTop: 4, fontSize: 14, color: '#666' }}>
                {currentAccount.name}
              </div>
            </div>

            <Descriptions column={1} bordered>
              <Descriptions.Item label="账号ID">
                <Text copyable>{currentAccount.accountId}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="AppID">
                <Text copyable>{currentAccount.appId}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="账号类型">
                <Tag color={getTypeColor(currentAccount.type)}>
                  {getTypeText(currentAccount.type)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="状态">
                <Space>
                  <Tag color={getStatusColor(currentAccount.status)}>
                    {getStatusText(currentAccount.status)}
                  </Tag>
                  {currentAccount.enablePayment && (
                    <Tag color="processing">支持支付</Tag>
                  )}
                </Space>
              </Descriptions.Item>
              
              {currentAccount.enablePayment && currentAccount.mchId && (
                <Descriptions.Item label="商户号">
                  <Text copyable>{currentAccount.mchId}</Text>
                </Descriptions.Item>
              )}
              
              {currentAccount.description && (
                <Descriptions.Item label="描述">
                  {currentAccount.description}
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="创建时间">
                {dayjs(currentAccount.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              
              <Descriptions.Item label="更新时间">
                {dayjs(currentAccount.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default WechatAccountList;