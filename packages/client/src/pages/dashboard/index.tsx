import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Button, List, Avatar, Badge, Tooltip, Space, Typography, Alert } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  MenuOutlined, 
  DashboardOutlined,
  CreditCardOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import useUser from '@/hooks/useUser';
import request from '@/utils/request';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const user = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalMenus: 0,
    activeUsers: 0,
    totalCards: 0,
    activeCards: 0,
    pendingCards: 0,
    todayVisits: 0
  });
  const [loading, setLoading] = useState(true);

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      // 这里可以创建一个统计API，现在先模拟数据
      const mockStats = {
        totalUsers: 15,
        totalRoles: 5,
        totalMenus: 12,
        activeUsers: 12,
        totalCards: 128,
        activeCards: 95,
        pendingCards: 8,
        todayVisits: 247
      };
      setStats(mockStats);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 模拟最近活动数据
  const recentActivities = [
    { id: 1, user: '张三', action: '创建名片', time: '刚刚', type: 'create' },
    { id: 2, user: '李四', action: '更新名片信息', time: '5分钟前', type: 'update' },
    { id: 3, user: '王五', action: '分享名片', time: '10分钟前', type: 'share' },
    { id: 4, user: '赵六', action: '查看名片统计', time: '15分钟前', type: 'view' },
    { id: 5, user: '钱七', action: '导出名片数据', time: '20分钟前', type: 'export' },
  ];

  // 模拟热门名片数据
  const hotCards = [
    { id: 1, name: '张经理', company: '科技有限公司', position: '技术总监', views: 156, avatar: null },
    { id: 2, name: '李总', company: '创新企业', position: 'CEO', views: 134, avatar: null },
    { id: 3, name: '王主管', company: '设计工作室', position: '创意总监', views: 98, avatar: null },
    { id: 4, name: '赵专员', company: '营销公司', position: '市场专员', views: 87, avatar: null },
  ];

  // 模拟待办事项
  const todoItems = [
    { id: 1, title: '审核新注册的名片', priority: 'high', dueDate: '今天' },
    { id: 2, title: '更新系统公告', priority: 'medium', dueDate: '明天' },
    { id: 3, title: '整理月度统计报告', priority: 'low', dueDate: '本周' },
    { id: 4, title: '回复客户反馈', priority: 'high', dueDate: '今天' },
  ];

  const activityColumns = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          create: { color: 'blue', text: '创建' },
          update: { color: 'orange', text: '更新' },
          share: { color: 'green', text: '分享' },
          view: { color: 'purple', text: '查看' },
          export: { color: 'cyan', text: '导出' },
        };
        const typeInfo = typeMap[type as keyof typeof typeMap];
        return typeInfo ? (
          <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
        ) : (
          <Tag>{type}</Tag>
        );
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 160,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 欢迎横幅 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <div style={{ color: 'white' }}>
              <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
                👋 欢迎回来，{user.nickname || user.loginName}！
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                今天是 {new Date().toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}，祝您工作愉快！
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;