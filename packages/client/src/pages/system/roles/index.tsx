import React, { useState, useRef, useEffect } from 'react';
import { ProTable } from "@ant-design/pro-components";
import { Button, Space, Popconfirm, message, Tag, Modal, Form, Input, Select, Tree } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const statusMap = {
  active: { color: 'green', text: '正常' },
  disabled: { color: 'red', text: '禁用' }
};

interface RoleFormData {
  name: string;
  code: string;
  description?: string;
  status: string;
  menuIds: string[];
}

function RoleManagement() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const actionRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();
  const [menuTreeData, setMenuTreeData] = useState<any[]>([]);
  const [checkedMenus, setCheckedMenus] = useState<string[]>([]);

  // 加载菜单树数据
  const loadMenuTree = async () => {
    try {
      const response = await request('/api/menus/tree');
      const treeData = convertMenusToTreeData(response || []);
      setMenuTreeData(treeData);
    } catch (error) {
      console.error('加载菜单树失败:', error);
    }
  };

  // 转换菜单数据格式用于Tree组件
  const convertMenusToTreeData = (menus: any[]): any[] => {
    return menus.map(menu => ({
      title: menu.name,
      key: menu.uuid,
      children: menu.children && menu.children.length > 0 ? convertMenusToTreeData(menu.children) : undefined
    }));
  };

  // 显示新增/编辑模态框
  const showModal = async (record?: any) => {
    setEditingRole(record);
    setModalVisible(true);
    
    if (record) {
      // 编辑时获取角色详情
      try {
        const roleDetail = await request(`/api/roles/${record.uuid}`);
        form.setFieldsValue({
          name: roleDetail.name,
          code: roleDetail.code,
          description: roleDetail.description,
          status: roleDetail.status
        });
        setCheckedMenus(roleDetail.menuIds || []);
      } catch (error) {
        message.error('获取角色详情失败');
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 'active'
      });
      setCheckedMenus([]);
    }
  };

  // 保存角色
  const handleSave = async (values: Omit<RoleFormData, 'menuIds'>) => {
    try {
      const roleData = {
        ...values,
        menuIds: checkedMenus
      };

      if (editingRole) {
        await request(`/api/roles/${editingRole.uuid}`, {
          method: 'PUT',
          data: roleData
        });
        message.success('更新成功');
      } else {
        await request('/api/roles', {
          method: 'POST',
          data: roleData
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  // 删除单个角色
  const handleDelete = async (uuid: string) => {
    setLoading(true);
    try {
      await request(`/api/roles/${uuid}`, { method: 'DELETE' });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    setLoading(true);
    try {
      await request('/api/roles/batch-delete', { 
        method: 'POST', 
        data: { uuids: selectedRowKeys } 
      });
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '批量删除失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuTree();
  }, []);

  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 60,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '菜单数量',
      dataIndex: 'menuCount',
      width: 120,
      render: (menuCount: number) => (
        <Tag color="blue">{menuCount || 0} 个菜单</Tag>
      ),
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return statusInfo ? (
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        ) : (
          <Tag>{status}</Tag>
        );
      },
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        disabled: { text: '禁用', status: 'Error' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该角色吗？"
            onConfirm={() => handleDelete(record.uuid)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger size="small" loading={loading}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ProTable 的 request 方法
  const fetchRoles = async (params: any) => {
    try {
      const res = await request('/api/roles', { 
        method: 'GET', 
        data: {
          page: params.current,
          pageSize: params.pageSize,
          name: params.name,
          code: params.code,
          status: params.status,
        }
      });
      return {
        data: res.list || [],
        total: res.total || 0,
        success: true,
      };
    } catch (e) {
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  return (
    <>
      <ProTable
        actionRef={actionRef}
        rowKey="uuid"
        search={{
          labelWidth: 120,
        }}
        scroll={{
          x: 1200
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新增角色
          </Button>,
          selectedRowKeys.length > 0 && (
            <Popconfirm
              key="batchDelete"
              title={`确定要删除选中的 ${selectedRowKeys.length} 个角色吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger loading={loading}>
                批量删除
              </Button>
            </Popconfirm>
          ),
        ]}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys: any) => setSelectedRowKeys(keys as string[]),
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        request={fetchRoles}
        loading={loading}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input placeholder="请输入角色代码，如：admin、user等" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="disabled">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="菜单权限"
          >
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px', 
              padding: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <Tree
                checkable
                checkedKeys={checkedMenus}
                onCheck={(checkedKeysValue: any) => {
                  setCheckedMenus(checkedKeysValue);
                }}
                treeData={menuTreeData}
                defaultExpandAll
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default RoleManagement;