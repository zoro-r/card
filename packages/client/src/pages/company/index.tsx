import React, { useRef, useState, useEffect } from 'react';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, message, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { getCompanyList, deleteCompany, getIndustries, getScales, type CompanyItem } from '@/services/company';
import CreateCompanyModal from './components/CreateCompanyModal';
import EditCompanyModal from './components/EditCompanyModal';

const CompanyList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [scales, setScales] = useState<string[]>([]);

  // 获取筛选选项
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [industriesData, scalesData] = await Promise.all([
          getIndustries(),
          getScales(),
        ]);
        setIndustries(industriesData);
        setScales(scalesData);
      } catch (error) {
        console.error('获取选项失败:', error);
      }
    };
    fetchOptions();
  }, []);


  // 查看详情
  const handleViewDetail = (record: CompanyItem) => {
    navigate(`/company/detail?id=${record._id}`);
  };

  // 编辑企业（暂时跳转到详情页面，后续可以添加编辑页面）
  const handleEdit = (record: CompanyItem) => {
    navigate(`/company/detail?id=${record._id}&mode=edit`);
  };

  const columns: ProColumns<CompanyItem>[] = [
    {
      title: '企业名称',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#262626' }}>{text}</div>
          {record.displayName && record.displayName !== record.name && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.displayName}</div>
          )}
        </div>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      width: 120,
      valueType: 'select',
      valueEnum: industries.reduce((acc, item) => {
        acc[item] = { text: item };
        return acc;
      }, {} as Record<string, { text: string }>),
    },
    {
      title: '规模',
      dataIndex: 'scale',
      width: 100,
      valueType: 'select',
      valueEnum: scales.reduce((acc, item) => {
        acc[item] = { text: item };
        return acc;
      }, {} as Record<string, { text: string }>),
    },
    {
      title: '状态',
      dataIndex: 'isVerified',
      width: 80,
      valueType: 'select',
      valueEnum: {
        true: { text: '已认证', status: 'Success' },
        false: { text: '未认证', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.isVerified ? 'green' : 'default'}>
          {record.isVerified ? '已认证' : '未认证'}
        </Tag>
      ),
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      width: 100,
      search: false,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      width: 120,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => [
        <Tooltip key="view" title="查看详情">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Tooltip>,
        <Tooltip key="edit" title="编辑企业">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="确认删除"
          description={`确定要删除企业"${record.name}"吗？删除后不可恢复。`}
          onConfirm={async () => {
            try {
              await deleteCompany(record._id);
              message.success('删除成功');
              actionRef.current?.reload();
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
        </Popconfirm>,
      ]
    },
  ];

  return (
    <>
      <ProTable<CompanyItem>
        headerTitle="企业管理"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建企业
          </Button>,
        ]}
        request={async (params, sorter) => {
          try {
            const { current, pageSize, ...searchParams } = params;
            const result = await getCompanyList({
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
            message.error('获取企业列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
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

      <CreateCompanyModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
        }}
        industries={industries}
        scales={scales}
      />

      <EditCompanyModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingCompany(null);
        }}
        onSuccess={() => {
          setEditModalVisible(false);
          setEditingCompany(null);
          actionRef.current?.reload();
        }}
        company={editingCompany}
        industries={industries}
        scales={scales}
      />
    </>
  );
};

export default CompanyList;