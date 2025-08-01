import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from '@umijs/max';
import { ProTable, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Drawer,
  Descriptions,
  Typography,
  Statistic,
  Row,
  Col,
  InputNumber,
  Alert,
  Select,
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  CreditCardOutlined,
  SyncOutlined,
  RollbackOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getWechatPaymentList,
  getWechatPaymentDetail,
  queryWechatPaymentStatus,
  refundWechatPayment,
  getWechatPaymentStats,
  type WechatPayment,
  type WechatPaymentStats,
  WechatPaymentStatus,
  WechatPaymentType,
  type RefundParams,
} from '@/services/wechatPaymentService';
import { getPlatformWechatAccounts } from '@/services/wechatAccountService';

const { Text } = Typography;
const { Option } = Select;

const WechatPaymentList: React.FC = () => {
  const actionRef = useRef<any>();
  const formRef = useRef<ProFormInstance>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<WechatPaymentStats | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<WechatPayment | null>(null);
  
  const [refundForm] = Form.useForm();

  // 平台和微信账号选择
  const [selectedWechatAccount, setSelectedWechatAccount] = useState<string>('');
  const [wechatAccounts, setWechatAccounts] = useState<any[]>([]);

  // 获取微信账号列表
  const fetchWechatAccounts = async () => {
    try {
      console.log('开始获取微信账号');
      const response = await getPlatformWechatAccounts('platform001'); // 使用固定的平台ID
      console.log('获取到的微信账号原始响应:', response);
      
      if (!response || !Array.isArray(response)) {
        console.warn('响应数据格式异常:', response);
        setWechatAccounts([]);
        return;
      }
      
      const paymentAccounts = response.filter((account: any) => account.enablePayment);
      console.log('支持支付的账号:', paymentAccounts);
      
      setWechatAccounts(response); // 先设置所有账号，不过滤支付功能
      
      if (response.length > 0 && !selectedWechatAccount) {
        setSelectedWechatAccount(response[0].accountId);
      }
    } catch (error) {
      console.error('获取微信账号列表失败:', error);
      message.error('获取微信账号列表失败');
      setWechatAccounts([]);
    }
  };

  // 初始化时获取微信账号列表
  useEffect(() => {
    fetchWechatAccounts();
  }, []);

  // 当选中的微信账号改变时，触发表格重新加载和统计数据刷新
  useEffect(() => {
    if (selectedWechatAccount && actionRef.current) {
      actionRef.current.reload();
      fetchStats();
    }
  }, [selectedWechatAccount]);

  useEffect(() => {
    fetchStats();
  }, []);

  // 处理从订单页面传递的URL参数
  useEffect(() => {
    const keyword = searchParams.get('keyword');
    const fromOrder = searchParams.get('fromOrder');
    
    if (keyword && fromOrder && formRef.current) {
      // 设置表单字段值
      formRef.current.setFieldsValue({
        keyword: keyword
      });
      // 提交表单以触发搜索
      formRef.current.submit();
    }
  }, [searchParams]);

  const fetchStats = async (startDate?: string, endDate?: string, accountId?: string) => {
    setStatsLoading(true);
    try {
      const response = await getWechatPaymentStats(accountId || selectedWechatAccount, startDate, endDate);
      setStats(response);
    } catch (error) {
      console.error('获取支付统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewDetail = async (payment: WechatPayment) => {
    try {
      const response = await getWechatPaymentDetail(selectedWechatAccount, payment._id);
      setCurrentPayment(response);
      setDetailDrawerVisible(true);
    } catch (error) {
      message.error('获取支付详情失败');
    }
  };

  const handleQueryStatus = async (payment: WechatPayment) => {
    try {
      await queryWechatPaymentStatus(selectedWechatAccount, payment.outTradeNo);
      message.success('查询成功，状态已同步');
      actionRef.current?.reload();
    } catch (error) {
      message.error('查询支付状态失败');
      console.error('查询支付状态失败:', error);
    }
  };

  const handleRefund = (payment: WechatPayment) => {
    setCurrentPayment(payment);
    refundForm.setFieldsValue({
      outTradeNo: payment.outTradeNo,
      refundFee: payment.totalFee / 100, // 转换为元
      reason: '',
    });
    setRefundModalVisible(true);
  };

  const handleRefundSubmit = async () => {
    if (!currentPayment) return;

    try {
      const values = await refundForm.validateFields();
      const refundData: RefundParams = {
        outTradeNo: values.outTradeNo,
        refundFee: Math.round(values.refundFee * 100), // 转换为分
        reason: values.reason,
      };

      await refundWechatPayment(selectedWechatAccount, refundData);
      message.success('退款申请成功');
      setRefundModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('退款申请失败');
      console.error('退款申请失败:', error);
    }
  };

  const handleViewOrder = (payment: WechatPayment) => {
    // 跳转到订单管理页面，并传递商户订单号作为URL参数
    navigate(`/orders?keyword=${encodeURIComponent(payment.orderNo)}&fromPayment=true`);
  };

  const getStatusColor = (status: WechatPaymentStatus) => {
    const colorMap: Record<WechatPaymentStatus, string> = {
      [WechatPaymentStatus.PENDING]: 'orange',
      [WechatPaymentStatus.PAID]: 'green',
      [WechatPaymentStatus.FAILED]: 'red',
      [WechatPaymentStatus.REFUNDING]: 'blue',
      [WechatPaymentStatus.REFUNDED]: 'purple',
      [WechatPaymentStatus.CANCELLED]: 'default',
    };
    return colorMap[status] || 'default';
  };

  const getPaymentTypeText = (type: WechatPaymentType) => {
    const typeMap: Record<WechatPaymentType, string> = {
      [WechatPaymentType.JSAPI]: '小程序支付',
      [WechatPaymentType.APP]: 'APP支付',
      [WechatPaymentType.NATIVE]: '扫码支付',
      [WechatPaymentType.H5]: 'H5支付',
    };
    return typeMap[type] || type;
  };

  const columns: ProColumns<WechatPayment>[] = [
    {
      title: '搜索',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: {
        placeholder: '搜索商户订单号或商品描述',
      },
    },
    {
      title: '支付状态',
      dataIndex: 'status',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        [WechatPaymentStatus.PENDING]: { text: '待支付' },
        [WechatPaymentStatus.PAID]: { text: '已支付' },
        [WechatPaymentStatus.FAILED]: { text: '支付失败' },
        [WechatPaymentStatus.REFUNDING]: { text: '退款中' },
        [WechatPaymentStatus.REFUNDED]: { text: '已退款' },
        [WechatPaymentStatus.CANCELLED]: { text: '已取消' },
      },
    },
    {
      title: '日期范围',
      dataIndex: 'dateRange',
      hideInTable: true,
      valueType: 'dateRange',
      search: {
        transform: (value) => {
          return {
            startDate: value[0],
            endDate: value[1],
          };
        },
      },
    },
    {
      title: '支付信息',
      key: 'paymentInfo',
      width: 200,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            <Text copyable={{ text: record.outTradeNo }}>
              {record.outTradeNo.length > 20 ? 
                `${record.outTradeNo.substring(0, 20)}...` : 
                record.outTradeNo}
            </Text>
          </div>
          {record.transactionId && (
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              <Text copyable={{ text: record.transactionId }}>
                微信订单号: {record.transactionId.substring(0, 10)}...
              </Text>
            </div>
          )}
          <div style={{ fontSize: 12, color: '#666' }}>
            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '商品描述',
      dataIndex: 'body',
      width: 150,
      search: false,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '支付金额',
      key: 'amount',
      width: 100,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#f50' }}>
            ¥{record.totalFeeYuan}
          </div>
          {record.cashFee && (
            <div style={{ fontSize: 12, color: '#666' }}>
              实付: ¥{record.cashFeeYuan}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '支付方式',
      dataIndex: 'paymentType',
      width: 100,
      search: false,
      render: (type: any) => (
        <Tag color="blue">
          {getPaymentTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '支付状态',
      dataIndex: 'status',
      width: 100,
      search: false,
      render: (status: any, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {record.statusText}
          </Tag>
          {record.timeEnd && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {dayjs(record.timeEnd).format('MM-DD HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '用户信息',
      key: 'userInfo',
      width: 150,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, color: '#666' }}>
            OpenID: {record.openid.substring(0, 8)}...
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            IP: {record.spbillCreateIp}
          </div>
        </div>
      ),
    },
    {
      title: '退款信息',
      key: 'refund',
      width: 120,
      search: false,
      render: (_, record) => (
        <div>
          {record.refundFee ? (
            <>
              <div style={{ fontSize: 12, color: '#f50' }}>
                退款: ¥{record.refundFeeYuan}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {record.refundStatus}
              </div>
            </>
          ) : (
            <span style={{ color: '#ccc' }}>无退款</span>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      search: false,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space size={4}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              详情
            </Button>
            <Button
              size="small"
              icon={<ShoppingOutlined />}
              onClick={() => handleViewOrder(record)}
              title="查看关联订单"
            >
              订单
            </Button>
            {record.status === WechatPaymentStatus.PENDING && (
              <Button
                size="small"
                icon={<SyncOutlined />}
                onClick={() => handleQueryStatus(record)}
              >
                同步
              </Button>
            )}
          </Space>
          {record.status === WechatPaymentStatus.PAID && !record.refundFee && (
            <Button
              size="small"
              danger
              icon={<RollbackOutlined />}
              onClick={() => handleRefund(record)}
              style={{
                border: 'none',
                boxShadow: 'none',
                color: '#fff',
                background: '#ff4d4f',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff7875';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ff4d4f';
              }}
            >
              退款
            </Button>
          )}
        </Space>
      ),
    },
  ];

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
                onChange={(value) => {
                  setSelectedWechatAccount(value);
                }}
                placeholder={wechatAccounts.length === 0 ? "暂无可用的微信账号" : "请选择微信账号"}
                notFoundContent={wechatAccounts.length === 0 ? "暂无数据，请先创建微信账号" : "未找到匹配项"}
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
          {wechatAccounts.find(account => account.accountId === selectedWechatAccount) && (
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
                    text: wechatAccounts.find(account => account.accountId === selectedWechatAccount)?.appId,
                    tooltips: ['复制 AppID', '已复制']
                  }} 
                  style={{ 
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#262626'
                  }}
                >
                  {wechatAccounts.find(account => account.accountId === selectedWechatAccount)?.appId}
                </Text>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 统计卡片 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总支付笔数"
                value={stats.total}
                prefix={<CreditCardOutlined />}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总支付金额"
                value={stats.totalAmountYuan}
                prefix={<DollarOutlined />}
                precision={2}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="成功支付"
                value={stats.statusStats[WechatPaymentStatus.PAID]?.count || 0}
                valueStyle={{ color: '#3f8600' }}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待支付"
                value={stats.statusStats[WechatPaymentStatus.PENDING]?.count || 0}
                valueStyle={{ color: '#faad14' }}
                loading={statsLoading}
              />
            </Card>
          </Col>
        </Row>
      )}

      <ProTable<WechatPayment>
        actionRef={actionRef}
        formRef={formRef}
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
            // 更新统计数据（当日期范围改变时）
            if (params.startDate || params.endDate) {
              fetchStats(params.startDate, params.endDate, selectedWechatAccount);
            }

            const response = await getWechatPaymentList({
              accountId: selectedWechatAccount, // 传递选中的微信账号ID
              page: params.current || 1,
              limit: params.pageSize || 20,
              keyword: params.keyword,
              status: params.status,
              startDate: params.startDate,
              endDate: params.endDate,
            });
            
            return {
              data: response.payments,
              success: true,
              total: response.pagination.total,
            };
          } catch (error) {
            message.error('获取支付记录失败');
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
        headerTitle={`微信支付记录${
          wechatAccounts.find(account => account.accountId === selectedWechatAccount)
            ? ` - ${wechatAccounts.find(account => account.accountId === selectedWechatAccount)?.displayName}`
            : ''
        }`}
        toolBarRender={() => {
          const fromOrder = searchParams.get('fromOrder');
          const buttons = [];
          
          // 如果是从订单页面跳转过来的，显示返回按钮
          if (fromOrder) {
            buttons.push(
              <Button
                key="back"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/orders')}
              >
                返回订单
              </Button>
            );
          }
          
          return buttons;
        }}
        options={{
          reload: true,
          density: true,
          setting: true,
        }}
        scroll={{ x: 1200 }}
      />

      {/* 支付详情抽屉 */}
      <Drawer
        title="支付详情"
        placement="right"
        width={500}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {currentPayment && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="商户订单号">
                <Text copyable>{currentPayment.outTradeNo}</Text>
              </Descriptions.Item>
              
              {currentPayment.transactionId && (
                <Descriptions.Item label="微信订单号">
                  <Text copyable>{currentPayment.transactionId}</Text>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="商品描述">
                {currentPayment.body}
              </Descriptions.Item>
              
              {currentPayment.detail && (
                <Descriptions.Item label="商品详情">
                  {currentPayment.detail}
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="支付金额">
                ¥{currentPayment.totalFeeYuan}
              </Descriptions.Item>
              
              <Descriptions.Item label="货币类型">
                {currentPayment.currency}
              </Descriptions.Item>
              
              <Descriptions.Item label="支付方式">
                <Tag color="blue">
                  {getPaymentTypeText(currentPayment.paymentType)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="支付状态">
                <Tag color={getStatusColor(currentPayment.status)}>
                  {currentPayment.statusText}
                </Tag>
              </Descriptions.Item>
              
              {currentPayment.prepayId && (
                <Descriptions.Item label="预支付ID">
                  <Text copyable>{currentPayment.prepayId}</Text>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="用户OpenID">
                <Text copyable>{currentPayment.openid}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="终端IP">
                {currentPayment.spbillCreateIp}
              </Descriptions.Item>
              
              <Descriptions.Item label="回调地址">
                {currentPayment.notifyUrl}
              </Descriptions.Item>
              
              {currentPayment.timeEnd && (
                <Descriptions.Item label="支付完成时间">
                  {dayjs(currentPayment.timeEnd).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
              
              {currentPayment.cashFee && (
                <Descriptions.Item label="现金支付金额">
                  ¥{currentPayment.cashFeeYuan}
                </Descriptions.Item>
              )}
              
              {currentPayment.refundFee && (
                <>
                  <Descriptions.Item label="退款金额">
                    ¥{currentPayment.refundFeeYuan}
                  </Descriptions.Item>
                  
                  {currentPayment.refundId && (
                    <Descriptions.Item label="退款单号">
                      <Text copyable>{currentPayment.refundId}</Text>
                    </Descriptions.Item>
                  )}
                  
                  {currentPayment.refundReason && (
                    <Descriptions.Item label="退款原因">
                      {currentPayment.refundReason}
                    </Descriptions.Item>
                  )}
                  
                  {currentPayment.refundSuccessTime && (
                    <Descriptions.Item label="退款成功时间">
                      {dayjs(currentPayment.refundSuccessTime).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  )}
                </>
              )}
              
              {currentPayment.attach && (
                <Descriptions.Item label="附加数据">
                  {currentPayment.attach}
                </Descriptions.Item>
              )}
              
              {currentPayment.errCode && (
                <Descriptions.Item label="错误信息">
                  <Alert
                    message={`错误码: ${currentPayment.errCode}`}
                    description={currentPayment.errCodeDes}
                    type="error"
                    showIcon
                  />
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="创建时间">
                {dayjs(currentPayment.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              
              <Descriptions.Item label="更新时间">
                {dayjs(currentPayment.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* 退款模态框 */}
      <Modal
        title="申请退款"
        open={refundModalVisible}
        onOk={handleRefundSubmit}
        onCancel={() => setRefundModalVisible(false)}
        width={600}
      >
        <Alert
          message="退款说明"
          description="退款将原路返回到用户的支付账户，一般1-3个工作日到账。请谨慎操作。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form form={refundForm} layout="vertical">
          <Form.Item
            name="outTradeNo"
            label="商户订单号"
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="refundFee"
            label="退款金额（元）"
            rules={[
              { required: true, message: '请输入退款金额' },
              { type: 'number', min: 0.01, message: '退款金额必须大于0.01元' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              precision={2}
              placeholder="请输入退款金额"
            />
          </Form.Item>
          
          <Form.Item name="reason" label="退款原因">
            <Input.TextArea
              rows={3}
              placeholder="请输入退款原因（可选）"
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WechatPaymentList;