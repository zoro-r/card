import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@umijs/max';
import request from '@/utils/request';

export default function useUser() {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setUser({});
          setLoading(false);
          return;
        }

        const userInfo = await request('/api/user/info');
        if (userInfo) {
          setUser(userInfo);
          
          // 检查是否为首次登录
          if (userInfo.isFirstLogin && location.pathname !== '/login/first-time-change-password') {
            navigate('/login/first-time-change-password', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser({});
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate, location.pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser({});
    window.location.href = '/admin/login';
  };

  return {
    ...user,
    loading,
    logout,
  };
}