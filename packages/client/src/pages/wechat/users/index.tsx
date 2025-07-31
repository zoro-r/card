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
  Typography
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { getWechatUserList, updateWechatUserStatus, type WechatUser } from '@/services/wechatUserService';

const { Text } = Typography;

const WechatUserList: React.FC = () => {
  const actionRef = useRef<any>();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<WechatUser | null>(null);
  const [form] = Form.useForm();

  // 假设从路由或上下文获取 platformId
  const [platformId] = useState('platform001');

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
      await updateWechatUserStatus(platformId, currentUser._id, values);
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
      await updateWechatUserStatus(platformId, record._id, {
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
      width: 150,
      search: false,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
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

  return (
    <div>
      <ProTable<WechatUser>
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const response = await getWechatUserList({
              platformId,
              page: params.current || 1,
              limit: params.pageSize || 20,
              keyword: params.keyword,
            });
            
            // request工具已经处理了响应格式，直接使用response
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
        headerTitle="微信用户列表"
      />

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        width={500}
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