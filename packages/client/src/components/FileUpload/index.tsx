import React, { useState } from 'react';
import {
  Upload,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  message,
  Progress,
  Space,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { FileService } from '@/services/fileService';

const { Dragger } = Upload;
const { TextArea } = Input;

interface FileUploadProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  multiple?: boolean;
}

interface UploadingFile extends UploadFile {
  progress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  visible,
  onCancel,
  onSuccess,
  multiple = false,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');

  // 处理文件选择
  const handleFileChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
  };

  // 添加标签
  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 自定义上传逻辑
  const customRequest = ({ file, onSuccess: onUploadSuccess }: any) => {
    // 阻止默认上传，我们手动处理
    setTimeout(() => {
      onUploadSuccess('ok');
    }, 0);
  };

  // 执行上传
  const handleUpload = async () => {
    try {
      await form.validateFields();
      
      if (fileList.length === 0) {
        message.error('请选择要上传的文件');
        return;
      }

      setUploading(true);
      
      const formValues = form.getFieldsValue();
      const options = {
        tags,
        description: formValues.description,
        isPublic: formValues.isPublic !== undefined ? formValues.isPublic : true, // 默认为公开
      };

      const files = fileList.map(item => item.originFileObj as File);

      let result;
      if (multiple && files.length > 1) {
        result = await FileService.uploadMultipleFiles(files, options);
      } else {
        result = await FileService.uploadFile(files[0], options);
      }

      handleReset();
      onSuccess();
    } catch (error: any) {
      console.error('上传失败:', error);
      message.error(error.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setFileList([]);
    setTags([]);
    setInputTag('');
  };

  // 关闭弹窗
  const handleCancel = () => {
    if (!uploading) {
      handleReset();
      onCancel();
    }
  };

  // 文件上传前的检查
  const beforeUpload = (file: File) => {
    const isValidSize = file.size / 1024 / 1024 < 100; // 100MB限制
    if (!isValidSize) {
      message.error('文件大小不能超过100MB');
      return false;
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'application/json',
      'application/zip', 'application/x-rar-compressed'
    ];

    const isValidType = allowedTypes.includes(file.type);
    if (!isValidType) {
      message.error('不支持的文件类型');
      return false;
    }

    return false; // 阻止自动上传
  };

  return (
    <Modal
      title={multiple ? '批量上传文件' : '上传文件'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={uploading}>
          取消
        </Button>,
        <Button key="reset" onClick={handleReset} disabled={uploading}>
          重置
        </Button>,
        <Button
          key="upload"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
        >
          {uploading ? '上传中...' : '开始上传'}
        </Button>,
      ]}
      width={600}
      maskClosable={!uploading}
      closable={!uploading}
    >
      <Form form={form} layout="vertical">
        {/* 文件选择区域 */}
        <Form.Item label="选择文件" required>
          <Dragger
            multiple={multiple}
            fileList={fileList}
            onChange={handleFileChange}
            customRequest={customRequest}
            beforeUpload={beforeUpload}
            disabled={uploading}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: !uploading,
              showDownloadIcon: false,
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              点击或拖拽文件到此区域上传
            </p>
            <p className="ant-upload-hint">
              支持单个或批量上传。文件大小限制100MB。
              <br />
              支持图片、文档、表格、文本、压缩包等格式。
            </p>
          </Dragger>
        </Form.Item>

        {/* 图片压缩提示 */}
        <Alert
          message="图片压缩建议"
          description={
            <span>
              为了获得更好的上传和浏览体验，建议在上传前使用
              <a 
                href="https://tinypng.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ margin: '0 4px', color: '#1890ff' }}
              >
                TinyPNG
              </a>
              对图片进行压缩，可显著减少文件大小而不影响画质。
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* 文件标签 */}
        <Form.Item label="文件标签">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
            <Space.Compact style={{ display: 'flex' }}>
              <Input
                placeholder="输入标签名称"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onPressEnter={handleAddTag}
                disabled={uploading}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTag}
                disabled={uploading || !inputTag.trim()}
              >
                添加
              </Button>
            </Space.Compact>
          </Space>
        </Form.Item>

        {/* 文件描述 */}
        <Form.Item
          name="description"
          label="文件描述"
        >
          <TextArea
            rows={3}
            placeholder="请输入文件描述（可选）"
            disabled={uploading}
          />
        </Form.Item>

        {/* 公开设置 */}
        <Form.Item
          name="isPublic"
          label="公开访问"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch
            checkedChildren="公开"
            unCheckedChildren="私有"
            disabled={uploading}
            defaultChecked={true}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FileUpload;