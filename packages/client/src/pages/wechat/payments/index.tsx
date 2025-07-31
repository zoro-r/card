import React, { useState, useRef, useEffect } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
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
} from 'antd';
import {
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  CreditCardOutlined,
  SyncOutlined,
  RollbackOutlined,
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

const { Text } = Typography;

const WechatPaymentList: React.FC = () => {
  const actionRef = useRef<any>();
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<WechatPaymentStats | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<WechatPayment | null>(null);
  
  const [refundForm] = Form.useForm();

  // 假设从路由或上下文获取 platformId
  const [platformId] = useState('platform001');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (startDate?: string, endDate?: string) => {
    setStatsLoading(true);
    try {
      const response = await getWechatPaymentStats(platformId, startDate, endDate);
      
      // request工具已经处理了响应格式，直接使用response
      setStats(response);
    } catch (error) {
      console.error('获取支付统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewDetail = async (payment: WechatPayment) => {
    try {
      const response = await getWechatPaymentDetail(platformId, payment._id);
      setCurrentPayment(response);
      setDetailDrawerVisible(true);
    } catch (error) {
      message.error('获取支付详情失败');
    }
  };

  const handleQueryStatus = async (payment: WechatPayment) => {
    try {
      await queryWechatPaymentStatus(platformId, payment.outTradeNo);
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

      await refundWechatPayment(platformId, refundData);
      message.success('退款申请成功');
      setRefundModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('退款申请失败');
      console.error('退款申请失败:', error);
    }
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
      formItemProps: {
        // placeholder: '搜索商户订单号或商品描述',
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
            <Tooltip title="查看详情">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            {record.status === WechatPaymentStatus.PENDING && (
              <Tooltip title="同步状态">
                <Button
                  type="text"
                  size="small"
                  icon={<SyncOutlined />}
                  onClick={() => handleQueryStatus(record)}
                />
              </Tooltip>
            )}
          </Space>
          {record.status === WechatPaymentStatus.PAID && !record.refundFee && (
            <Button
              size="small"
              type="primary"
              danger
              icon={<RollbackOutlined />}
              onClick={() => handleRefund(record)}
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
        columns={columns}
        request={async (params) => {
          try {
            // 更新统计数据（当日期范围改变时）
            if (params.startDate || params.endDate) {
              fetchStats(params.startDate, params.endDate);
            }

            const response = await getWechatPaymentList({
              platformId,
              page: params.current || 1,
              limit: params.pageSize || 20,
              keyword: params.keyword,
              status: params.status,
              startDate: params.startDate,
              endDate: params.endDate,
            });
            
            // request工具已经处理了响应格式，直接使用response
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
        headerTitle="微信支付记录"
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
        width={500}
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