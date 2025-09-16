import React, { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Select } from 'antd';
import api from '../../lib/api';

const { Option } = Select;

const AddStudentPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Convert sid and classroom to numbers
      const payload = {
        ...values,
        sid: parseInt(values.sid, 10),
        classroom: parseInt(values.classroom, 10),
        status: 'active', // Default status
      };

      const response = await api.post('/admin/students', payload);
      message.success('Student added successfully!');
      form.resetFields();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add student. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Add New Student">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="sid"
              label="Student ID (SID)"
              rules={[{ required: true, message: 'Please input the student ID!' }]}
            >
              <Input type="number" placeholder="e.g. 12345" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="prefix"
              label="Prefix"
              rules={[{ required: true, message: 'Please select a prefix!' }]}
            >
              <Select placeholder="Select a prefix">
                <Option value="เด็กชาย">เด็กชาย</Option>
                <Option value="เด็กหญิง">เด็กหญิง</Option>
                <Option value="นาย">นาย</Option>
                <Option value="นางสาว">นางสาว</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
             <Form.Item
              name="nickname"
              label="Nickname"
            >
              <Input placeholder="e.g. Somchai" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please input the first name!' }]}
            >
              <Input placeholder="e.g. John" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please input the last name!' }]}
            >
              <Input placeholder="e.g. Doe" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
           <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'The input is not valid E-mail!' }]}
            >
              <Input placeholder="e.g. john.doe@example.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
            >
              <Input placeholder="e.g. 0812345678" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="grade"
              label="Grade"
              rules={[{ required: true, message: 'Please input the grade!' }]}
            >
              <Input placeholder="e.g. ม.6" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="classroom"
              label="Classroom"
              rules={[{ required: true, message: 'Please input the classroom!' }]}
            >
              <Input type="number" placeholder="e.g. 3" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Student
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddStudentPage;
