import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Switch, message, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { 
  createEmployee, 
  getDepartments, 
  getLevels, 
  getStatusOptions,
  getContractTypeOptions,
  type EmployeeItem 
} from '@/services/employee';

const { Option } = Select;

interface CreateEmployeeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  companyId: string;
}

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  companyId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [contractTypeOptions, setContractTypeOptions] = useState<Array<{ value: string; label: string }>>([]);

  // 获取选项数据
  useEffect(() => {
    if (visible && companyId) {
      const fetchOptions = async () => {
        try {
          const [
            departmentsData,
            levelsData,
            statusData,
            contractTypesData,
          ] = await Promise.all([
            getDepartments(companyId),
            getLevels(companyId),
            getStatusOptions(),
            getContractTypeOptions(),
          ]);

          setDepartments(departmentsData);
          setLevels(levelsData);
          setStatusOptions(statusData);
          setContractTypeOptions(contractTypesData);
        } catch (error) {
          console.error('获取选项数据失败:', error);
          message.error('获取选项数据失败');
        }
      };

      fetchOptions();
    }
  }, [visible, companyId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 处理日期
      if (values.joinDate) {
        values.joinDate = values.joinDate.format('YYYY-MM-DD');
      }
      if (values.probationEndDate) {
        values.probationEndDate = values.probationEndDate.format('YYYY-MM-DD');
      }

      // 设置默认值
      const employeeData = {
        ...values,
        companyId,
        permissions: [],
        subordinateIds: [],
        isActive: values.isActive !== false,
        canManageEmployees: false,
        canEditCompanyInfo: false,
        isManager: false,
      };

      await createEmployee(companyId, employeeData);
      message.success('员工创建成功');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('创建员工失败:', error);
      message.error('创建员工失败，请重试');
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
      title="新建员工"
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
          status: '在职',
          contractType: '正式员工',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="姓名"
              name="name"
              rules={[
                { required: true, message: '请输入员工姓名' },
                { max: 50, message: '姓名不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入员工姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="职位"
              name="position"
              rules={[
                { required: true, message: '请输入职位' },
                { max: 50, message: '职位不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入职位" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="手机号码"
              name="phone"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
              ]}
            >
              <Input placeholder="请输入手机号码（可选）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="部门"
              name="department"
              rules={[
                { max: 50, message: '部门名称不能超过50个字符' },
              ]}
            >
              <Select 
                placeholder="请选择部门（可选）" 
                allowClear
                showSearch
                optionFilterProp="children"
                mode="tags"
                maxTagCount={1}
              >
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="职级"
              name="level"
              rules={[
                { max: 50, message: '职级不能超过50个字符' },
              ]}
            >
              <Select 
                placeholder="请选择职级（可选）" 
                allowClear
                showSearch
                optionFilterProp="children"
                mode="tags"
                maxTagCount={1}
              >
                {levels.map((level) => (
                  <Option key={level} value={level}>
                    {level}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="入职日期"
              name="joinDate"
              rules={[
                { required: true, message: '请选择入职日期' },
              ]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="请选择入职日期"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="试用期结束日期"
              name="probationEndDate"
            >
              <DatePicker 
                style={{ width: '100%' }}
                placeholder="请选择试用期结束日期（可选）"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="员工状态"
              name="status"
              rules={[
                { required: true, message: '请选择员工状态' },
              ]}
            >
              <Select placeholder="请选择员工状态">
                {statusOptions.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="合同类型"
              name="contractType"
            >
              <Select placeholder="请选择合同类型（可选）" allowClear>
                {contractTypeOptions.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="工作邮箱"
              name="workEmail"
              rules={[
                { type: 'email', message: '请输入有效的工作邮箱地址' },
              ]}
            >
              <Input placeholder="请输入工作邮箱（可选）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="工作电话"
              name="workPhone"
              rules={[
                { pattern: /^[\d-\s\+\(\)]+$/, message: '请输入有效的工作电话' },
              ]}
            >
              <Input placeholder="请输入工作电话（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="分机号"
              name="extension"
              rules={[
                { pattern: /^\d+$/, message: '分机号只能包含数字' },
              ]}
            >
              <Input placeholder="请输入分机号（可选）" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="是否激活"
              name="isActive"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="工作地址"
          name="workAddress"
          rules={[
            { max: 200, message: '工作地址不能超过200个字符' },
          ]}
        >
          <Input placeholder="请输入工作地址（可选）" />
        </Form.Item>

        <Form.Item
          label="备注"
          name="notes"
          rules={[
            { max: 500, message: '备注不能超过500个字符' },
          ]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="请输入备注信息（可选）" 
            showCount 
            maxLength={500} 
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateEmployeeModal;