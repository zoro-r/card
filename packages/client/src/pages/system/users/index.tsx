import React, { useState, useRef, useEffect } from 'react';
import { ProTable } from "@ant-design/pro-components";
import { Button, Space, Popconfirm, message, Tag, Modal, Form, Input, Select, Checkbox } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, KeyOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const genderMap = {
  male: '男',
  female: '女',
  other: '其他',
};

const statusMap = {
  active: { color: 'green', text: '正常' },
  disabled: { color: 'red', text: '禁用' },
  pending: { color: 'orange', text: '待审核' },
  banned: { color: 'red', text: '封禁' }
};

interface UserFormData {
  nickname: string;
  loginName: string;
  email: string;
  phone?: string;
  password?: string;
  status: string;
  gender?: string;
}

function Users() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const actionRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [assigningUser, setAssigningUser] = useState<any>(null);
  const [roleForm] = Form.useForm();
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null);
  const [resetPasswordForm] = Form.useForm();

  // 加载所有角色
  const loadAllRoles = async () => {
    try {
      const response = await request('/api/roles', {
        method: 'GET',
        data: { page: 1, pageSize: 100 }
      });
      setAllRoles(response.list || []);
    } catch (error) {
      console.error('加载角色失败:', error);
    }
  };

  // 显示新增/编辑模态框
  const showModal = (record?: any) => {
    setEditingUser(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  // 显示角色分配模态框
  const showRoleModal = async (record: any) => {
    setAssigningUser(record);
    setRoleModalVisible(true);
    
    // 设置当前用户的角色
    const userRoleIds = record.roles?.map((role: any) => role.uuid) || [];
    setSelectedRoles(userRoleIds);
    roleForm.setFieldsValue({
      roleIds: userRoleIds
    });
  };

  // 保存角色分配
  const handleRoleAssign = async (values: any) => {
    try {
      await request(`/api/users/${assigningUser.uuid}/roles`, {
        method: 'PUT',
        data: { roleIds: values.roleIds || [] }
      });
      message.success('角色分配成功');
      setRoleModalVisible(false);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '角色分配失败');
    }
  };

  // 显示重置密码模态框
  const showResetPasswordModal = (record: any) => {
    setResetPasswordUser(record);
    setResetPasswordVisible(true);
    resetPasswordForm.resetFields();
  };

  // 重置密码
  const handleResetPassword = async (values: any) => {
    try {
      await request(`/api/users/${resetPasswordUser.uuid}/reset-password`, {
        method: 'POST',
        data: { newPassword: values.newPassword }
      });
      message.success('密码重置成功');
      setResetPasswordVisible(false);
      resetPasswordForm.resetFields();
    } catch (error: any) {
      message.error(error.message || '密码重置失败');
    }
  };

  // 保存用户
  const handleSave = async (values: UserFormData) => {
    try {
      if (editingUser) {
        await request(`/api/users/${editingUser.uuid}`, {
          method: 'PUT',
          data: values
        });
        message.success('更新成功');
      } else {
        await request('/api/users', {
          method: 'POST',
          data: values
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  // 删除单个用户
  const handleDelete = async (uuid: string) => {
    setLoading(true);
    try {
      await request(`/api/users/${uuid}`, { 
        method: 'DELETE'
      });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    setLoading(true);
    try {
      await request('/api/users/batch-delete', { 
        method: 'POST', 
        data: { uuids: selectedRowKeys }
      });
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '批量删除失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 60,
    },
    {
      title: '用户姓名',
      dataIndex: 'nickname',
      width: 120,
    },
    {
      title: '登录账号',
      dataIndex: 'loginName',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 200,
      render: (roles: any[]) => {
        if (!roles || roles.length === 0) {
          return <Tag color="default">无角色</Tag>;
        }
        return (
          <Space wrap>
            {roles.map((role: any) => (
              <Tag key={role.uuid} color="blue">
                {role.name}
              </Tag>
            ))}
          </Space>
        );
      },
      search: false,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      render: (gender: string) => genderMap[gender as keyof typeof genderMap] || '-',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return statusInfo ? (
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        ) : (
          <Tag>{status}</Tag>
        );
      },
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        disabled: { text: '禁用', status: 'Error' },
        pending: { text: '待审核', status: 'Warning' },
        banned: { text: '封禁', status: 'Error' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 380,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button 
            icon={<TeamOutlined />} 
            size="small" 
            onClick={() => showRoleModal(record)}
          >
            分配角色
          </Button>
          <Button 
            icon={<KeyOutlined />} 
            size="small" 
            onClick={() => showResetPasswordModal(record)}
          >
            重置密码
          </Button>
          <Popconfirm
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.uuid)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger size="small" loading={loading}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ProTable 的 request 方法
  const fetchUsers = async (params: any) => {
    try {
      const res = await request('/api/users', { 
        method: 'GET', 
        data: {
          page: params.current,
          pageSize: params.pageSize,
          nickname: params.nickname,
          loginName: params.loginName,
          email: params.email,
          phone: params.phone,
          status: params.status,
        }
      });
      return {
        data: res.list || [],
        total: res.total || 0,
        success: true,
      };
    } catch (e) {
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  useEffect(() => {
    loadAllRoles();
  }, []);

  return (
    <>
      <ProTable
        actionRef={actionRef}
        rowKey="uuid"
        search={{
          labelWidth: 120,
        }}
        scroll={{
          x: 1200
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新增用户
          </Button>,
          selectedRowKeys.length > 0 && (
            <Popconfirm
              key="batchDelete"
              title={`确定要删除选中的 ${selectedRowKeys.length} 个用户吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger loading={loading}>
                批量删除
              </Button>
            </Popconfirm>
          ),
        ]}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys: any) => setSelectedRowKeys(keys as string[]),
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        request={fetchUsers}
        loading={loading}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="loginName"
              label="登录账号"
              rules={[{ required: true, message: '请输入登录账号' }]}
            >
              <Input placeholder="请输入登录账号" />
            </Form.Item>

            <Form.Item
              name="nickname"
              label="用户姓名"
              rules={[{ required: true, message: '请输入用户姓名' }]}
            >
              <Input placeholder="请输入用户姓名" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="性别"
            >
              <Select placeholder="请选择性别">
                <Select.Option value="male">男</Select.Option>
                <Select.Option value="female">女</Select.Option>
                <Select.Option value="other">其他</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="disabled">禁用</Select.Option>
              <Select.Option value="pending">待审核</Select.Option>
              <Select.Option value="banned">封禁</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`为用户 "${assigningUser?.nickname}" 分配角色`}
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleRoleAssign}
        >
          <Form.Item
            name="roleIds"
            label="选择角色"
          >
            <Checkbox.Group
              options={allRoles.map(role => ({
                label: `${role.name} (${role.code})`,
                value: role.uuid
              }))}
              value={selectedRoles}
              onChange={setSelectedRoles}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setRoleModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`重置用户 "${resetPasswordUser?.nickname}" 的密码`}
        open={resetPasswordVisible}
        onCancel={() => setResetPasswordVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认新密码" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                重置密码
              </Button>
              <Button onClick={() => setResetPasswordVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Users;
