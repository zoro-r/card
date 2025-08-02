import React from 'react';
import { 
  Card,
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  Button, 
  Space,
  Divider,
  Row,
  Col,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined 
} from '@ant-design/icons';
import { DurationUnit, MembershipPricing } from '@/services/productService';

const { TextArea } = Input;
const { Option } = Select;

interface MembershipPricingFormProps {
  value?: MembershipPricing[];
  onChange?: (value: MembershipPricing[]) => void;
  readonly?: boolean;
}

const MembershipPricingForm: React.FC<MembershipPricingFormProps> = ({
  value = [],
  onChange,
  readonly = false
}) => {
  
  // 时长单位选项
  const durationUnitOptions = [
    { label: '天', value: DurationUnit.DAYS },
    { label: '周', value: DurationUnit.WEEKS },
    { label: '月', value: DurationUnit.MONTHS },
    { label: '年', value: DurationUnit.YEARS }
  ];

  // 添加新定价套餐
  const addPricing = () => {
    const newPricing: MembershipPricing = {
      pricingId: `pricing_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      duration: 1,
      unit: DurationUnit.MONTHS,
      price: 0,
      isActive: true,
      isRecommended: false
    };
    onChange?.([...value, newPricing]);
  };

  // 删除定价套餐
  const removePricing = (index: number) => {
    const newPricings = value.filter((_, i) => i !== index);
    onChange?.(newPricings);
  };

  // 更新定价套餐
  const updatePricing = (index: number, field: keyof MembershipPricing, fieldValue: any) => {
    const newPricings = [...value];
    newPricings[index] = { ...newPricings[index], [field]: fieldValue };
    onChange?.(newPricings);
  };

  // 格式化显示套餐名称
  const formatPricingName = (pricing: MembershipPricing) => {
    const unitText = durationUnitOptions.find(opt => opt.value === pricing.unit)?.label || '';
    return `${pricing.duration}${unitText}套餐`;
  };

  // 格式化价格显示
  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`;
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>会员定价套餐</span>
        {!readonly && (
          <Button type="dashed" onClick={addPricing} icon={<PlusOutlined />}>
            添加套餐
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
          暂无定价套餐，请点击"添加套餐"创建
        </div>
      )}

      {value.map((pricing, index) => (
        <Card 
          key={pricing.pricingId}
          size="small"
          style={{ marginBottom: 16 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{formatPricingName(pricing)}</span>
              <Space>
                {pricing.isRecommended && <Tag color="gold">推荐</Tag>}
                {!readonly && (
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    icon={<MinusCircleOutlined />}
                    onClick={() => removePricing(index)}
                  >
                    删除
                  </Button>
                )}
              </Space>
            </div>
          }
        >
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <label>时长数量</label>
                <InputNumber
                  value={pricing.duration}
                  onChange={(val) => updatePricing(index, 'duration', val || 1)}
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="时长数量"
                  disabled={readonly}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <label>时长单位</label>
                <Select
                  value={pricing.unit}
                  onChange={(val) => updatePricing(index, 'unit', val)}
                  style={{ width: '100%' }}
                  disabled={readonly}
                >
                  {durationUnitOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <label>售价(元)</label>
                <InputNumber
                  value={pricing.price / 100}
                  onChange={(val) => updatePricing(index, 'price', Math.round((val || 0) * 100))}
                  min={0}
                  step={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="售价"
                  disabled={readonly}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <label>原价(元)</label>
                <InputNumber
                  value={pricing.originalPrice ? pricing.originalPrice / 100 : undefined}
                  onChange={(val) => updatePricing(index, 'originalPrice', val ? Math.round(val * 100) : undefined)}
                  min={0}
                  step={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="原价"
                  disabled={readonly}
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <label>套餐描述</label>
                <Input
                  value={pricing.description}
                  onChange={(e) => updatePricing(index, 'description', e.target.value)}
                  placeholder="套餐描述"
                  disabled={readonly}
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <label>套餐权益</label>
                <Select
                  mode="tags"
                  value={pricing.benefits}
                  onChange={(val) => updatePricing(index, 'benefits', val)}
                  placeholder="输入权益内容，按回车添加"
                  style={{ width: '100%' }}
                  disabled={readonly}
                  tokenSeparators={[',']}
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Space>
                <Switch
                  checked={pricing.isActive}
                  onChange={(checked) => updatePricing(index, 'isActive', checked)}
                  disabled={readonly}
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                />
                <span>启用状态</span>
              </Space>
            </Col>
            <Col span={12}>
              <Space>
                <Switch
                  checked={pricing.isRecommended}
                  onChange={(checked) => updatePricing(index, 'isRecommended', checked)}
                  disabled={readonly}
                  checkedChildren="推荐"
                  unCheckedChildren="普通"
                />
                <span>推荐套餐</span>
              </Space>
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
              <strong>套餐预览：</strong> {formatPricingName(pricing)} - {formatPrice(pricing.price)}
              {pricing.originalPrice && ` (原价 ${formatPrice(pricing.originalPrice)})`}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default MembershipPricingForm;