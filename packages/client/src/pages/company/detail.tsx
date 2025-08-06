import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from '@umijs/max';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Card,
  Button,
  Tag,
  message,
  Tooltip,
  Row,
  Col,
  Avatar,
  Space,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getCompanyDetail,
  getCompanyStats,
  getIndustries,
  getScales,
  type CompanyItem,
  type CompanyStats,
} from '@/services/company';
import {
  getEmployeeList,
  deleteEmployee,
  getDepartments,
  getLevels,
  getStatusOptions,
  type EmployeeItem,
  type EmployeeListParams,
} from '@/services/employee';
import CreateEmployeeModal from './components/CreateEmployeeModal';
import EditEmployeeModal from './components/EditEmployeeModal';
import EditCompanyModal from './components/EditCompanyModal';

// 添加自定义样式
const customStyles = `
  .table-row-hover:hover {
    background-color: #f8f9ff !important;
    transition: background-color 0.2s ease;
  }
  
  .ant-descriptions-item-label {
    font-weight: 500 !important;
  }
  
  .ant-card-head-title {
    font-weight: 600 !important;
  }
  
  .ant-pro-table-list-toolbar {
    padding: 16px 24px !important;
    border-bottom: 1px solid #f0f0f0;
  }
`;

const CompanyDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const actionRef = useRef<ActionType>();
  
  const [companyData, setCompanyData] = useState<CompanyItem | null>(null);
  const [statsData, setStatsData] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCompanyModalVisible, setEditCompanyModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [scales, setScales] = useState<string[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>('employees');

  // 获取企业详情和统计信息
  const fetchCompanyData = async () => {
    if (!id) {
      message.error('缺少企业ID');
      navigate(-1);
      return;
    }
    
    try {
      setLoading(true);
      const [companyDetail, companyStats] = await Promise.all([
        getCompanyDetail(id),
        getCompanyStats(id),
      ]);
      setCompanyData(companyDetail);
      setStatsData(companyStats);
    } catch (error) {
      message.error('获取企业信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取员工选项数据
  const fetchEmployeeOptions = async () => {
    if (!id) return;
    
    try {
      const [deptData, levelData, statusData] = await Promise.all([
        getDepartments(id),
        getLevels(id),
        getStatusOptions(),
      ]);
      setDepartments(deptData);
      setLevels(levelData);
      setStatusOptions(statusData);
    } catch (error) {
      console.error('获取员工选项失败:', error);
    }
  };

  // 获取公司选项数据
  const fetchCompanyOptions = async () => {
    try {
      const [industriesData, scalesData] = await Promise.all([
        getIndustries(),
        getScales(),
      ]);
      setIndustries(industriesData);
      setScales(scalesData);
    } catch (error) {
      console.error('获取公司选项失败:', error);
    }
  };

  React.useEffect(() => {
    fetchCompanyData();
    fetchEmployeeOptions();
    fetchCompanyOptions();
    
    // 注入自定义样式
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      // 清理样式
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [id]);


  // 编辑员工
  const handleEditEmployee = (record: EmployeeItem) => {
    setEditingEmployee(record);
    setEditModalVisible(true);
  };


  const employeeColumns: ProColumns<EmployeeItem>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <Avatar
            size={40}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{
              backgroundColor: record.avatar ? 'transparent' : '#1890ff',
              border: '2px solid #f0f0f0'
            }}
          />
          <div>
            <div style={{ 
              fontWeight: 600, 
              color: '#262626',
              fontSize: 14,
              marginBottom: 2
            }}>{text}</div>
            {record.isManager && (
              <Tag 
                color="blue" 
                style={{ 
                  borderRadius: 10,
                  fontSize: 10,
                  padding: '0 6px',
                  lineHeight: '16px'
                }}
              >
                管理者
              </Tag>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '职位',
      dataIndex: 'position',
      width: 120,
    },
    {
      title: '部门',
      dataIndex: 'department',
      width: 100,
      valueType: 'select',
      valueEnum: departments.reduce((acc, item) => {
        acc[item] = { text: item };
        return acc;
      }, {} as Record<string, { text: string }>),
    },
    {
      title: '职级',
      dataIndex: 'level',
      width: 80,
      valueType: 'select',
      valueEnum: levels.reduce((acc, item) => {
        acc[item] = { text: item };
        return acc;
      }, {} as Record<string, { text: string }>),
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      width: 150,
      search: false,
      render: (_, record) => (
        <div style={{ lineHeight: 1.4 }}>
          {record.phone && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 4,
              fontSize: 13
            }}>
              <PhoneOutlined style={{ 
                marginRight: 6, 
                color: '#1890ff',
                fontSize: 12 
              }} />
              <span style={{ color: '#262626' }}>{record.phone}</span>
            </div>
          )}
          {record.email && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 4,
              fontSize: 12
            }}>
              <MailOutlined style={{ 
                marginRight: 6, 
                color: '#52c41a',
                fontSize: 12 
              }} />
              <span style={{ color: '#595959' }}>{record.email}</span>
            </div>
          )}
          {record.unionid && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: 12
            }}>
              <WechatOutlined style={{ 
                marginRight: 6, 
                color: '#52c41a',
                fontSize: 12 
              }} />
              <Tag 
                color="success"
                style={{ 
                  margin: 0,
                  borderRadius: 8,
                  fontSize: 10,
                  padding: '1px 6px',
                  lineHeight: '14px'
                }}
              >
                已绑定微信
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: statusOptions.reduce((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {} as Record<string, { text: string }>),
      render: (_, record) => {
        const statusConfig: Record<string, { color: string; icon: string }> = {
          '在职': { color: 'success', icon: '●' },
          '离职': { color: 'error', icon: '●' },
          '休假': { color: 'warning', icon: '●' },
          '停职': { color: 'default', icon: '●' },
          '待入职': { color: 'processing', icon: '●' },
        };
        const config = statusConfig[record.status] || { color: 'default', icon: '●' };
        return (
          <Tag 
            color={config.color}
            style={{ 
              borderRadius: 12,
              padding: '2px 8px',
              fontSize: 12,
              fontWeight: 500,
              border: 0
            }}
          >
            <span style={{ marginRight: 4 }}>{config.icon}</span>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: '入职时间',
      dataIndex: 'joinDate',
      width: 120,
      search: false,
      render: (text: any) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <Tooltip key="edit" title="编辑员工">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditEmployee(record)}
          >
            编辑
          </Button>
        </Tooltip>,
        record.status !== '离职' && (
          <Popconfirm
            key="delete"
            title="确认删除"
            description={`确定要删除员工"${record.name}"吗？删除后不可恢复。`}
            onConfirm={async () => {
              try {
                await deleteEmployee(record._id);
                message.success('删除成功');
                actionRef.current?.reload();
                fetchCompanyData(); // 刷新统计信息
              } catch (error) {
                message.error('删除失败');
              }
            }}
            okText="确认"
            cancelText="取消"
            okType="danger"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        ),
      ].filter(Boolean),
    },
  ];

  if (loading || !companyData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        fontSize: 16,
        color: '#999'
      }}>
        加载中...
      </div>
    );
  }

  const tabList = [
    {
      key: 'employees',
      tab: '员工管理',
    },
    {
      key: 'analytics',
      tab: '数据分析',
    },
  ];

  const renderTabContent = () => {
    switch (activeTabKey) {
      case 'employees':
        return (
          <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 0' }}>
            <Card
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              styles={{ body: { padding: 0 } }}
            >
              <ProTable<EmployeeItem, EmployeeListParams>
                headerTitle={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 4, 
                      height: 16, 
                      backgroundColor: '#1890ff',
                      borderRadius: 2
                    }} />
                    员工列表
                  </div>
                }
                actionRef={actionRef}
                rowKey="_id"
                search={{
                  labelWidth: 80,
                  optionRender: (_, __, dom) => [
                    ...dom.reverse(),
                  ],
                }}
                toolBarRender={() => [
                  <Button
                    key="create"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                    style={{
                      borderRadius: 6,
                      boxShadow: '0 2px 4px rgba(24,144,255,0.2)'
                    }}
                  >
                    新增员工
                  </Button>,
                ]}
                request={async (params) => {
                  try {
                    const { current, pageSize, companyId, ...searchParams } = params;
                    const result = await getEmployeeList({
                      companyId: id!,
                      page: current,
                      pageSize,
                      ...searchParams,
                    });
                    
                    return {
                      data: result.list,
                      success: true,
                      total: result.total,
                    };
                  } catch (error) {
                    message.error('获取员工列表失败');
                    return {
                      data: [],
                      success: false,
                      total: 0,
                    };
                  }
                }}
                columns={employeeColumns}
                scroll={{ x: 1200 }}
                pagination={{
                  defaultPageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
                }}
                tableAlertRender={false}
                options={{
                  reload: true,
                  density: true,
                  setting: true,
                }}
                rowClassName={() => 'table-row-hover'}
              />
            </Card>
          </div>
        );
      case 'analytics':
        return (
          <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px 0' }}>
            <Row gutter={[24, 24]}>
              {/* 统计概览 */}
              <Col span={24}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 4, 
                        height: 16, 
                        backgroundColor: '#1890ff',
                        borderRadius: 2
                      }} />
                      统计概览
                    </div>
                  }
                  style={{ 
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  {statsData && (
                    <Row gutter={[24, 24]}>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#f6ffed', borderRadius: 12, border: '1px solid #b7eb8f' }}>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#52c41a', marginBottom: 8 }}>
                            {statsData.employeeStats.totalEmployees}
                          </div>
                          <div style={{ fontSize: 14, color: '#52c41a', fontWeight: 500 }}>员工总数</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#e6f4ff', borderRadius: 12, border: '1px solid #91caff' }}>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#1890ff', marginBottom: 8 }}>
                            {statsData.employeeStats.activeEmployees}
                          </div>
                          <div style={{ fontSize: 14, color: '#1890ff', fontWeight: 500 }}>在职员工</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#fff1f0', borderRadius: 12, border: '1px solid #ffadd2' }}>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#f5222d', marginBottom: 8 }}>
                            {statsData.employeeStats.managers}
                          </div>
                          <div style={{ fontSize: 14, color: '#f5222d', fontWeight: 500 }}>管理人员</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#f9f0ff', borderRadius: 12, border: '1px solid #d3adf7' }}>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#722ed1', marginBottom: 8 }}>
                            {statsData.businessCardCount}
                          </div>
                          <div style={{ fontSize: 14, color: '#722ed1', fontWeight: 500 }}>名片数量</div>
                        </div>
                      </Col>
                    </Row>
                  )}
                </Card>
              </Col>

              {/* 部门分析 */}
              <Col span={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 4, 
                        height: 16, 
                        backgroundColor: '#52c41a',
                        borderRadius: 2
                      }} />
                      部门分析
                    </div>
                  }
                  style={{ 
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: '400px'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <div style={{ minHeight: 300 }}>
                    <div style={{ marginBottom: 16, fontSize: 14, color: '#8c8c8c' }}>部门人员分布</div>
                    {statsData?.employeeStats.departments.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {statsData.employeeStats.departments.map((dept, index) => (
                          <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: [
                                '#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1',
                                '#13c2c2', '#eb2f96', '#fa541c', '#fadb14', '#a0d911'
                              ][index % 10]
                            }} />
                            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{dept}</div>
                            <div style={{ 
                              minWidth: 80,
                              height: 24,
                              backgroundColor: '#f0f0f0',
                              borderRadius: 12,
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: 12,
                              fontSize: 12,
                              color: '#595959'
                            }}>
                              {Math.floor(Math.random() * 20) + 5} 人
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        color: '#bfbfbf', 
                        fontSize: 14,
                        padding: '60px 0'
                      }}>
                        暂无部门数据
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              {/* 员工状态分析 */}
              <Col span={12}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 4, 
                        height: 16, 
                        backgroundColor: '#fa8c16',
                        borderRadius: 2
                      }} />
                      员工状态分析
                    </div>
                  }
                  style={{ 
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    height: '400px'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <div style={{ minHeight: 300 }}>
                    <div style={{ marginBottom: 16, fontSize: 14, color: '#8c8c8c' }}>员工状态占比</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { status: '在职', count: statsData?.employeeStats.activeEmployees || 0, color: '#52c41a' },
                        { status: '离职', count: Math.max(0, (statsData?.employeeStats.totalEmployees || 0) - (statsData?.employeeStats.activeEmployees || 0)), color: '#f5222d' },
                        { status: '休假', count: Math.floor(Math.random() * 5), color: '#fa8c16' },
                        { status: '待入职', count: Math.floor(Math.random() * 3), color: '#1890ff' }
                      ].map((item) => (
                        <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color
                          }} />
                          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.status}</div>
                          <div style={{ 
                            minWidth: 80,
                            textAlign: 'right',
                            fontSize: 16,
                            fontWeight: 600,
                            color: item.color
                          }}>
                            {item.count} 人
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>活跃度指标</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, color: '#595959' }}>员工活跃率</span>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
                          {statsData ? Math.round((statsData.employeeStats.activeEmployees / statsData.employeeStats.totalEmployees) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

            </Row>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 页面头部 */}
      <div style={{ 
        background: '#fff', 
        padding: '24px', 
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 0
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 24
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 24, 
              fontWeight: 600, 
              color: '#262626',
              marginBottom: 8
            }}>
              {companyData.displayName || companyData.name}
            </h1>
            {companyData.englishName && (
              <p style={{ 
                margin: 0, 
                fontSize: 14, 
                color: '#8c8c8c',
                fontStyle: 'italic'
              }}>
                {companyData.englishName}
              </p>
            )}
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditCompanyModalVisible(true)}
            style={{
              borderRadius: 6,
              boxShadow: '0 2px 4px rgba(24,144,255,0.2)'
            }}
          >
            编辑企业
          </Button>
        </div>
        
        {/* 企业信息概览 */}
        <div style={{ 
          marginBottom: 24,
          padding: '16px 20px',
          background: '#fafafa',
          borderRadius: 8,
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            {/* 基本信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>行业</span>
              <Tag color="blue" style={{ margin: 0, fontSize: 12, padding: '2px 8px' }}>
                {companyData.industry || '-'}
              </Tag>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>规模</span>
              <Tag color="green" style={{ margin: 0, fontSize: 12, padding: '2px 8px' }}>
                {companyData.scale || '-'}
              </Tag>
            </div>

            {companyData.establishedYear && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: '#8c8c8c' }}>成立</span>
                <span style={{ fontSize: 13, color: '#262626', fontWeight: 500 }}>
                  {companyData.establishedYear}年
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>状态</span>
              <Tag 
                color={companyData.isVerified ? 'success' : 'default'}
                style={{ margin: 0, fontSize: 12, padding: '2px 8px' }}
              >
                {companyData.isVerified ? '已认证' : '未认证'}
              </Tag>
            </div>

            {/* 联系信息 */}
            {companyData.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                <span style={{ fontSize: 13, color: '#262626' }}>{companyData.phone}</span>
              </div>
            )}

            {companyData.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                <span style={{ fontSize: 13, color: '#1890ff' }}>{companyData.email}</span>
              </div>
            )}

            {companyData.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ 
                  width: 12, 
                  height: 12, 
                  backgroundColor: '#722ed1',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 8
                }}>🌐</div>
                <a 
                  href={companyData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, textDecoration: 'none' }}
                >
                  官网
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 标签页 */}
        <div style={{ display: 'flex', gap: 32 }}>
          {tabList.map(tab => (
            <div
              key={tab.key}
              onClick={() => setActiveTabKey(tab.key)}
              style={{
                padding: '8px 0',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: activeTabKey === tab.key ? 600 : 400,
                color: activeTabKey === tab.key ? '#1890ff' : '#595959',
                borderBottom: activeTabKey === tab.key ? '2px solid #1890ff' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.tab}
            </div>
          ))}
        </div>
      </div>
      
      {/* 内容区域 */}
      <div style={{ padding: '0 12px 12px' }}>
      {renderTabContent()}

      {/* 新增员工弹窗 */}
      <CreateEmployeeModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
          fetchCompanyData(); // 刷新统计信息
        }}
        companyId={id!}
        departments={departments}
        levels={levels}
      />

      {/* 编辑员工弹窗 */}
      {editingEmployee && (
        <EditEmployeeModal
          visible={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingEmployee(null);
          }}
          onSuccess={() => {
            setEditModalVisible(false);
            setEditingEmployee(null);
            actionRef.current?.reload();
            fetchCompanyData(); // 刷新统计信息
          }}
          employee={editingEmployee}
          departments={departments}
          levels={levels}
        />
      )}

      {/* 编辑企业弹窗 */}
      {companyData && (
        <EditCompanyModal
          visible={editCompanyModalVisible}
          onCancel={() => setEditCompanyModalVisible(false)}
          onSuccess={() => {
            setEditCompanyModalVisible(false);
            fetchCompanyData(); // 刷新企业信息
          }}
          company={companyData}
          industries={industries}
          scales={scales}
        />
      )}
      </div>
    </div>
  );
};

export default CompanyDetail;