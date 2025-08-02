import React, { useState, useEffect } from 'react';
import { 
  Modal,
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  Button, 
  Space, 
  Row, 
  Col, 
  Divider,
  Tag,
  message,
  Table,
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined, 
  SaveOutlined,
} from '@ant-design/icons';
import { 
  createProduct, 
  updateProduct,
  getProductDetail,
  CourseType,
  CourseDifficulty,
  ProductStatus, 
  CreateProductParams,
  UpdateProductParams,
  CourseChapter,
  MembershipPricing 
} from '@/services/productService';
import ProductImageUpload from '@/components/ProductImageUpload';
import MembershipPricingForm from '@/components/MembershipPricingForm';
import ChapterManagementForm from '@/components/ChapterManagementForm';

const { TextArea } = Input;
const { Option } = Select;


interface ProductFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  productId?: string; // 编辑时传入商品ID
  readonly?: boolean; // 只读模式
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  productId,
  readonly = false,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [membershipPricing, setMembershipPricing] = useState<MembershipPricing[]>([]);

  const isEdit = !!productId && !readonly;
  const isView = !!productId && readonly;

  // 获取Modal标题
  const getModalTitle = () => {
    if (isView) return '查看课程';
    if (isEdit) return '编辑课程';
    return '新建课程';
  };

  // 课程类型选项
  const courseTypeOptions = [
    { label: '视频课程', value: CourseType.VIDEO },
    { label: '音频课程', value: CourseType.AUDIO },
    { label: '直播课程', value: CourseType.LIVE },
    { label: '图文课程', value: CourseType.TEXT },
    { label: '混合型课程', value: CourseType.MIXED },
  ];

  // 课程难度选项
  const difficultyOptions = [
    { label: '初级', value: CourseDifficulty.BEGINNER },
    { label: '中级', value: CourseDifficulty.INTERMEDIATE },
    { label: '高级', value: CourseDifficulty.ADVANCED },
    { label: '专家级', value: CourseDifficulty.EXPERT },
  ];

  // 课程状态选项
  const statusOptions = (isEdit || isView) ? [
    { label: '草稿', value: ProductStatus.DRAFT },
    { label: '上架', value: ProductStatus.ACTIVE },
    { label: '下架', value: ProductStatus.INACTIVE },
  ] : [
    { label: '保存草稿', value: ProductStatus.DRAFT },
    { label: '立即上架', value: ProductStatus.ACTIVE },
  ];

  // 加载课程数据（编辑或查看时）
  useEffect(() => {
    if ((isEdit || isView) && visible) {
      loadProductData();
    } else if (!isEdit && !isView && visible) {
      // 新建时重置表单
      form.resetFields();
      setChapters([]);
      setMembershipPricing([]);
    }
  }, [isEdit, isView, visible, productId]);

  const loadProductData = async () => {
    if (!productId) return;
    
    try {
      const product = await getProductDetail(productId);
      
      // 设置表单数据
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        video: product.video,
        images: product.images,
        courseType: product.courseType,
        difficulty: product.difficulty,
        instructor: product.instructor,
        instructorAvatar: product.instructorAvatar,
        instructorBio: product.instructorBio,
        isFreeTrialEnabled: product.isFreeTrialEnabled,
        freeTrialDuration: product.freeTrialDuration,
        tags: product.tags,
        skills: product.skills,
        status: product.status,
        isRecommended: product.isRecommended,
        isFeatured: product.isFeatured,
        requiresLogin: product.requiresLogin,
        allowDownload: product.allowDownload,
        allowOfflineView: product.allowOfflineView,
        seoTitle: product.seoTitle,
        seoKeywords: product.seoKeywords,
        seoDescription: product.seoDescription,
      });

      // 设置课程章节和会员定价
      setChapters(product.chapters || []);
      setMembershipPricing(product.membershipPricing || []);
    } catch (error) {
      console.error('加载课程失败:', error);
      message.error('加载课程失败');
    }
  };


  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // 验证图片
      if (!values.images || values.images.length === 0) {
        message.error('请至少上传一张课程封面图片');
        return;
      }

      // 验证会员定价
      if (!membershipPricing || membershipPricing.length === 0) {
        message.error('请设置至少一个会员定价套餐');
        return;
      }

      const hasInvalidPricing = membershipPricing.some(pricing => pricing.price <= 0);
      if (hasInvalidPricing) {
        message.error('请设置所有定价套餐的价格');
        return;
      }

      // 构建提交数据
      const submitData = {
        name: values.name,
        description: values.description,
        shortDescription: values.shortDescription,
        images: values.images,
        video: values.video,
        courseType: values.courseType,
        difficulty: values.difficulty,
        chapters: chapters,
        instructor: values.instructor,
        instructorAvatar: values.instructorAvatar,
        instructorBio: values.instructorBio,
        membershipPricing: membershipPricing,
        isFreeTrialEnabled: values.isFreeTrialEnabled || false,
        freeTrialDuration: values.freeTrialDuration,
        tags: values.tags || [],
        skills: values.skills || [],
        status: values.status,
        isRecommended: values.isRecommended || false,
        isFeatured: values.isFeatured || false,
        requiresLogin: values.requiresLogin !== undefined ? values.requiresLogin : true,
        allowDownload: values.allowDownload || false,
        allowOfflineView: values.allowOfflineView || false,
        seoTitle: values.seoTitle,
        seoKeywords: values.seoKeywords,
        seoDescription: values.seoDescription,
      };

      if (isEdit) {
        await updateProduct(productId!, submitData as UpdateProductParams);
        message.success('课程更新成功');
      } else {
        await createProduct(submitData as CreateProductParams);
        message.success('课程创建成功');
      }
      
      onSuccess();
      onCancel();
    } catch (error) {
      console.error(`${isEdit ? '更新' : '创建'}课程失败:`, error);
      message.error(`${isEdit ? '更新' : '创建'}课程失败`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={onCancel}
      width={1200}
      style={{ top: 20 }}
      footer={readonly ? [
        <Button key="cancel" onClick={onCancel}>
          关闭
        </Button>,
      ] : [
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={() => form.submit()}
        >
          {isEdit ? '更新课程' : '保存课程'}
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={readonly}
          initialValues={{
            courseType: CourseType.VIDEO,
            difficulty: CourseDifficulty.BEGINNER,
            status: ProductStatus.DRAFT,
            isFreeTrialEnabled: false,
            requiresLogin: true,
            allowDownload: false,
            allowOfflineView: false,
          }}
        >
          <Row gutter={24}>
            <Col span={16}>
              {/* 基本信息 */}
              <Card title="基本信息" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="课程名称"
                      name="name"
                      rules={[
                        { required: true, message: '请输入课程名称' },
                        { max: 200, message: '课程名称不能超过200个字符' }
                      ]}
                    >
                      <Input placeholder="请输入课程名称" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="课程类型"
                      name="courseType"
                      rules={[{ required: true, message: '请选择课程类型' }]}
                    >
                      <Select placeholder="请选择课程类型">
                        {courseTypeOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="课程难度"
                      name="difficulty"
                      rules={[{ required: true, message: '请选择课程难度' }]}
                    >
                      <Select placeholder="请选择课程难度">
                        {difficultyOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="课程状态"
                      name="status"
                      rules={[{ required: true, message: '请选择课程状态' }]}
                    >
                      <Select placeholder="请选择课程状态">
                        {statusOptions.map(option => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="简短描述"
                      name="shortDescription"
                      rules={[{ max: 500, message: '简短描述不能超过500个字符' }]}
                    >
                      <TextArea
                        rows={2}
                        placeholder="请输入课程简短描述（用于课程列表展示）"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="详细描述"
                      name="description"
                      rules={[{ max: 5000, message: '详细描述不能超过5000个字符' }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="请输入课程详细描述"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* 课程封面 */}
              <Card title="课程封面" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="images"
                  label="课程封面图片"
                  extra="建议尺寸：800x800像素，支持JPG、PNG格式，最多10张"
                  rules={[{ required: true, message: '请至少上传一张课程封面图片' }]}
                >
                  <ProductImageUpload maxCount={10} />
                </Form.Item>

                <Form.Item label="课程介绍视频" name="video">
                  <Input placeholder="请输入课程介绍视频URL（可选）" />
                </Form.Item>
              </Card>

              {/* 讲师信息 */}
              <Card title="讲师信息" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="讲师姓名"
                      name="instructor"
                      rules={[{ required: true, message: '请输入讲师姓名' }]}
                    >
                      <Input placeholder="请输入讲师姓名" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="讲师头像" name="instructorAvatar">
                      <Input placeholder="请输入讲师头像URL" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item 
                      label="讲师简介" 
                      name="instructorBio"
                      rules={[{ max: 1000, message: '讲师简介不能超过1000个字符' }]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="请输入讲师简介" 
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* 会员定价 */}
              <Card title="会员定价" style={{ marginBottom: 24 }}>
                <MembershipPricingForm
                  value={membershipPricing}
                  onChange={setMembershipPricing}
                  readonly={readonly}
                />
              </Card>

              {/* 课程章节 */}
              <Card title="课程章节" style={{ marginBottom: 24 }}>
                <ChapterManagementForm
                  value={chapters}
                  onChange={setChapters}
                  readonly={readonly}
                />
              </Card>
            </Col>

            <Col span={8}>
              {/* 课程标签 */}
              <Card title="课程标签" style={{ marginBottom: 24 }}>
                <Form.Item label="课程标签" name="tags">
                  <Select
                    mode="tags"
                    placeholder="请输入课程标签"
                    style={{ width: '100%' }}
                    tokenSeparators={[',']}
                  />
                </Form.Item>

                <Form.Item label="技能标签" name="skills">
                  <Select
                    mode="tags"
                    placeholder="请输入技能标签"
                    style={{ width: '100%' }}
                    tokenSeparators={[',']}
                  />
                </Form.Item>

                {/* 课程属性 */}
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item name="isRecommended" valuePropName="checked">
                    <Switch checkedChildren="推荐" unCheckedChildren="普通" />
                    <span style={{ marginLeft: 8 }}>推荐课程</span>
                  </Form.Item>
                  <Form.Item name="isFeatured" valuePropName="checked">
                    <Switch checkedChildren="精选" unCheckedChildren="普通" />
                    <span style={{ marginLeft: 8 }}>精选课程</span>
                  </Form.Item>
                  <Form.Item name="requiresLogin" valuePropName="checked">
                    <Switch checkedChildren="需要" unCheckedChildren="无需" />
                    <span style={{ marginLeft: 8 }}>登录观看</span>
                  </Form.Item>
                  <Form.Item name="allowDownload" valuePropName="checked">
                    <Switch checkedChildren="允许" unCheckedChildren="禁止" />
                    <span style={{ marginLeft: 8 }}>允许下载</span>
                  </Form.Item>
                  <Form.Item name="allowOfflineView" valuePropName="checked">
                    <Switch checkedChildren="允许" unCheckedChildren="禁止" />
                    <span style={{ marginLeft: 8 }}>离线观看</span>
                  </Form.Item>
                </Space>
              </Card>

              {/* 免费试学 */}
              <Card title="免费试学" style={{ marginBottom: 24 }}>
                <Form.Item name="isFreeTrialEnabled" valuePropName="checked">
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  <span style={{ marginLeft: 8 }}>免费试学</span>
                </Form.Item>
                
                <Form.Item 
                  label="试学时长(天)" 
                  name="freeTrialDuration"
                  dependencies={['isFreeTrialEnabled']}
                >
                  {({ getFieldValue }) => {
                    const isFreeTrialEnabled = getFieldValue('isFreeTrialEnabled');
                    return (
                      <InputNumber
                        min={1}
                        max={30}
                        style={{ width: '100%' }}
                        placeholder="请输入试学时长"
                        disabled={!isFreeTrialEnabled}
                      />
                    );
                  }}
                </Form.Item>
              </Card>

              {/* SEO设置 */}
              <Card title="SEO设置" style={{ marginBottom: 24 }}>
                <Form.Item
                  label="SEO标题"
                  name="seoTitle"
                  rules={[{ max: 200, message: 'SEO标题不能超过200个字符' }]}
                >
                  <Input placeholder="请输入SEO标题" />
                </Form.Item>
                <Form.Item
                  label="SEO关键词"
                  name="seoKeywords"
                  rules={[{ max: 500, message: 'SEO关键词不能超过500个字符' }]}
                >
                  <Input placeholder="请输入SEO关键词，多个关键词用英文逗号分隔" />
                </Form.Item>
                <Form.Item
                  label="SEO描述"
                  name="seoDescription"
                  rules={[{ max: 500, message: 'SEO描述不能超过500个字符' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="请输入SEO描述"
                  />
                </Form.Item>
              </Card>

            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default ProductFormModal;