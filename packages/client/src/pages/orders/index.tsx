import React, { useState, useRef, useEffect } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Input,
  message,
  Tooltip,
  Drawer,
  Descriptions,
  Typography,
  Statistic,
  Row,
  Col,
  Image,
  Steps,
  Timeline,
  Divider,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getOrderList,
  getOrderDetail,
  shipOrder,
  updateOrderRemark,
  getOrderStats,
  type Order,
  type OrderStats,
  OrderStatus,
  PaymentMethod,
  type ShipOrderParams,
} from '@/services/orderService';

const { Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const OrderList: React.FC = () => {
  const actionRef = useRef<any>();
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  const [shipForm] = Form.useForm();
  const [remarkForm] = Form.useForm();

  // 假设从路由或上下文获取 platformId
  const [platformId] = useState('platform001');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (startDate?: string, endDate?: string) => {
    setStatsLoading(true);
    try {
      const response = await getOrderStats(platformId, startDate, endDate);
      
      // request工具已经处理了响应格式，直接使用response
      setStats(response);
    } catch (error) {
      console.error('获取订单统计失败:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const response = await getOrderDetail(order.orderNo);
      setCurrentOrder(response);
      setDetailDrawerVisible(true);
    } catch (error) {
      message.error('获取订单详情失败');
    }
  };

  const handleShip = (order: Order) => {
    setCurrentOrder(order);
    shipForm.resetFields();
    setShipModalVisible(true);
  };

  const handleShipSubmit = async () => {
    if (!currentOrder) return;

    try {
      const values = await shipForm.validateFields();
      await shipOrder(currentOrder.orderNo, values);
      message.success('发货成功');
      setShipModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('发货失败');
      console.error('发货失败:', error);
    }
  };

  const handleRemark = (order: Order) => {
    setCurrentOrder(order);
    remarkForm.setFieldsValue({
      sellerMessage: order.sellerMessage,
    });
    setRemarkModalVisible(true);
  };

  const handleRemarkSubmit = async () => {
    if (!currentOrder) return;

    try {
      const values = await remarkForm.validateFields();
      await updateOrderRemark(currentOrder.orderNo, values.sellerMessage);
      message.success('更新备注成功');
      setRemarkModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error('更新备注失败');
      console.error('更新备注失败:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colorMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'orange',
      [OrderStatus.PAID]: 'blue',
      [OrderStatus.SHIPPED]: 'cyan',
      [OrderStatus.DELIVERED]: 'green',
      [OrderStatus.CANCELLED]: 'red',
      [OrderStatus.REFUNDED]: 'purple',
      [OrderStatus.COMPLETED]: 'success',
    };
    return colorMap[status] || 'default';
  };

  const getOrderSteps = (order: Order) => {
    const steps = [
      {
        title: '创建订单',
        description: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
        status: 'finish',
      },
    ];

    if (order.paymentTime) {
      steps.push({
        title: '支付完成',
        description: dayjs(order.paymentTime).format('YYYY-MM-DD HH:mm'),
        status: 'finish',
      });
    }

    if (order.shippingTime) {
      steps.push({
        title: '已发货',
        description: dayjs(order.shippingTime).format('YYYY-MM-DD HH:mm'),
        status: 'finish',
      });
    }

    if (order.deliveryTime) {
      steps.push({
        title: '已收货',
        description: dayjs(order.deliveryTime).format('YYYY-MM-DD HH:mm'),
        status: 'finish',
      });
    }

    // 根据订单状态添加当前步骤
    if (order.status === OrderStatus.PENDING) {
      steps.push({
        title: '待支付',
        description: '等待用户支付',
        status: 'process',
      });
    } else if (order.status === OrderStatus.PAID && !order.shippingTime) {
      steps.push({
        title: '待发货',
        description: '等待商家发货',
        status: 'process',
      });
    } else if (order.status === OrderStatus.SHIPPED && !order.deliveryTime) {
      steps.push({
        title: '待收货',
        description: '等待用户确认收货',
        status: 'process',
      });
    }

    return steps;
  };

  const columns: ProColumns<Order>[] = [
    {
      title: '搜索',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: {
        placeholder: '搜索订单号或商品名称',
      },
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        [OrderStatus.PENDING]: { text: '待支付' },
        [OrderStatus.PAID]: { text: '已支付' },
        [OrderStatus.SHIPPED]: { text: '已发货' },
        [OrderStatus.DELIVERED]: { text: '已收货' },
        [OrderStatus.CANCELLED]: { text: '已取消' },
        [OrderStatus.REFUNDED]: { text: '已退款' },
        [OrderStatus.COMPLETED]: { text: '已完成' },
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
      title: '订单信息',
      key: 'orderInfo',
      width: 200,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.orderNo}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.itemCount} 件商品
          </div>
        </div>
      ),
    },
    {
      title: '商品信息',
      key: 'items',
      width: 250,
      search: false,
      render: (_, record) => (
        <div>
          {record.items.slice(0, 2).map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              {item.productImage && (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={30}
                  height={30}
                  style={{ marginRight: 8, borderRadius: 4 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#333' }} title={item.productName}>
                  {item.productName.length > 20 ? 
                    `${item.productName.substring(0, 20)}...` : 
                    item.productName}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  ¥{item.unitPriceYuan} × {item.quantity}
                </div>
              </div>
            </div>
          ))}
          {record.items.length > 2 && (
            <div style={{ fontSize: 12, color: '#666' }}>
              还有 {record.items.length - 2} 件商品...
            </div>
          )}
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmountYuan',
      width: 100,
      search: false,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#f50' }}>
            ¥{text}
          </div>
          {record.paymentMethod && (
            <Tag color="blue">
              {record.paymentMethod === PaymentMethod.WECHAT ? '微信支付' : record.paymentMethod}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 100,
      search: false,
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {record.statusText}
          </Tag>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {record.paymentStatus === 'PAID' ? '已支付' : '未支付'}
          </div>
        </div>
      ),
    },
    {
      title: '收货信息',
      key: 'shipping',
      width: 150,
      search: false,
      render: (_, record) => (
        <div>
          {record.shippingAddress ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 500 }}>
                {record.shippingAddress.receiverName}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {record.shippingAddress.receiverPhone}
              </div>
              <div style={{ fontSize: 11, color: '#666' }} title={
                `${record.shippingAddress.province}${record.shippingAddress.city}${record.shippingAddress.district}${record.shippingAddress.address}`
              }>
                {record.shippingAddress.city}...
              </div>
            </>
          ) : (
            <span style={{ color: '#ccc' }}>无收货信息</span>
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
            <Tooltip title="备注">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleRemark(record)}
              />
            </Tooltip>
          </Space>
          {record.status === OrderStatus.PAID && (
            <Button
              size="small"
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => handleShip(record)}
            >
              发货
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
                title="总订单数"
                value={stats.total}
                prefix={<ShoppingCartOutlined />}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总金额"
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
                title="待支付"
                value={stats.statusStats[OrderStatus.PENDING]?.count || 0}
                valueStyle={{ color: '#faad14' }}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待发货"
                value={stats.statusStats[OrderStatus.PAID]?.count || 0}
                valueStyle={{ color: '#1890ff' }}
                loading={statsLoading}
              />
            </Card>
          </Col>
        </Row>
      )}

      <ProTable<Order>
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            // 更新统计数据（当日期范围改变时）
            if (params.startDate || params.endDate) {
              fetchStats(params.startDate, params.endDate);
            }

            const response = await getOrderList({
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
              data: response.orders,
              success: true,
              total: response.pagination.total,
            };
          } catch (error) {
            message.error('获取订单列表失败');
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
        headerTitle="订单列表"
        scroll={{ x: 1200 }}
      />

      {/* 订单详情抽屉 */}
      <Drawer
        title="订单详情"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {currentOrder && (
          <div>
            {/* 订单状态步骤 */}
            <Card title="订单状态" style={{ marginBottom: 16 }}>
              <Steps
                direction="vertical"
                size="small"
                items={getOrderSteps(currentOrder)}
              />
            </Card>

            {/* 基本信息 */}
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="订单号" span={2}>
                  <Text copyable>{currentOrder.orderNo}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="订单状态">
                  <Tag color={getStatusColor(currentOrder.status)}>
                    {currentOrder.statusText}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="支付状态">
                  {currentOrder.paymentStatus === 'PAID' ? (
                    <Tag color="green">已支付</Tag>
                  ) : (
                    <Tag color="orange">未支付</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="订单金额">
                  ¥{currentOrder.totalAmountYuan}
                </Descriptions.Item>
                <Descriptions.Item label="支付方式">
                  {currentOrder.paymentMethod || '未选择'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间" span={2}>
                  {dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 商品信息 */}
            <Card title="商品信息" style={{ marginBottom: 16 }}>
              {currentOrder.items.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 0',
                  borderBottom: index < currentOrder.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  {item.productImage && (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={60}
                      height={60}
                      style={{ marginRight: 12, borderRadius: 4 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {item.productName}
                    </div>
                    {item.skuName && (
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        规格: {item.skuName}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#666' }}>
                      ¥{item.unitPriceYuan} × {item.quantity} = ¥{item.totalPriceYuan}
                    </div>
                  </div>
                </div>
              ))}
              <Divider />
              <div style={{ textAlign: 'right' }}>
                <Space direction="vertical" size={4}>
                  <div>商品小计: ¥{currentOrder.subtotalYuan}</div>
                  <div>运费: ¥{currentOrder.shippingFeeYuan}</div>
                  {currentOrder.discountAmount > 0 && (
                    <div style={{ color: '#f50' }}>
                      优惠: -¥{currentOrder.discountAmountYuan}
                    </div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#f50' }}>
                    总计: ¥{currentOrder.totalAmountYuan}
                  </div>
                </Space>
              </div>
            </Card>

            {/* 收货信息 */}
            {currentOrder.shippingAddress && (
              <Card title="收货信息" style={{ marginBottom: 16 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="收货人">
                    {currentOrder.shippingAddress.receiverName}
                  </Descriptions.Item>
                  <Descriptions.Item label="联系电话">
                    {currentOrder.shippingAddress.receiverPhone}
                  </Descriptions.Item>
                  <Descriptions.Item label="收货地址">
                    {currentOrder.shippingAddress.province}
                    {currentOrder.shippingAddress.city}
                    {currentOrder.shippingAddress.district}
                    {currentOrder.shippingAddress.address}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* 物流信息 */}
            {currentOrder.logistics && (
              <Card title="物流信息" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="物流公司">
                    {currentOrder.logistics.company}
                  </Descriptions.Item>
                  <Descriptions.Item label="运单号">
                    <Text copyable>{currentOrder.logistics.trackingNumber}</Text>
                  </Descriptions.Item>
                </Descriptions>
                {currentOrder.logistics.tracks && (
                  <Timeline style={{ marginTop: 16 }}>
                    {currentOrder.logistics.tracks.map((track, index) => (
                      <Timeline.Item key={index}>
                        <div>{track.description}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {dayjs(track.time).format('YYYY-MM-DD HH:mm')}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}
              </Card>
            )}

            {/* 备注信息 */}
            <Card title="备注信息">
              <Descriptions column={1} size="small">
                {currentOrder.buyerMessage && (
                  <Descriptions.Item label="买家留言">
                    {currentOrder.buyerMessage}
                  </Descriptions.Item>
                )}
                {currentOrder.sellerMessage && (
                  <Descriptions.Item label="卖家备注">
                    {currentOrder.sellerMessage}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 发货模态框 */}
      <Modal
        title="订单发货"
        open={shipModalVisible}
        onOk={handleShipSubmit}
        onCancel={() => setShipModalVisible(false)}
        width={500}
      >
        <Form form={shipForm} layout="vertical">
          <Form.Item
            name="company"
            label="物流公司"
            rules={[{ required: true, message: '请输入物流公司' }]}
          >
            <Select placeholder="请选择物流公司">
              <Option value="顺丰速运">顺丰速运</Option>
              <Option value="圆通速递">圆通速递</Option>
              <Option value="中通快递">中通快递</Option>
              <Option value="申通快递">申通快递</Option>
              <Option value="韵达速递">韵达速递</Option>
              <Option value="邮政EMS">邮政EMS</Option>
              <Option value="德邦快递">德邦快递</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="trackingNumber"
            label="运单号"
            rules={[{ required: true, message: '请输入运单号' }]}
          >
            <Input placeholder="请输入运单号" />
          </Form.Item>
          
          <Form.Item name="description" label="发货说明">
            <Input.TextArea
              rows={3}
              placeholder="请输入发货说明（可选）"
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 备注模态框 */}
      <Modal
        title="订单备注"
        open={remarkModalVisible}
        onOk={handleRemarkSubmit}
        onCancel={() => setRemarkModalVisible(false)}
        width={500}
      >
        <Form form={remarkForm} layout="vertical">
          <Form.Item name="sellerMessage" label="卖家备注">
            <Input.TextArea
              rows={4}
              placeholder="请输入备注信息"
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList;