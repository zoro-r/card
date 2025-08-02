import React from 'react';
import { 
  Card,
  Form, 
  Input, 
  InputNumber, 
  Switch, 
  Button, 
  Space,
  Row,
  Col,
  Tag,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { CourseChapter } from '@/services/productService';

const { TextArea } = Input;

interface ChapterManagementFormProps {
  value?: CourseChapter[];
  onChange?: (value: CourseChapter[]) => void;
  readonly?: boolean;
}

const ChapterManagementForm: React.FC<ChapterManagementFormProps> = ({
  value = [],
  onChange,
  readonly = false
}) => {

  // 添加新章节
  const addChapter = () => {
    const newChapter: CourseChapter = {
      chapterId: `chapter_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: '',
      order: value.length + 1,
      isFree: false,
      isActive: true
    };
    onChange?.([...value, newChapter]);
  };

  // 删除章节
  const removeChapter = (index: number) => {
    const newChapters = value.filter((_, i) => i !== index);
    // 重新排序
    const reorderedChapters = newChapters.map((chapter, i) => ({
      ...chapter,
      order: i + 1
    }));
    onChange?.(reorderedChapters);
  };

  // 更新章节
  const updateChapter = (index: number, field: keyof CourseChapter, fieldValue: any) => {
    const newChapters = [...value];
    newChapters[index] = { ...newChapters[index], [field]: fieldValue };
    onChange?.(newChapters);
  };

  // 上移章节
  const moveChapterUp = (index: number) => {
    if (index === 0) return;
    const newChapters = [...value];
    [newChapters[index - 1], newChapters[index]] = [newChapters[index], newChapters[index - 1]];
    // 更新排序
    newChapters.forEach((chapter, i) => {
      chapter.order = i + 1;
    });
    onChange?.(newChapters);
  };

  // 下移章节
  const moveChapterDown = (index: number) => {
    if (index === value.length - 1) return;
    const newChapters = [...value];
    [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    // 更新排序
    newChapters.forEach((chapter, i) => {
      chapter.order = i + 1;
    });
    onChange?.(newChapters);
  };

  // 格式化时长显示
  const formatDuration = (duration?: number) => {
    if (!duration) return '未设置';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}分${seconds}秒`;
  };

  // 获取章节类型图标
  const getChapterIcon = (chapter: CourseChapter) => {
    if (chapter.videoUrl) return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
    if (chapter.audioUrl) return <SoundOutlined style={{ color: '#52c41a' }} />;
    if (chapter.content) return <FileTextOutlined style={{ color: '#722ed1' }} />;
    return <FileTextOutlined style={{ color: '#999' }} />;
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>课程章节</span>
        {!readonly && (
          <Button type="dashed" onClick={addChapter} icon={<PlusOutlined />}>
            添加章节
          </Button>
        )}
      </div>

      {value.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#999',
          border: '1px dashed #d9d9d9',
          borderRadius: '6px'
        }}>
          暂无章节内容，请点击"添加章节"创建
        </div>
      )}

      {value.map((chapter, index) => (
        <Card 
          key={chapter.chapterId}
          size="small"
          style={{ marginBottom: 16 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                {getChapterIcon(chapter)}
                <span>第{chapter.order}章 {chapter.title || '未命名章节'}</span>
                <Space size="small">
                  {chapter.isFree && <Tag color="green">免费</Tag>}
                  {!chapter.isActive && <Tag color="red">禁用</Tag>}
                </Space>
              </Space>
              
              {!readonly && (
                <Space size="small">
                  <Button 
                    type="text" 
                    size="small"
                    onClick={() => moveChapterUp(index)}
                    disabled={index === 0}
                  >
                    上移
                  </Button>
                  <Button 
                    type="text" 
                    size="small"
                    onClick={() => moveChapterDown(index)}
                    disabled={index === value.length - 1}
                  >
                    下移
                  </Button>
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeChapter(index)}
                  >
                    删除
                  </Button>
                </Space>
              )}
            </div>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <label>章节标题 *</label>
                <Input
                  value={chapter.title}
                  onChange={(e) => updateChapter(index, 'title', e.target.value)}
                  placeholder="请输入章节标题"
                  disabled={readonly}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <label>时长(秒)</label>
                <InputNumber
                  value={chapter.duration}
                  onChange={(val) => updateChapter(index, 'duration', val)}
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="章节时长"
                  disabled={readonly}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <label>排序</label>
                <InputNumber
                  value={chapter.order}
                  onChange={(val) => updateChapter(index, 'order', val || 1)}
                  min={1}
                  style={{ width: '100%' }}
                  disabled={readonly}
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <label>章节描述</label>
                <TextArea
                  value={chapter.description}
                  onChange={(e) => updateChapter(index, 'description', e.target.value)}
                  placeholder="请输入章节描述"
                  rows={2}
                  disabled={readonly}
                />
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />
          
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>
                <label>视频链接</label>
                <Input
                  value={chapter.videoUrl}
                  onChange={(e) => updateChapter(index, 'videoUrl', e.target.value)}
                  placeholder="视频URL"
                  disabled={readonly}
                  prefix={<PlayCircleOutlined />}
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>
                <label>音频链接</label>
                <Input
                  value={chapter.audioUrl}
                  onChange={(e) => updateChapter(index, 'audioUrl', e.target.value)}
                  placeholder="音频URL"
                  disabled={readonly}
                  prefix={<SoundOutlined />}
                />
              </div>
            </Col>
            <Col span={8}>
              <Space style={{ marginTop: 20 }}>
                <Switch
                  checked={chapter.isFree}
                  onChange={(checked) => updateChapter(index, 'isFree', checked)}
                  disabled={readonly}
                  checkedChildren="免费"
                  unCheckedChildren="付费"
                />
                <Switch
                  checked={chapter.isActive}
                  onChange={(checked) => updateChapter(index, 'isActive', checked)}
                  disabled={readonly}
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                />
              </Space>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <label>文字内容</label>
                <TextArea
                  value={chapter.content}
                  onChange={(e) => updateChapter(index, 'content', e.target.value)}
                  placeholder="请输入章节的文字内容（图文课程必填）"
                  rows={3}
                  disabled={readonly}
                />
              </div>
            </Col>
          </Row>

          {readonly && (
            <div style={{ 
              marginTop: 12, 
              padding: '8px 12px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <strong>章节信息：</strong> 
              时长 {formatDuration(chapter.duration)} | 
              {chapter.videoUrl && ' 视频'}{chapter.audioUrl && ' 音频'}{chapter.content && ' 图文'} | 
              {chapter.isFree ? '免费试看' : '付费内容'}
            </div>
          )}
        </Card>
      ))}

      {value.length > 0 && (
        <div style={{ 
          marginTop: 16, 
          padding: '12px', 
          backgroundColor: '#f0f2f5', 
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          <strong>课程统计：</strong> 
          共 {value.length} 个章节 | 
          总时长 {formatDuration(value.reduce((total, chapter) => total + (chapter.duration || 0), 0))} | 
          免费章节 {value.filter(c => c.isFree).length} 个
        </div>
      )}
    </div>
  );
};

export default ChapterManagementForm;