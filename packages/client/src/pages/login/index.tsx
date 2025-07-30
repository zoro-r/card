import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'umi';
import request from '@/utils/request';
import styles from './index.less';

interface LoginForm {
  loginName: string;
  password: string;
}

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await request('/api/user/login', {
        method: 'POST',
        data: {
          ...values,
          platformId: 'default' // 默认平台ID
        }
      });

      // 保存token和用户信息
      localStorage.setItem('token', result.token);
      localStorage.setItem('userInfo', JSON.stringify(result.userInfo));
      
      message.success('登录成功');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        <div className={styles.loginLeft}>
          <div className={styles.brandSection}>
            <div className={styles.logoContainer}>
              <SafetyCertificateOutlined className={styles.logo} />
            </div>
            <Title level={1} className={styles.brandTitle}>
              智慧名片系统
            </Title>
            <Text className={styles.brandSubtitle}>
              安全、高效的数字化管理平台
            </Text>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🔒</div>
              <div className={styles.featureText}>安全可靠</div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>⚡</div>
              <div className={styles.featureText}>高效便捷</div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <div className={styles.featureText}>数据智能</div>
            </div>
          </div>
        </div>
        
        <div className={styles.loginRight}>
          <Card className={styles.loginCard} bordered={false}>
            <div className={styles.loginHeader}>
              <Title level={3} className={styles.loginTitle}>
                欢迎登录
              </Title>
              <Text type="secondary" className={styles.loginSubtitle}>
                请输入您的账户信息
              </Text>
            </div>
            
            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              className={styles.loginForm}
            >
            <Form.Item
              name="loginName"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input 
                prefix={<UserOutlined className={styles.inputIcon} />} 
                placeholder="请输入用户名"
                className={styles.loginInput}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder="请输入密码"
                className={styles.loginInput}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className={styles.loginButton}
                block
              >
                {loading ? '登录中...' : '立即登录'}
              </Button>
            </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;