import React, { useState, useRef } from 'react';
import {
  ProTable,
  ProColumns,
  ActionType
} from '@ant-design/pro-components';
import {
  Button,
  Space,
  Tag,
  Image,
  Popconfirm,
  message,
  Modal,
  Switch,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  FireOutlined
} from '@ant-design/icons';
import {
  getProductList,
  deleteProduct,
  batchDeleteProducts,
  batchUpdateStatus,
  updateProduct,
  Product,
  ProductStatus,
  CourseType,
  CourseDifficulty,
  ProductQueryParams
} from '@/services/productService';
import ProductFormModal from '@/components/ProductFormModal';

const ProductManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  // 课程状态选项
  const statusOptions = [
    { text: '草稿', value: ProductStatus.DRAFT, color: 'default' },
    { text: '上架', value: ProductStatus.ACTIVE, color: 'success' },
    { text: '下架', value: ProductStatus.INACTIVE, color: 'warning' },
    { text: '已删除', value: ProductStatus.DELETED, color: 'default' },
  ];

  // 课程类型选项
  const courseTypeOptions = [
    { text: '视频课程', value: CourseType.VIDEO },
    { text: '音频课程', value: CourseType.AUDIO },
    { text: '直播课程', value: CourseType.LIVE },
    { text: '图文课程', value: CourseType.TEXT },
    { text: '混合型课程', value: CourseType.MIXED },
  ];

  // 课程难度选项
  const difficultyOptions = [
    { text: '初级', value: CourseDifficulty.BEGINNER },
    { text: '中级', value: CourseDifficulty.INTERMEDIATE },
    { text: '高级', value: CourseDifficulty.ADVANCED },
    { text: '专家级', value: CourseDifficulty.EXPERT },
  ];

  // 获取状态标签
  const getStatusTag = (status: ProductStatus) => {
    const option = statusOptions.find(item => item.value === status);
    return <Tag color={option?.color}>{option?.text}</Tag>;
  };

  // 获取课程类型标签
  const getCourseTypeTag = (courseType: CourseType) => {
    const option = courseTypeOptions.find(item => item.value === courseType);
    return <Tag color="blue">{option?.text}</Tag>;
  };

  // 获取难度标签
  const getDifficultyTag = (difficulty: CourseDifficulty) => {
    const option = difficultyOptions.find(item => item.value === difficulty);
    const colorMap = {
      [CourseDifficulty.BEGINNER]: 'green',
      [CourseDifficulty.INTERMEDIATE]: 'orange',
      [CourseDifficulty.ADVANCED]: 'red',
      [CourseDifficulty.EXPERT]: 'purple',
    };
    return <Tag color={colorMap[difficulty]}>{option?.text}</Tag>;
  };

  // 打开新建弹窗
  const handleCreate = () => {
    setModalMode('create');
    setEditingProductId(undefined);
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (productId: string) => {
    setModalMode('edit');
    setEditingProductId(productId);
    setModalVisible(true);
  };

  // 打开查看弹窗
  const handleView = (productId: string) => {
    setModalMode('view');
    setEditingProductId(productId);
    setModalVisible(true);
  };

  // 弹窗成功回调
  const handleModalSuccess = () => {
    actionRef.current?.reload();
  };

  // 删除课程
  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的课程');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个课程吗？`,
      onOk: async () => {
        try {
          await batchDeleteProducts(selectedRowKeys);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          actionRef.current?.reload();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 批量更新状态
  const handleBatchUpdateStatus = async (status: ProductStatus) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的课程');
      return;
    }

    try {
      await batchUpdateStatus(selectedRowKeys, status);
      message.success('批量操作成功');
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch (error) {
      message.error('批量操作失败');
    }
  };

  // 切换推荐状态
  const handleToggleRecommended = async (record: Product, checked: boolean) => {
    try {
      await updateProduct(record.productId, { isRecommended: checked });
      message.success(checked ? '设为推荐成功' : '取消推荐成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 切换精选状态
  const handleToggleFeatured = async (record: Product, checked: boolean) => {
    try {
      await updateProduct(record.productId, { isFeatured: checked });
      message.success(checked ? '设为精选成功' : '取消精选成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ProColumns<Product>[] = [
    {
      title: '课程信息',
      dataIndex: 'name',
      width: 300,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src={record.images[0]}
            alt={record.name}
            width={60}
            height={60}
            style={{ marginRight: 12, borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4Z6FqIKaECzFCx5hQYBMEGJNJSdOQEBCiiCQyYGQI7G2ChIJh0gIhEKGJEiGTiGDlBsBSZFMZdBcLMaAmHn/QM6pGFGBRBPOazEBJb4D+jJtQAgBD9C4QhZEjDAWM1AYYsZoNIJyHohZEbDKAAHGDGMjdPjL0MUZjdHRBxhjzIgGbCAMGDOGsSHCW"
          />
          <div style={{ marginLeft: 10 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.name}</div>
            <div style={{ color: '#666', fontSize: 12 }}>
              课程编号: {record.productId}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              讲师: {record.instructor}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              学员: {record.stats?.studentCount || 0} | 评分: {record.stats?.avgRating || 0}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'priceRange',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
            {record.priceRange || '免费'}
          </div>
          {record.membershipPricing?.length > 0 && (
            <div style={{ color: '#999', fontSize: 12 }}>
              {record.membershipPricing.length}个套餐
            </div>
          )}
        </div>
      ),
    },
    {
      title: '课程信息',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div style={{ fontSize: 12 }}>
            章节: {record.stats?.chapterCount || 0}
          </div>
          <div style={{ fontSize: 12 }}>
            时长: {record.totalDurationText || '未设置'}
          </div>
          <div style={{ fontSize: 12 }}>
            评分: {record.stats?.avgRating?.toFixed(1) || '0.0'}/5.0
          </div>
        </Space>
      ),
    },
    {
      title: '类型/难度',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {getCourseTypeTag(record.courseType)}
          {getDifficultyTag(record.difficulty)}
        </Space>
      ),
      filters: [
        ...courseTypeOptions.map(option => ({ text: option.text, value: option.value })),
        ...difficultyOptions.map(option => ({ text: option.text, value: option.value }))
      ],
      onFilter: (value, record) => record.courseType === value || record.difficulty === value,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => getStatusTag(record.status),
      filters: statusOptions.filter(item => item.value !== ProductStatus.DELETED),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '标签',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.isRecommended && (
            <Tag icon={<StarOutlined />} color="gold">推荐</Tag>
          )}
          {record.isFeatured && (
            <Tag icon={<FireOutlined />} color="red">精选</Tag>
          )}
          {record.isFreeTrialEnabled && (
            <Tag color="green">免费试学</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="推荐">
            <Switch
              size="small"
              checked={record.isRecommended}
              onChange={(checked) => handleToggleRecommended(record, checked)}
            />
          </Tooltip>
          <Tooltip title="精选">
            <Switch
              size="small"
              checked={record.isFeatured}
              onChange={(checked) => handleToggleFeatured(record, checked)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button
          key="view"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleView(record.productId)}
        >
          查看
        </Button>,
        <Button
          key="edit"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record.productId)}
        >
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这个课程吗？"
          onConfirm={() => handleDelete(record.productId)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Product>
        columns={columns}
        actionRef={actionRef}
        rowKey="productId"
        search={{
          labelWidth: 'auto',
        }}
        request={async (params, sort) => {
          const queryParams: ProductQueryParams = {
            page: params.current,
            limit: params.pageSize,
            keyword: params.name,
            status: params.status as ProductStatus,
            courseType: params.courseType as CourseType,
            difficulty: params.difficulty as CourseDifficulty,
            sortBy: Object.keys(sort || {})[0] as any,
            sortOrder: Object.values(sort || {})[0] === 'ascend' ? 'asc' : 'desc',
          };

          const response = await getProductList(queryParams);
          return {
            data: response.products,
            success: true,
            total: response.total,
          };
        }}
        columnsState={{
          persistenceKey: 'product-management-table',
          persistenceType: 'localStorage',
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <a onClick={handleBatchDelete}>批量删除</a>
            <a onClick={() => handleBatchUpdateStatus(ProductStatus.ACTIVE)}>
              批量上架
            </a>
            <a onClick={() => handleBatchUpdateStatus(ProductStatus.INACTIVE)}>
              批量下架
            </a>
          </Space>
        )}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建课程
          </Button>,
        ]}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <ProductFormModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
        productId={editingProductId}
        readonly={modalMode === 'view'}
      />
    </>
  );
};

export default ProductManagement;