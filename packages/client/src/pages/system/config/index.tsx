import React, { useState, useRef, useEffect } from 'react';
import { ProTable } from "@ant-design/pro-components";
import { Button, Space, Popconfirm, message, Modal, Form, Input, Typography, Switch, Card, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CodeOutlined, EditFilled } from '@ant-design/icons';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import request from '@/utils/request';

const { TextArea } = Input;
const { Text } = Typography;

interface ConfigItem {
  _id: string;
  key: string;
  data: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const ConfigManagement: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const actionRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [viewingConfig, setViewingConfig] = useState<ConfigItem | null>(null);
  const [form] = Form.useForm();
  const [isJsonMode, setIsJsonMode] = useState(true);
  const [configData, setConfigData] = useState('');
  const jsonEditorRef = useRef<HTMLDivElement>(null);
  const jsonEditorInstance = useRef<JSONEditor | null>(null);

  // 初始化JSON编辑器
  useEffect(() => {
    if (isJsonMode && jsonEditorRef.current && modalVisible) {
      // 销毁之前的编辑器实例
      if (jsonEditorInstance.current) {
        jsonEditorInstance.current.destroy();
      }
      
      // 创建新的编辑器实例
      const options = {
        mode: 'code',
        modes: ['code', 'tree'],
        onChange: () => {
          try {
            const json = jsonEditorInstance.current?.get();
            const jsonStr = JSON.stringify(json, null, 2);
            setConfigData(jsonStr);
            form.setFieldsValue({ data: jsonStr });
          } catch (e) {
            // JSON格式错误时不更新
          }
        }
      };
      
      jsonEditorInstance.current = new JSONEditor(jsonEditorRef.current, options);
      
      // 设置初始值
      if (configData) {
        try {
          const json = JSON.parse(configData);
          jsonEditorInstance.current.set(json);
        } catch (e) {
          jsonEditorInstance.current.setText(configData);
        }
      }
    }
    
    return () => {
      if (jsonEditorInstance.current) {
        jsonEditorInstance.current.destroy();
        jsonEditorInstance.current = null;
      }
    };
  }, [isJsonMode, modalVisible]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (jsonEditorInstance.current) {
        jsonEditorInstance.current.destroy();
      }
    };
  }, []);

  // 生成随机key
  const generateRandomKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 显示新增/编辑模态框
  const showModal = (record?: ConfigItem) => {
    setEditingConfig(record || null);
    
    if (record) {
      const dataStr = typeof record.data === 'object' 
        ? JSON.stringify(record.data, null, 2) 
        : record.data;
      
      setConfigData(dataStr);
      // 检测是否为JSON格式
      try {
        JSON.parse(dataStr);
        setIsJsonMode(true);
      } catch {
        setIsJsonMode(false);
      }
      
      form.setFieldsValue({
        key: record.key,
        data: dataStr,
        description: record.description,
      });
    } else {
      form.resetFields();
      setConfigData('{}');
      setIsJsonMode(true);
    }
    
    setModalVisible(true);
  };

  // 查看配置详情
  const viewConfig = (record: ConfigItem) => {
    setViewingConfig(record);
    setViewModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      let data = configData || values.data;
      
      // 如果是JSON模式，从编辑器获取数据
      if (isJsonMode && jsonEditorInstance.current) {
        try {
          data = jsonEditorInstance.current.get();
        } catch (e) {
          message.error('JSON格式不正确，请检查语法');
          return;
        }
      } else if (isJsonMode && typeof data === 'string') {
        // 文本模式切换到JSON模式的情况
        try {
          data = JSON.parse(data);
        } catch (e) {
          message.error('JSON格式不正确，请检查语法');
          return;
        }
      }

      const response = await request('/api/config', {
        method: 'POST',
        data: {
          key: values.key,
          data,
          description: values.description,
        }
      });

      message.success('配置保存成功');
      setModalVisible(false);
      form.resetFields();
      setEditingConfig(null);
      setConfigData('');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '保存配置失败');
    }
  };

  // 删除单个配置
  const handleDelete = async (key: string) => {
    setLoading(true);
    try {
      const response = await request(`/api/config/${key}`, { 
        method: 'DELETE'
      });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || '删除配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化数据显示
  const formatData = (data: any) => {
    if (data === null || data === undefined) {
      return '-';
    }
    
    try {
      if (typeof data === 'object') {
        // 检查是否是DOM元素或包含循环引用
        if (data instanceof Element || data instanceof Node) {
          return '[DOM Element]';
        }
        
        // 先尝试简单的序列化
        const jsonStr = JSON.stringify(data);
        
        // 如果JSON字符串太长，截断显示
        if (jsonStr && jsonStr.length > 100) {
          return jsonStr.substring(0, 100) + '...';
        }
        return jsonStr || '[Empty Object]';
      }
      
      if (typeof data === 'string') {
        if (data.length > 100) {
          return data.substring(0, 100) + '...';
        }
        return data;
      }
      
      return String(data);
    } catch (error) {
      // 如果序列化失败，返回类型描述
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          return `[Array: ${data.length} items]`;
        }
        const keys = Object.keys(data);
        return `[Object: ${keys.length} keys - ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}]`;
      }
      return `[${typeof data}]`;
    }
  };

  // 获取数据类型标签
  const getDataTypeTag = (data: any) => {
    if (data === null || data === undefined) return 'null';
    if (data instanceof Element || data instanceof Node) return 'dom';
    if (Array.isArray(data)) return 'array';
    if (typeof data === 'object') return 'object';
    if (typeof data === 'string') {
      try {
        JSON.parse(data);
        return 'json';
      } catch {
        return 'string';
      }
    }
    return typeof data;
  };

  // 获取数据类型颜色
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      object: 'blue',
      array: 'green',
      string: 'default',
      number: 'orange',
      boolean: 'purple',
      json: 'cyan',
      null: 'red',
      dom: 'magenta'
    };
    return colors[type] || 'default';
  };

  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 60,
    },
    {
      title: 'Key',
      dataIndex: 'key',
      width: 200,
      render: (text: string) => <Text code>{text}</Text>,
    },
    {
      title: '数据预览',
      dataIndex: 'data',
      ellipsis: true,
      search: false,
      render: (_: any, record: any) => {
        const data = record.data;
        const type = getDataTypeTag(data);
        const preview = formatData(data);
        
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space>
              <Tag color={getTypeColor(type)} size="small">
                {type.toUpperCase()}
              </Tag>
              {Array.isArray(data) && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {data.length} items
                </Text>
              )}
              {typeof data === 'object' && data !== null && !Array.isArray(data) && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {Object.keys(data).length} keys
                </Text>
              )}
            </Space>
            <Text 
              ellipsis={{ tooltip: preview.length > 100 ? preview : false }}
              style={{ 
                fontSize: '12px',
                color: '#666',
                maxWidth: '200px',
                display: 'block'
              }}
            >
              {preview}
            </Text>
          </Space>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 240,
      fixed: 'right',
      render: (_: any, record: ConfigItem) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => viewConfig(record)}
          >
            查看
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个配置吗？"
            onConfirm={() => handleDelete(record.key)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ProTable 的 request 方法
  const fetchConfigs = async (params: any) => {
    try {
      const res = await request('/api/config/list', { 
        method: 'GET', 
        data: {
          page: params.current,
          pageSize: params.pageSize,
          key: params.key,
          description: params.description,
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
        rowKey="_id"
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
            新增配置
          </Button>,
        ]}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        request={fetchConfigs}
        loading={loading}
      />

      {/* 编辑/新增弹窗 */}
      <Modal
        title={editingConfig ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingConfig(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="key"
            label="配置Key"
            rules={[
              { required: true, message: '请输入配置Key' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Key只能包含字母、数字、下划线和横线' }
            ]}
          >
            <Input 
              placeholder="请输入配置Key" 
              disabled={!!editingConfig}
              addonAfter={!editingConfig && (
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => form.setFieldsValue({ key: generateRandomKey() })}
                  style={{ padding: '0 8px' }}
                >
                  生成
                </Button>
              )}
            />
          </Form.Item>

          <Form.Item
            label="配置数据"
            required
          >
            <Card 
              size="small" 
              title={
                <Space>
                  <span>配置数据</span>
                  <Switch
                    checkedChildren={<CodeOutlined />}
                    unCheckedChildren={<EditFilled />}
                    checked={isJsonMode}
                    onChange={(checked) => {
                      setIsJsonMode(checked);
                      if (!checked) {
                        // 切换到文本模式时，从JSON编辑器获取内容
                        if (jsonEditorInstance.current) {
                          try {
                            const json = jsonEditorInstance.current.get();
                            const jsonStr = JSON.stringify(json, null, 2);
                            setConfigData(jsonStr);
                            form.setFieldsValue({ data: jsonStr });
                          } catch (e) {
                            const text = jsonEditorInstance.current.getText();
                            setConfigData(text);
                            form.setFieldsValue({ data: text });
                          }
                        }
                      }
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {isJsonMode ? 'JSON编辑器' : '文本输入框'}
                  </span>
                </Space>
              }
            >
              {isJsonMode ? (
                <div 
                  ref={jsonEditorRef}
                  style={{ 
                    height: '300px', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '6px' 
                  }}
                />
              ) : (
                <Form.Item
                  name="data"
                  rules={[{ required: true, message: '请输入配置数据' }]}
                  style={{ marginBottom: 0 }}
                >
                  <TextArea
                    rows={12}
                    placeholder="请输入配置数据"
                    value={configData}
                    onChange={(e) => {
                      setConfigData(e.target.value);
                      form.setFieldsValue({ data: e.target.value });
                    }}
                  />
                </Form.Item>
              )}
            </Card>
            
            {/* 隐藏的Form.Item用于表单验证 */}
            <Form.Item
              name="data"
              rules={[{ required: true, message: '请输入配置数据' }]}
              style={{ display: 'none' }}
            >
              <Input />
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea 
              rows={3}
              placeholder="请输入配置描述" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingConfig(null);
                form.resetFields();
                setConfigData('');
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看配置详情弹窗 */}
      <Modal
        title="配置详情"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewingConfig(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setViewingConfig(null);
          }}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewingConfig && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Key: </Text>
              <Text code>{viewingConfig.key}</Text>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>API地址: </Text>
              <Text code copyable>{`${window.location.origin}/public/config/${viewingConfig.key}`}</Text>
            </div>
            
            {viewingConfig.description && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>描述: </Text>
                <Text>{viewingConfig.description}</Text>
              </div>
            )}
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>配置数据: </Text>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                {typeof viewingConfig.data === 'object' 
                  ? JSON.stringify(viewingConfig.data, null, 2)
                  : viewingConfig.data}
              </pre>
            </div>
            
            <div>
              <Text strong>更新时间: </Text>
              <Text>{new Date(viewingConfig.updatedAt).toLocaleString()}</Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ConfigManagement;