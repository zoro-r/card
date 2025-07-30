import React, { useEffect } from 'react';
import { useNavigate } from 'umi';
import { Spin } from 'antd';
import useUser from '@/hooks/useUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission }) => {
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果用户未登录，跳转到登录页
    if (!user.loading && !user.uuid) {
      navigate('/login');
      return;
    }

    // 如果需要特定权限但用户没有该权限，跳转到403页面
    if (permission && user.permissions && !user.permissions.includes(permission)) {
      navigate('/403');
      return;
    }
  }, [user, permission, navigate]);

  // 加载中
  if (user.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 用户未登录
  if (!user.uuid) {
    return null;
  }

  // 用户已登录但权限不足
  if (permission && user.permissions && !user.permissions.includes(permission)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;