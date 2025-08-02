import React, { useState, useRef } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Switch, 
  Modal, 
  Form, 
  Input, 
  message,
  Drawer,
  Descriptions,
  Typography,
  Select,
  Card
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { getWechatUserList, updateWechatUserStatus, type WechatUser } from '@/services/wechatUserService';
import { getPlatformWechatAccounts } from '@/services/wechatAccountService';

const { Text } = Typography;
const { Option } = Select;

const WechatUserList: React.FC = () => {
  const actionRef = useRef<any>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<WechatUser | null>(null);
  const [form] = Form.useForm();

  // 平台和微信账号选择
  const [selectedWechatAccount, setSelectedWechatAccount] = useState<string>('');
  const [wechatAccounts, setWechatAccounts] = useState<any[]>([]);

  // 获取微信账号列表
  const fetchWechatAccounts = async () => {
    try {
      const response = await getPlatformWechatAccounts('platform001'); // 使用固定的平台ID
      setWechatAccounts(response);
      if (response.length > 0 && !selectedWechatAccount) {
        setSelectedWechatAccount(response[0].accountId);
      }
    } catch (error) {
      console.error('获取微信账号列表失败:', error);
      message.error('获取微信账号列表失败');
    }
  };

  // 初始化时获取微信账号列表
  React.useEffect(() => {
    fetchWechatAccounts();
  }, []);

  // 当选中的微信账号改变时，触发表格重新加载
  React.useEffect(() => {
    if (selectedWechatAccount && actionRef.current) {
      actionRef.current.reload();
    }
  }, [selectedWechatAccount]);

  const handleViewDetail = (record: WechatUser) => {
    setCurrentUser(record);
    setDetailDrawerVisible(true);
  };

  const handleEdit = (record: WechatUser) => {
    setCurrentUser(record);
    form.setFieldsValue({
      isActive: record.isActive,
      isBlocked: record.isBlocked,
      remark: record.remark,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!currentUser) return;

    try {
      const values = await form.validateFields();
      await updateWechatUserStatus(selectedWechatAccount, currentUser._id, values);
      message.success('更新用户状态成功');
      setEditModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('更新用户状态失败');
      console.error('更新用户状态失败:', error);
    }
  };

  const handleQuickToggle = async (record: WechatUser, field: 'isActive' | 'isBlocked', value: boolean) => {
    try {
      await updateWechatUserStatus(selectedWechatAccount, record._id, {
        [field]: value,
      });
      message.success(`${field === 'isActive' ? '激活状态' : '封禁状态'}更新成功`);
      actionRef.current?.reload();
    } catch (error) {
      message.error('更新状态失败');
      console.error('更新状态失败:', error);
    }
  };

  const columns: ProColumns<WechatUser>[] = [
    {
      title: '用户信息',
      dataIndex: 'userInfo',
      key: 'userInfo',
      width: 200,
      search: false,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.nickName || '未设置昵称'}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {record.phone || '未绑定手机'}
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
        placeholder: '搜索用户昵称或手机号',
      },
    },
    {
      title: '性别',
      dataIndex: 'genderText',
      width: 60,
      search: false,
      render: (text) => text || '未知',
    },
    {
      title: '地区',
      key: 'location',
      width: 120,
      search: false,
      render: (_, record) => {
        const location = [record.country, record.province, record.city]
          .filter(Boolean)
          .join(' ');
        return location || '未知';
      },
    },
    {
      title: '登录统计',
      key: 'loginStats',
      width: 100,
      search: false,
      render: (_, record) => (
        <div>
          <div>次数: {record.loginCount}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.lastLoginTime ? 
              new Date(record.lastLoginTime).toLocaleDateString() : 
              '从未登录'
            }
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <div>
            <Text style={{ fontSize: 12, marginRight: 4 }}>激活:</Text>
            <Switch
              size="small"
              checked={record.isActive}
              onChange={(checked) => handleQuickToggle(record, 'isActive', checked)}
            />
          </div>
          <div>
            <Text style={{ fontSize: 12, marginRight: 4 }}>封禁:</Text>
            <Switch
              size="small"
              checked={record.isBlocked}
              onChange={(checked) => handleQuickToggle(record, 'isBlocked', checked)}
            />
          </div>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      width: 100,
      search: false,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={2}>
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
        </Space>
      ),
    },
  ];

  // 获取当前选中的微信账号信息
  const currentWechatAccount = wechatAccounts.find(account => account.accountId === selectedWechatAccount);

  return (
    <div>
      {/* 微信账号选择区域 */}
      <Card 
        style={{ 
          marginBottom: 16,
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20 
        }}>
          {/* 左侧选择区域 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 12
            }}>
              <Text style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#262626',
                whiteSpace: 'nowrap'
              }}>
                选择微信账号
              </Text>
              <Select
                style={{ width: 320 }}
                value={selectedWechatAccount}
                onChange={setSelectedWechatAccount}
                placeholder="请选择微信账号"
                size="large"
                variant="filled"
                popupMatchSelectWidth={false}
                popupClassName="custom-dropdown"
                dropdownRender={(originNode) => (
                  <div style={{
                    boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px',
                    minWidth: '360px'
                  }}>
                    {originNode}
                  </div>
                )}
                optionRender={(option) => {
                  // 从 wechatAccounts 中找到对应的账号数据
                  const account = wechatAccounts.find(acc => acc.accountId === option.value);
                  if (!account) return option.label;
                  
                  return (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12,
                      padding: '8px 4px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: account.typeText === '小程序' ? '#722ed1' : '#1890ff',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 2
                        }}>
                          <span style={{ 
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#262626'
                          }}>
                            {account.displayName}
                          </span>
                          <Tag 
                            color={account.typeText === '小程序' ? 'purple' : 'blue'}
                            style={{ 
                              margin: 0,
                              fontSize: '11px',
                              padding: '0 6px',
                              height: '18px',
                              lineHeight: '18px',
                              borderRadius: '9px'
                            }}
                          >
                            {account.typeText}
                          </Tag>
                          {account.enablePayment && (
                            <Tag 
                              color="green"
                              style={{ 
                                margin: 0,
                                fontSize: '11px',
                                padding: '0 6px',
                                height: '18px',
                                lineHeight: '18px',
                                borderRadius: '9px'
                              }}
                            >
                              支付
                            </Tag>
                          )}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#8c8c8c',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <span>{account.name}</span>
                          <span>•</span>
                          <span style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                            {account.appId ? `${account.appId.substring(0, 12)}...` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              >
                {wechatAccounts.map(account => (
                  <Option 
                    key={account.accountId} 
                    value={account.accountId}
                    data={account}
                  >
                    {account.displayName}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          
          {/* 右侧信息展示区域 */}
          {currentWechatAccount && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f6f9ff 0%, #f0f5ff 100%)',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #e6f4ff',
              gap: 12
            }}>
              <div>
                <Text style={{ 
                  fontSize: '12px', 
                  color: '#595959',
                  display: 'block',
                  marginBottom: '2px'
                }}>
                  当前账号 AppID
                </Text>
                <Text 
                  copyable={{ 
                    text: currentWechatAccount.appId,
                    tooltips: ['复制 AppID', '已复制']
                  }} 
                  style={{ 
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#262626'
                  }}
                >
                  {currentWechatAccount.appId}
                </Text>
              </div>
              {currentWechatAccount.enablePayment && (
                <div style={{
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  color: '#389e0d',
                  fontWeight: 500
                }}>
                  支持支付
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <ProTable<WechatUser>
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          if (!selectedWechatAccount) {
            return {
              data: [],
              success: true,
              total: 0,
            };
          }

          try {
            const response = await getWechatUserList({
              accountId: selectedWechatAccount, // 传递选中的微信账号ID
              page: params.current || 1,
              limit: params.pageSize || 20,
              keyword: params.keyword,
            });
            
            return {
              data: response.users,
              success: true,
              total: response.pagination.total,
            };
          } catch (error) {
            message.error('获取用户列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        rowKey="_id"
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
        headerTitle={`微信用户列表 - ${currentWechatAccount ? currentWechatAccount.displayName + ' 账号用户' : '所有用户'}`}
        options={{
          reload: true,
          density: true,
          setting: true,
        }}
        dateFormatter="string"
        scroll={{ x: 'max-content' }}
      />

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="isActive"
            label="激活状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="激活" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Form.Item
            name="isBlocked"
            label="封禁状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="封禁" unCheckedChildren="正常" />
          </Form.Item>
          
          <Form.Item name="remark" label="备注">
            <Input.TextArea
              rows={3}
              placeholder="请输入备注信息"
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        placement="right"
        width={500}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {currentUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                src={currentUser.avatarUrl}
                icon={<UserOutlined />}
                size={80}
              />
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 500 }}>
                {currentUser.nickName || '未设置昵称'}
              </div>
              {currentWechatAccount && (
                <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                  来自: <Tag color="blue">{currentWechatAccount.typeText}</Tag>
                  {currentWechatAccount.displayName}
                </div>
              )}
            </div>

            <Descriptions column={1} bordered>
              <Descriptions.Item label="OpenID">
                <Text copyable style={{ fontSize: 12 }}>
                  {currentUser.openid}
                </Text>
              </Descriptions.Item>
              
              {currentUser.unionid && (
                <Descriptions.Item label="UnionID">
                  <Text copyable style={{ fontSize: 12 }}>
                    {currentUser.unionid}
                  </Text>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="手机号">
                {currentUser.phone || '未绑定'}
              </Descriptions.Item>
              
              <Descriptions.Item label="性别">
                {currentUser.genderText}
              </Descriptions.Item>
              
              <Descriptions.Item label="地区">
                {[currentUser.country, currentUser.province, currentUser.city]
                  .filter(Boolean)
                  .join(' ') || '未知'}
              </Descriptions.Item>
              
              <Descriptions.Item label="语言">
                {currentUser.language || '未知'}
              </Descriptions.Item>
              
              <Descriptions.Item label="状态">
                <Space>
                  <Tag color={currentUser.isActive ? 'green' : 'red'}>
                    {currentUser.isActive ? '激活' : '禁用'}
                  </Tag>
                  {currentUser.isBlocked && (
                    <Tag color="red">已封禁</Tag>
                  )}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="登录次数">
                {currentUser.loginCount}
              </Descriptions.Item>
              
              <Descriptions.Item label="最后登录">
                {currentUser.lastLoginTime ? 
                  new Date(currentUser.lastLoginTime).toLocaleString() : 
                  '从未登录'
                }
              </Descriptions.Item>
              
              <Descriptions.Item label="注册时间">
                {new Date(currentUser.registerTime).toLocaleString()}
              </Descriptions.Item>
              
              <Descriptions.Item label="来源">
                {currentUser.source || '未知'}
              </Descriptions.Item>
              
              {currentUser.tags && currentUser.tags.length > 0 && (
                <Descriptions.Item label="标签">
                  <Space wrap>
                    {currentUser.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              
              {currentUser.remark && (
                <Descriptions.Item label="备注">
                  {currentUser.remark}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default WechatUserList;