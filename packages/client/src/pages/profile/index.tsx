import React, { useState } from 'react';
import { Card, Button, Avatar, Descriptions, Modal, Form, Input, message, Select, DatePicker } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import useUser from '@/hooks/useUser';
import request from '@/utils/request';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

const Profile: React.FC = () => {
  const user = useUser();
  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleChangePassword = async (values: any) => {
    try {
      setPasswordLoading(true);
      await request('/api/user/change-password', {
        method: 'POST',
        data: {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
      });
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.message || '密码修改失败');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateProfile = async (values: any) => {
    try {
      setProfileLoading(true);
      const updateData = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
      };
      
      await request('/api/user/profile', {
        method: 'PUT',
        data: updateData,
      });
      message.success('个人信息更新成功');
      setProfileModalVisible(false);
      // 刷新用户信息
      window.location.reload();
    } catch (error: any) {
      message.error(error.message || '个人信息更新失败');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
    passwordForm.resetFields();
  };

  const handleProfileCancel = () => {
    setProfileModalVisible(false);
    profileForm.resetFields();
  };

  const openProfileModal = () => {
    setProfileModalVisible(true);
    // 设置表单初始值
    profileForm.setFieldsValue({
      nickname: user.nickname,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      birthday: user.birthday ? dayjs(user.birthday) : undefined,
      address: user.address,
      remark: user.remark,
    });
  };

  return (
    <div className="profile-container">
      <Card
        title="个人中心"
        extra={
          <div className="profile-actions">
            <Button 
              type="default" 
              icon={<EditOutlined />}
              onClick={openProfileModal}
              style={{ marginRight: 8 }}
            >
              编辑信息
            </Button>
            <Button 
              type="primary" 
              icon={<LockOutlined />}
              onClick={() => setPasswordModalVisible(true)}
            >
              修改密码
            </Button>
          </div>
        }
      >
        <div className="profile-header">
          <Avatar size={80} icon={<UserOutlined />} className="profile-avatar" />
          <div className="profile-info">
            <h2>{user.nickname || '未设置昵称'}</h2>
            <p className="profile-role">{user.roleName || '普通用户'}</p>
          </div>
        </div>

        <Descriptions
          title="基本信息"
          bordered
          column={1}
          labelStyle={{ width: '120px' }}
        >
          <Descriptions.Item label="用户名">
            {user.loginName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="昵称">
            {user.nickname || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {user.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="手机号">
            {user.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="性别">
            {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '未设置'}
          </Descriptions.Item>
          <Descriptions.Item label="生日">
            {user.birthday || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="地址">
            {user.address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="备注">
            {user.remark || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <span className={`status-badge ${user.status === 'active' ? 'active' : 'inactive'}`}>
              {user.status === 'active' ? '正常' : '禁用'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="最后登录">
            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={handlePasswordCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[
              { required: true, message: '请输入当前密码' }
            ]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>

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
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
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
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button onClick={handlePasswordCancel} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={passwordLoading}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑个人信息模态框 */}
      <Modal
        title="编辑个人信息"
        open={profileModalVisible}
        onCancel={handleProfileCancel}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { max: 50, message: '昵称长度不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

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
            <Select placeholder="请选择性别" allowClear>
              <Option value="male">男</Option>
              <Option value="female">女</Option>
              <Option value="other">未设置</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="birthday"
            label="生日"
          >
            <DatePicker 
              placeholder="请选择生日" 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
            rules={[
              { max: 200, message: '地址长度不能超过200个字符' }
            ]}
          >
            <TextArea 
              placeholder="请输入地址" 
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="remark"
            label="个人简介"
            rules={[
              { max: 500, message: '个人简介长度不能超过500个字符' }
            ]}
          >
            <TextArea 
              placeholder="请输入个人简介" 
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button onClick={handleProfileCancel} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={profileLoading}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;