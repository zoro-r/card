import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'umi';
import request from '@/utils/request';
import './index.less';

const { Title, Text } = Typography;

const FirstTimeChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    setLoading(true);
    try {
      await request('/api/user/first-time-change-password', {
        method: 'POST',
        data: {
          newPassword: values.newPassword,
        },
      });

      message.success('密码修改成功，请重新登录');
      
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // 跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      message.error(error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-time-change-password">
      <Card className="change-password-card">
        <div className="header">
          <LockOutlined className="icon" />
          <Title level={3}>首次登录</Title>
          <Text type="secondary">
            为了您的账户安全，请修改您的初始密码
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="change-password-form"
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6位' },
              { max: 20, message: '密码长度不能超过20位' },
            ]}
          >
            <Input.Password
              placeholder="请输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
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
            <Input.Password
              placeholder="请再次输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FirstTimeChangePassword;