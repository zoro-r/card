import React, { useState } from 'react';
import {
  PageContainer,
  ProCard,
} from '@ant-design/pro-components';
import {
  Button,
  Space,
  message,
  Divider,
  Typography,
  Badge,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  CloudUploadOutlined,
  FileOutlined,
  BarChartOutlined,
  PlusOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

import FileUpload from '@/components/FileUpload';
import FileList from '@/components/FileList';
import FilePreview from '@/components/FilePreview';
import FileStats from '@/components/FileStats';

import './index.less';

const { Title, Text } = Typography;

/**
 * 文件管理主页面
 * 集成文件上传、列表管理、预览、统计等功能
 */
const FileManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [uploadVisible, setUploadVisible] = useState(false);
  const [batchUploadVisible, setBatchUploadVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentFileUuid, setCurrentFileUuid] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // 打开文件预览
  const handlePreview = (fileUuid: string) => {
    setCurrentFileUuid(fileUuid);
    setPreviewVisible(true);
  };

  // 上传成功回调
  const handleUploadSuccess = () => {
    message.success('文件上传成功');
    setUploadVisible(false);
    setBatchUploadVisible(false);
    // 刷新文件列表
    setRefreshKey(prev => prev + 1);
  };

  // 工具栏操作按钮
  const toolbarActions = (
    <div className="file-management-toolbar">
      <Space size="middle">
        <Tooltip title="上传单个文件">
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadVisible(true)}
            className="primary-action-btn"
          >
            上传文件
          </Button>
        </Tooltip>
        <Tooltip title="批量上传多个文件">
          <Button
            type="default"
            icon={<CloudUploadOutlined />}
            onClick={() => setBatchUploadVisible(true)}
            className="secondary-action-btn"
          >
            批量上传
          </Button>
        </Tooltip>
        <Divider type="vertical" style={{ height: '24px' }} />
        <Badge count={0} showZero={false}>
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            className="icon-btn"
          >
            管理
          </Button>
        </Badge>
      </Space>
    </div>
  );

  return (
    <div className="file-management-container">
      <PageContainer
        title={
          <div className="page-header">
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              文件管理中心
            </Title>
            <Text type="secondary">集中管理您的文件资源，支持上传、预览、下载和权限控制</Text>
          </div>
        }
        extra={toolbarActions}
        tabList={[
          {
            tab: (
              <div className="tab-item">
                <FileOutlined />
                <span>文件列表</span>
              </div>
            ),
            key: 'list',
          },
          {
            tab: (
              <div className="tab-item">
                <BarChartOutlined />
                <span>数据统计</span>
              </div>
            ),
            key: 'stats',
          },
        ]}
        tabActiveKey={activeTab}
        onTabChange={setActiveTab}
        className="modern-page-container"
      >
        <div className="content-wrapper">
          {activeTab === 'list' && (
            <div className="fade-in file-list-container">
              <FileList
                key={refreshKey}
                onPreview={handlePreview}
              />
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="fade-in file-stats-container">
              <FileStats showAll={false} />
            </div>
          )}
        </div>

        {/* 单文件上传弹窗 */}
        <div className="file-upload-container">
          <FileUpload
            visible={uploadVisible}
            onCancel={() => setUploadVisible(false)}
            onSuccess={handleUploadSuccess}
            multiple={false}
          />
        </div>

        {/* 批量上传弹窗 */}
        <div className="file-upload-container">
          <FileUpload
            visible={batchUploadVisible}
            onCancel={() => setBatchUploadVisible(false)}
            onSuccess={handleUploadSuccess}
            multiple={true}
          />
        </div>

        {/* 文件预览弹窗 */}
        <FilePreview
          visible={previewVisible}
          fileUuid={currentFileUuid}
          onCancel={() => setPreviewVisible(false)}
        />
      </PageContainer>
    </div>
  );
};

export default FileManagement;