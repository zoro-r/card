import React, { useState, useRef, useEffect } from 'react';
import { ProTable } from "@ant-design/pro-components";
import { Button, Space, Popconfirm, message, Tag, Modal, Form, Input, Select, TreeSelect, InputNumber } from "antd";
import * as AntdIcons from '@ant-design/icons';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined, UnorderedListOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const statusMap = {
  active: { color: 'green', text: '正常' },
  disabled: { color: 'red', text: '禁用' }
};

const typeMap = {
  menu: { color: 'blue', text: '菜单' },
  button: { color: 'orange', text: '按钮' }
};

interface MenuFormData {
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  parentId?: string;
  type: 'menu' | 'button';
  permission?: string;
  sort: number;
  status: string;
}

function MenuManagement() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const actionRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [form] = Form.useForm();
  const [menuTreeData, setMenuTreeData] = useState<any[]>([]);
  const [iconSelectVisible, setIconSelectVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  // 加载菜单树数据
  const loadMenuTree = async () => {
    try {
      const response = await request('/api/menus/tree');
      setMenuTreeData(response || []);
    } catch (error) {
      console.error('加载菜单树失败:', error);
    }
  };

  // 转换菜单树数据格式用于TreeSelect
  const convertMenuTreeForSelect = (menus: any[]): any[] => {
    return menus.map(menu => ({
      title: menu.name,
      value: menu.uuid,
      key: menu.uuid,
      children: menu.children && menu.children.length > 0 ? convertMenuTreeForSelect(menu.children) : undefined
    }));
  };

  // 显示新增/编辑模态框
  const showModal = (record?: any) => {
    setEditingMenu(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue(record);
      setSelectedIcon(record.icon || '');
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: 'menu',
        status: 'active',
        sort: 0
      });
      setSelectedIcon('');
    }
  };

  // 保存菜单
  const handleSave = async (values: MenuFormData) => {
    try {
      const submitData = { ...values, icon: selectedIcon };
      if (editingMenu) {
        await request(`/api/menus/${editingMenu.uuid}`, {
          method: 'PUT',
          data: submitData
        });
        message.success('更新成功');
      } else {
        await request('/api/menus', {
          method: 'POST',
          data: submitData
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
      loadMenuTree(); // 刷新菜单树
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  // 删除单个菜单
  const handleDelete = async (uuid: string) => {
    setLoading(true);
    try {
      await request(`/api/menus/${uuid}`, { method: 'DELETE' });
      message.success('删除成功');
      actionRef.current?.reload();
      loadMenuTree(); // 刷新菜单树
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
      await request('/api/menus/batch-delete', { 
        method: 'POST', 
        data: { uuids: selectedRowKeys } 
      });
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      actionRef.current?.reload();
      loadMenuTree(); // 刷新菜单树
    } catch (error: any) {
      message.error(error.message || '批量删除失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuTree();
  }, []);

  // 获取所有Ant Design图标（去除带颜色的图标）
  const getAntdIcons = () => {
    const iconNames = Object.keys(AntdIcons).filter(name => 
      name.endsWith('Outlined') && !name.includes('Color')
    );
    return iconNames;
  };

  // 选择图标
  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    form.setFieldValue('icon', iconName);
    setIconSelectVisible(false);
  };

  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 60,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '路径',
      dataIndex: 'path',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      search: false,
      render: (icon: string) => {
        if (icon && AntdIcons[icon as keyof typeof AntdIcons]) {
          const IconComponent = AntdIcons[icon as keyof typeof AntdIcons] as React.ComponentType<any>;
          return <IconComponent />;
        }
        return icon || '-';
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: string) => {
        const typeInfo = typeMap[type as keyof typeof typeMap];
        return typeInfo ? (
          <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
        ) : (
          <Tag>{type}</Tag>
        );
      },
      valueType: 'select',
      valueEnum: {
        menu: { text: '菜单', status: 'Processing' },
        button: { text: '按钮', status: 'Warning' },
      },
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
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
            title="确定要删除该菜单吗？"
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
  const fetchMenus = async (params: any) => {
    try {
      const res = await request('/api/menus', { 
        method: 'GET', 
        data: {
          page: params.current,
          pageSize: params.pageSize,
          name: params.name,
          type: params.type,
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
            新增菜单
          </Button>,
          selectedRowKeys.length > 0 && (
            <Popconfirm
              key="batchDelete"
              title={`确定要删除选中的 ${selectedRowKeys.length} 个菜单吗？`}
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
        request={fetchMenus}
        loading={loading}
      />

      <Modal
        title={editingMenu ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="菜单名称"
              rules={[{ required: true, message: '请输入菜单名称' }]}
            >
              <Input placeholder="请输入菜单名称" />
            </Form.Item>

            <Form.Item
              name="type"
              label="菜单类型"
              rules={[{ required: true, message: '请选择菜单类型' }]}
            >
              <Select placeholder="请选择菜单类型">
                <Select.Option value="menu">菜单</Select.Option>
                <Select.Option value="button">按钮</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="parentId"
            label="上级菜单"
          >
            <TreeSelect
              placeholder="请选择上级菜单，不选择则为顶级菜单"
              allowClear
              treeData={convertMenuTreeForSelect(menuTreeData)}
              treeDefaultExpandAll
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <Form.Item
              name="path"
              label="路径"
            >
              <Input placeholder="请输入菜单路径，如：/system/users" />
            </Form.Item>

            <Form.Item
              name="sort"
              label="排序"
              rules={[{ required: true, message: '请输入排序值' }]}
            >
              <InputNumber placeholder="请输入排序值" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="icon"
              label="图标"
            >
              <Input 
                placeholder="请选择图标" 
                value={selectedIcon}
                readOnly
                allowClear
                onClick={() => setIconSelectVisible(true)}
                suffix={
                  selectedIcon && AntdIcons[selectedIcon as keyof typeof AntdIcons] ? 
                  React.createElement(AntdIcons[selectedIcon as keyof typeof AntdIcons] as React.ComponentType<any>) : 
                  null
                }
              />
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
          </div>

          <Form.Item
            name="permission"
            label="权限标识"
          >
            <Input placeholder="请输入权限标识，如：user:read" />
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

      {/* 图标选择模态框 */}
      <Modal
        title="选择图标"
        open={iconSelectVisible}
        onCancel={() => setIconSelectVisible(false)}
        footer={null}
        width={800}
        styles={{ body: { maxHeight: '60vh', overflow: 'auto' } }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '16px', padding: '16px 0' }}>
          {getAntdIcons().map(iconName => {
            const IconComponent = AntdIcons[iconName as keyof typeof AntdIcons] as React.ComponentType<any>;
            return (
              <div
                key={iconName}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px',
                  cursor: 'pointer',
                  border: selectedIcon === iconName ? '2px solid #1890ff' : '1px solid #f0f0f0',
                  borderRadius: '6px',
                  backgroundColor: selectedIcon === iconName ? '#f6ffed' : '#fff',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleIconSelect(iconName)}
                onMouseEnter={(e) => {
                  if (selectedIcon !== iconName) {
                    e.currentTarget.style.borderColor = '#d9d9d9';
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIcon !== iconName) {
                    e.currentTarget.style.borderColor = '#f0f0f0';
                    e.currentTarget.style.backgroundColor = '#fff';
                  }
                }}
              >
                <IconComponent style={{ fontSize: '24px', marginBottom: '4px' }} />
                <span style={{ fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }}>
                  {iconName}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}

export default MenuManagement;