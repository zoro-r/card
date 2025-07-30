import React, { useState, useEffect } from 'react';
import {
  Modal,
  Image,
  Spin,
  Result,
  Button,
  Space,
  Typography,
  Tag,
  Descriptions,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { FileService, type FileItem } from '@/services/fileService';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface FilePreviewProps {
  visible: boolean;
  fileUuid: string;
  onCancel: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  visible,
  fileUuid,
  onCancel,
}) => {
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // 获取文件详情
  const fetchFileDetails = async () => {
    if (!fileUuid) return;
    
    try {
      setLoading(true);
      setPreviewError(false);
      const result = await FileService.getFileDetails(fileUuid);
      setFile(result);
    } catch (error) {
      console.error('获取文件详情失败:', error);
      setPreviewError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && fileUuid) {
      fetchFileDetails();
    }
  }, [visible, fileUuid]);

  // 下载文件
  const handleDownload = () => {
    if (file) {
      FileService.downloadFile(file.uuid);
    }
  };

  // 渲染预览内容
  const renderPreviewContent = () => {
    if (!file) return null;

    const isImage = file.fileType.startsWith('image/');
    const isPdf = file.fileType === 'application/pdf';
    const isText = file.fileType.startsWith('text/') || file.fileType === 'application/json';

    if (isImage) {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Image
            src={FileService.getPreviewUrl(file.uuid)}
            alt={file.originalName}
            style={{ maxWidth: '100%', maxHeight: '60vh' }}
            placeholder={
              <div style={{ padding: '50px' }}>
                <Spin size="large" />
              </div>
            }
            onError={() => setPreviewError(true)}
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div style={{ height: '60vh', width: '100%' }}>
          <iframe
            src={FileService.getPreviewUrl(file.uuid)}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={file.originalName}
            onError={() => setPreviewError(true)}
          />
        </div>
      );
    }

    if (isText && file.fileSize < 1024 * 1024) { // 限制1MB以下的文本文件
      return (
        <div style={{ height: '60vh', width: '100%' }}>
          <iframe
            src={FileService.getPreviewUrl(file.uuid)}
            style={{ width: '100%', height: '100%', border: '1px solid #d9d9d9' }}
            title={file.originalName}
            onError={() => setPreviewError(true)}
          />
        </div>
      );
    }

    // 不支持预览的文件类型
    return (
      <Result
        icon={<FileOutlined />}
        title="无法预览此文件"
        subTitle={`文件类型 ${file.fileType} 不支持在线预览，请下载后查看`}
        extra={
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载文件
          </Button>
        }
      />
    );
  };

  // 渲染文件信息
  const renderFileInfo = () => {
    if (!file) return null;

    return (
      <Descriptions column={2} size="small" style={{ marginTop: 16 }}>
        <Descriptions.Item label="文件名称" span={2}>
          <Text copyable>{file.originalName}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="文件大小">
          {FileService.formatFileSize(file.fileSize)}
        </Descriptions.Item>
        <Descriptions.Item label="文件类型">
          {file.fileType}
        </Descriptions.Item>
        <Descriptions.Item label="上传时间">
          {dayjs(file.uploadDate).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="下载次数">
          {file.downloadCount}
        </Descriptions.Item>
        {file.lastAccessTime && (
          <Descriptions.Item label="最后访问时间" span={2}>
            {dayjs(file.lastAccessTime).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        )}
        {file.description && (
          <Descriptions.Item label="文件描述" span={2}>
            {file.description}
          </Descriptions.Item>
        )}
        {file.tags && file.tags.length > 0 && (
          <Descriptions.Item label="文件标签" span={2}>
            <Space wrap>
              {file.tags.map((tag) => (
                <Tag key={tag} color="blue">
                  {tag}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="访问权限">
          <Tag color={file.isPublic ? 'green' : 'orange'}>
            {file.isPublic ? '公开' : '私有'}
          </Tag>
        </Descriptions.Item>
        {file.md5Hash && (
          <Descriptions.Item label="MD5">
            <Text code copyable>
              {file.md5Hash}
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          文件预览
          {file && <Text type="secondary">- {file.originalName}</Text>}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width="80%"
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
        file && (
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            下载文件
          </Button>
        ),
      ]}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        {previewError ? (
          <Result
            status="error"
            title="预览失败"
            subTitle="无法加载文件预览，请检查文件是否存在或稍后重试"
            extra={[
              <Button key="retry" onClick={fetchFileDetails}>
                重试
              </Button>,
              file && (
                <Button
                  key="download"
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  下载文件
                </Button>
              ),
            ]}
          />
        ) : (
          <>
            {renderPreviewContent()}
            {renderFileInfo()}
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default FilePreview;