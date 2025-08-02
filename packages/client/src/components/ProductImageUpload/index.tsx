import React, { useState } from 'react';
import { Upload, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { FileService } from '@/services/fileService';

interface ProductImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 10,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  // 使用ref来存储上一次的value，避免在useEffect中依赖fileList
  const prevValueRef = React.useRef<string[]>();

  React.useEffect(() => {
    // 如果value没有变化，直接返回
    if (JSON.stringify(prevValueRef.current) === JSON.stringify(value)) {
      return;
    }
    
    prevValueRef.current = value;

    // 将URL数组转换为文件列表
    if (!value || value.length === 0) {
      setFileList([]);
      return;
    }

    const newFileList: UploadFile[] = value.map((url, index) => ({
      uid: `external-${index}`,
      name: `image-${index}`,
      status: 'done' as const,
      url,
    }));
    
    setFileList(newFileList);
  }, [value]);

  // 获取图片base64
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  // 处理图片预览
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || file.preview || '');
    setPreviewVisible(true);
  };

  // 自定义上传函数
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    
    try {
      // 使用统一的文件服务上传
      const result = await FileService.uploadFile(file, {
        isPublic: true, // 商品图片设为公开访问
        tags: ['product', 'image'], // 添加标签便于管理
      });

      console.log('文件上传成功:', result);

      // 构建预览URL - 使用带token的私有预览URL更可靠
      const previewUrl = FileService.getPreviewUrl(result.uuid);
      console.log('预览URL:', previewUrl);
      
      // 调用Ant Design Upload的onSuccess，传递URL信息
      // 这会触发Upload组件的onChange事件
      onSuccess({
        url: previewUrl,
        name: result.originalName,
        uuid: result.uuid,
      }, file);

    } catch (error) {
      console.error('文件上传失败:', error);
      onError(error);
      message.error('文件上传失败');
    }
  };

  // 处理文件列表变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 提取成功上传的图片URL
    const urls = newFileList
      .filter(file => file.status === 'done')
      .map(file => file.response?.url || file.url)
      .filter(Boolean);

    console.log('handleChange - urls:', urls);
    console.log('handleChange - current value:', value);

    // 只有当URLs发生变化时才调用onChange
    const currentUrls = (value || []).slice().sort();
    const newUrls = urls.slice().sort();
    
    if (JSON.stringify(currentUrls) !== JSON.stringify(newUrls)) {
      console.log('URLs changed, calling onChange');
      onChange?.(urls);
    }
  };

  // 上传前验证
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过5MB');
      return false;
    }

    return true;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customUpload}
        beforeUpload={beforeUpload}
        multiple
        accept="image/*"
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      
      <Modal 
        open={previewVisible} 
        title="图片预览" 
        footer={null} 
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ProductImageUpload;