import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Image,
  Tooltip,
  Modal,
  message,
  Input,
  Select,
  DatePicker,
  Switch,
  Popconfirm,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileOutlined,
  CloudDownloadOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { FileService, type FileItem, type FileListParams } from '@/services/fileService';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface FileListProps {
  onPreview: (fileUuid: string) => void;
}

const FileList: React.FC<FileListProps> = ({ onPreview }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  // 搜索和过滤参数
  const [searchParams, setSearchParams] = useState<FileListParams>({
    page: 1,
    pageSize: 20,
  });

  // 获取文件列表
  const fetchFileList = async (params: FileListParams = {}) => {
    try {
      setLoading(true);
      const finalParams = { ...searchParams, ...params };
      console.log(finalParams);

      const result = await FileService.getFileList(finalParams);

      console.log(111, result);
      setFiles(result.list);
      setTotal(result.total);
      setCurrent(result.page);
      setPageSize(result.pageSize);
    } catch (error: any) {
      console.error(error);
      message.error(error.message || '获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileList();
  }, []);

  // 搜索
  const handleSearch = (keyword: string) => {
    const params = { ...searchParams, keyword, page: 1 };
    setSearchParams(params);
    fetchFileList(params);
  };

  // 筛选变更
  const handleFilterChange = (key: string, value: any) => {
    const params = { ...searchParams, [key]: value, page: 1 };
    setSearchParams(params);
    fetchFileList(params);
  };

  // 日期范围变更
  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    const params = {
      ...searchParams,
      startDate: dateStrings[0],
      endDate: dateStrings[1],
      page: 1,
    };
    setSearchParams(params);
    fetchFileList(params);
  };

  // 显示全部文件切换
  const handleShowAllChange = (checked: boolean) => {
    const params = { ...searchParams, showAll: checked, page: 1 };
    setSearchParams(params);
    fetchFileList(params);
  };

  // 页码变更
  const handleTableChange = (pagination: any) => {
    const params = {
      ...searchParams,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    setSearchParams(params);
    fetchFileList(params);
  };

  // 刷新列表
  const handleRefresh = () => {
    fetchFileList(searchParams);
  };

  // 预览文件
  const handlePreview = (file: FileItem) => {
    onPreview(file.uuid);
  };

  // 下载文件
  const handleDownload = (file: FileItem) => {
    FileService.downloadFile(file.uuid);
  };

  // 删除单个文件
  const handleDelete = async (file: FileItem) => {
    try {
      await FileService.deleteFile(file.uuid);
      message.success('删除成功');
      handleRefresh();
    } catch (error: any) {
      console.error('删除文件失败:', error);
      message.error(error.message || '删除失败');
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要下载的文件');
      return;
    }

    try {
      await FileService.downloadMultipleFiles(selectedRowKeys);
      message.success('下载任务已开始');
    } catch (error: any) {
      console.error('批量下载失败:', error);
      message.error(error.message || '批量下载失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    try {
      const result = await FileService.deleteMultipleFiles(selectedRowKeys);
      const { success, failed } = result;
      message.success(`删除完成：成功 ${success.length} 个，失败 ${failed.length} 个`);
      setSelectedRowKeys([]);
      setSelectedFiles([]);
      handleRefresh();
    } catch (error: any) {
      console.error('批量删除失败:', error);
      message.error(error.message || '批量删除失败');
    }
  };

  // 更新文件权限
  const handlePermissionChange = async (file: FileItem, newPermission: boolean) => {
    try {
      await FileService.updateFilePermission(file.uuid, newPermission);
      message.success(`文件权限已更新为${newPermission ? '公开' : '私有'}`);
      handleRefresh();
    } catch (error: any) {
      console.error('更新文件权限失败:', error);
      message.error(error.message || '更新文件权限失败');
    }
  };

  // 复制文件链接
  const handleCopyLink = async (file: FileItem) => {
    try {
      const success = await FileService.copyFileLink(file);
      if (success) {
        message.success('文件链接已复制到剪贴板');
      } else {
        message.error('复制链接失败，请手动复制');
        // 显示链接让用户手动复制
        const url = FileService.getFileAccessUrl(file);
        message.info(url);
      }
    } catch (error: any) {
      console.error('复制链接失败:', error);
      message.error('复制链接失败');
    }
  };

  // 批量复制链接
  const handleBatchCopyLinks = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要复制链接的文件');
      return;
    }

    try {
      const links = selectedFiles.map(file => FileService.getFileAccessUrl(file));
      const linksText = links.join('\n');
      
      // 使用现代 Clipboard API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(linksText);
        message.success(`已复制 ${selectedFiles.length} 个文件链接到剪贴板`);
      } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = linksText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (result) {
          message.success(`已复制 ${selectedFiles.length} 个文件链接到剪贴板`);
        } else {
          message.error('复制链接失败');
        }
      }
    } catch (error: any) {
      console.error('批量复制链接失败:', error);
      message.error('批量复制链接失败');
    }
  };

  // 行选择配置
  const rowSelection: TableRowSelection<FileItem> = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: FileItem[]) => {
      setSelectedRowKeys(keys as string[]);
      setSelectedFiles(rows);
    },
    getCheckboxProps: (record: FileItem) => ({
      name: record.originalName,
    }),
  };

  // 表格列配置
  const columns: ColumnsType<FileItem> = [
    {
      title: '文件预览',
      dataIndex: 'fileType',
      width: 80,
      render: (fileType: string, record: FileItem) => {
        if (fileType.startsWith('image/')) {
          return (
            <Image
              src={FileService.getPreviewUrl(record.uuid)}
              alt={record.originalName}
              width={40}
              height={40}
              style={{ objectFit: 'cover', cursor: 'pointer' }}
              preview={false}
              onClick={() => handlePreview(record)}
            />
          );
        }
        return (
          <FileOutlined
            style={{ fontSize: 24, color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handlePreview(record)}
          />
        );
      },
    },
    {
      title: '文件名称',
      dataIndex: 'originalName',
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Tooltip title={name}>
          {name}
        </Tooltip>
      ),
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      width: 100,
      render: (size: number) => FileService.formatFileSize(size),
      sorter: (a, b) => a.fileSize - b.fileSize,
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      width: 120,
      render: (type: string) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {type.split('/')[1]?.toUpperCase() || type}
        </Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <Space wrap>
          {tags?.slice(0, 2).map((tag) => (
            <Tag key={tag}>
              {tag}
            </Tag>
          ))}
          {tags && tags.length > 2 && (
            <Tag color="default">
              +{tags.length - 2}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'uploadDate',
      width: 160,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.uploadDate).unix() - dayjs(b.uploadDate).unix(),
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      width: 100,
      sorter: (a, b) => a.downloadCount - b.downloadCount,
    },
    {
      title: '权限',
      dataIndex: 'isPublic',
      width: 100,
      render: (isPublic: boolean, record: FileItem) => (
        <Switch
          checked={isPublic}
          checkedChildren="公开"
          unCheckedChildren="私有"
          onChange={(checked) => handlePermissionChange(record, checked)}
          size="small"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record: FileItem) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Tooltip title="复制链接">
            <Button
              type="text"
              size="small"
              icon={<LinkOutlined />}
              onClick={() => handleCopyLink(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此文件吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 筛选工具栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="搜索文件名或描述"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="文件类型"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('fileType', value)}
            >
              <Option value="image">图片</Option>
              <Option value="pdf">PDF</Option>
              <Option value="document">文档</Option>
              <Option value="excel">表格</Option>
              <Option value="text">文本</Option>
              <Option value="zip">压缩包</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Switch
                checkedChildren="全部"
                unCheckedChildren="我的"
                onChange={handleShowAllChange}
              />
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 批量操作工具栏 */}
      {selectedRowKeys.length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <span>已选择 {selectedRowKeys.length} 个文件</span>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={handleBatchDownload}
            >
              批量下载
            </Button>
            <Button
              icon={<LinkOutlined />}
              onClick={handleBatchCopyLinks}
            >
              复制链接
            </Button>
            <Popconfirm
              title={`确定删除选中的 ${selectedRowKeys.length} 个文件吗？`}
              description="删除后无法恢复，请谨慎操作。"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />}>
                批量删除
              </Button>
            </Popconfirm>
            <Button onClick={() => {
              setSelectedRowKeys([]);
              setSelectedFiles([]);
            }}>
              取消选择
            </Button>
          </Space>
        </Card>
      )}

      {/* 文件列表表格 */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={files}
        rowKey="uuid"
        loading={loading}
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  );
};

export default FileList;