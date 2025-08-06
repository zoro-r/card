import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, message, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { createCompany, type CompanyItem } from '@/services/company';

const { TextArea } = Input;
const { Option } = Select;

interface CreateCompanyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  industries: string[];
  scales: string[];
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  industries,
  scales,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 处理日期
      if (values.verifyTime) {
        values.verifyTime = values.verifyTime.format('YYYY-MM-DD');
      }
      if (values.verifyExpiry) {
        values.verifyExpiry = values.verifyExpiry.format('YYYY-MM-DD');
      }

      // 设置默认值
      const companyData = {
        ...values,
        isVerified: values.isVerified || false,
        isActive: values.isActive !== false,
        isPublic: values.isPublic !== false,
        employeeCount: 0,
        viewCount: 0,
        settings: {
          allowPublicSearch: values.allowPublicSearch !== false,
          allowEmployeeJoin: values.allowEmployeeJoin !== false,
          requireApproval: values.requireApproval || false,
        },
      };

      await createCompany(companyData);
      message.success('企业创建成功');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('创建企业失败:', error);
      message.error('创建企业失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新建企业"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={800}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          isPublic: true,
          allowPublicSearch: true,
          allowEmployeeJoin: true,
          requireApproval: false,
          isVerified: false,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="企业名称"
              name="name"
              rules={[
                { required: true, message: '请输入企业名称' },
                { max: 100, message: '企业名称不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入企业全称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="展示名称"
              name="displayName"
              rules={[
                { max: 50, message: '展示名称不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入展示名称（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="英文名称"
              name="englishName"
              rules={[
                { max: 100, message: '英文名称不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入英文名称（可选）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="行业"
              name="industry"
              rules={[
                { required: true, message: '请选择行业' },
              ]}
            >
              <Select placeholder="请选择行业" allowClear>
                {industries.map((industry) => (
                  <Option key={industry} value={industry}>
                    {industry}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="企业规模"
              name="scale"
              rules={[
                { required: true, message: '请选择企业规模' },
              ]}
            >
              <Select placeholder="请选择企业规模" allowClear>
                {scales.map((scale) => (
                  <Option key={scale} value={scale}>
                    {scale}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="成立年份"
              name="establishedYear"
              rules={[
                {
                  type: 'number',
                  min: 1900,
                  max: new Date().getFullYear(),
                  message: '请输入有效的成立年份',
                },
              ]}
            >
              <Input type="number" placeholder="请输入成立年份（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="联系人姓名"
              name="contactName"
              rules={[
                { max: 50, message: '联系人姓名不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="联系电话"
              name="phone"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入企业邮箱（可选）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="官网"
              name="website"
              rules={[
                { type: 'url', message: '请输入有效的网址' },
              ]}
            >
              <Input placeholder="请输入官网地址（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="企业简介"
          name="description"
          rules={[
            { max: 500, message: '企业简介不能超过500个字符' },
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="请输入企业简介（可选）" 
            showCount 
            maxLength={500} 
          />
        </Form.Item>

        <Form.Item
          label="办公地址"
          name="address"
          rules={[
            { max: 200, message: '办公地址不能超过200个字符' },
          ]}
        >
          <Input placeholder="请输入办公地址（可选）" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="统一社会信用代码"
              name="creditCode"
              rules={[
                { 
                  pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
                  message: '请输入有效的统一社会信用代码',
                },
              ]}
            >
              <Input placeholder="请输入信用代码（可选）" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="法定代表人"
              name="legalPerson"
              rules={[
                { max: 50, message: '法定代表人不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入法定代表人（可选）" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="注册资本"
              name="registeredCapital"
              rules={[
                { max: 50, message: '注册资本不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入注册资本（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="是否认证"
              name="isVerified"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="是否激活"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="是否公开"
              name="isPublic"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="允许公开搜索"
              name="allowPublicSearch"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="允许员工加入"
              name="allowEmployeeJoin"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="需要审批"
              name="requireApproval"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        {/* 认证相关信息，只有在选择认证时才显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.isVerified !== curValues.isVerified}>
          {({ getFieldValue }) => {
            const isVerified = getFieldValue('isVerified');
            return isVerified ? (
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="认证类型"
                    name="verifyType"
                    rules={isVerified ? [{ required: true, message: '请输入认证类型' }] : []}
                  >
                    <Input placeholder="请输入认证类型" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="认证时间"
                    name="verifyTime"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="请选择认证时间"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="认证有效期"
                    name="verifyExpiry"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      placeholder="请选择有效期"
                    />
                  </Form.Item>
                </Col>
              </Row>
            ) : null;
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCompanyModal;