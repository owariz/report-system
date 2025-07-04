import React, { useState } from 'react';
import {
  Card, Button, message, Modal, Form, Select, Space, Alert, Input, Typography, Tag
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const DEDUCTED_SCORES = {
  "แต่งกายผิดระเบียบ": 5,
  "ทรงผมผิดระเบียบ": 5,
  "ไม่คล้องบัตรประจำตัว": 5,
  "หนีเรียน": 5,
  "เสพยาเสพติด": 30,
  "การพนัน": 30,
  "ทะเลาะวิวาท": 50,
};

const ReportModal = ({ student, visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [isCustomTopic, setIsCustomTopic] = useState(false);

  const handleTopicChange = (value) => {
    setIsCustomTopic(value === 'อื่น ๆ');
    if (value !== 'อื่น ๆ') {
      form.setFieldsValue({ deductedScore: DEDUCTED_SCORES[value] });
    } else {
      form.setFieldsValue({ deductedScore: '' });
    }
  };

  const onFinish = (values) => {
    onSubmit(values);
    form.resetFields();
    setIsCustomTopic(false);
  };
  
  const handleCancel = () => {
    form.resetFields();
    setIsCustomTopic(false);
    onCancel();
  };

  return (
    <Modal
      title={`บันทึกพฤติกรรม: ${student?.firstName} ${student?.lastName}`}
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="reportTopic" label="หัวข้อการรายงาน" rules={[{ required: true, message: 'กรุณาเลือกหัวข้อ' }]}>
          <Select placeholder="เลือกหัวข้อ" onChange={handleTopicChange}>
            {Object.keys(DEDUCTED_SCORES).map((topic) => (
              <Option key={topic} value={topic}>{topic}</Option>
            ))}
            <Option value="อื่น ๆ">อื่น ๆ</Option>
          </Select>
        </Form.Item>

        {isCustomTopic && (
          <Form.Item name="customReportTopic" label="ระบุหัวข้อ" rules={[{ required: true, message: 'กรุณาระบุหัวข้อ' }]}>
            <Input placeholder="เช่น ทำลายทรัพย์สิน" />
          </Form.Item>
        )}

        <Form.Item name="deductedScore" label="คะแนนที่จะหัก" rules={[{ required: true, message: 'กรุณาระบุคะแนน' }]}>
          <Input type="number" placeholder="ระบุคะแนน" disabled={!isCustomTopic} />
        </Form.Item>

        <Form.Item name="reportDetail" label="รายละเอียดเพิ่มเติม (ถ้ามี)">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            บันทึกรายงาน
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function SearchAndReportPage() {
  const { user } = useAuth();
  const [sid, setSid] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!sid) {
      setError('กรุณากรอกรหัสนักศึกษา');
      return;
    }
    setLoading(true);
    setError('');
    setStudentData(null);
    try {
      const res = await api.get(`/student/reports/${sid}`);
      setStudentData(res.result);
    } catch (err) {
      setError(err.response?.data?.message || 'ไม่พบข้อมูลนักศึกษา หรือเกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (formValues) => {
    setLoading(true);
    const finalTopic = formValues.reportTopic === 'อื่น ๆ' ? formValues.customReportTopic : formValues.reportTopic;
    const reportPayload = {
      studentSid: studentData.sid,
      reportTopic: finalTopic,
      reportDetail: formValues.reportDetail || '',
      deductedScore: Number(formValues.deductedScore),
      username: user?.username,
      email: user?.email,
    };

    try {
      await api.post('/student/reports/report', reportPayload);
      message.success(`รายงานนักศึกษา ${studentData.firstName} สำเร็จ`);
      setIsModalVisible(false);
      setStudentData(null);
      setSid('');
    } catch (err) {
      message.error('เกิดข้อผิดพลาดในการส่งรายงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={2}>ค้นหาและบันทึกพฤติกรรมนักศึกษา</Title>
      <Text>ค้นหาข้อมูลนักศึกษาด้วยรหัสนักศึกษา (SID) เพื่อดำเนินการบันทึกพฤติกรรม</Text>
      
      <Card style={{ marginTop: '24px' }}>
        <Space>
          <Input
            placeholder="กรอกรหัสนักศึกษา (SID)"
            value={sid}
            onChange={(e) => setSid(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: '300px' }}
          />
          <Button type="primary" onClick={handleSearch} loading={loading} icon={<SearchOutlined />}>
            ค้นหา
          </Button>
        </Space>

        {/* เงื่อนไขใหม่: แสดง error เฉพาะเมื่อไม่มี studentData และ error มีค่า */}
        {(!studentData && error) && <Alert message={error} type="error" showIcon style={{ marginTop: '20px' }} />}

        {studentData && (
          <Card style={{ marginTop: '20px' }} type="inner" title="ผลการค้นหา">
            <Paragraph><strong>SID:</strong> {studentData.sid}</Paragraph>
            <Paragraph><strong>ชื่อ-สกุล:</strong> {`${studentData.prefix} ${studentData.firstName} ${studentData.lastName}`}</Paragraph>
            <Paragraph><strong>ระดับชั้น:</strong> {`${studentData.grade}/${studentData.classroom}`}</Paragraph>
            <Paragraph><strong>คะแนนปัจจุบัน:</strong> <Tag color={studentData.latestScore > 50 ? 'green' : 'red'}>{studentData.latestScore}</Tag></Paragraph>
            <Button type="primary" danger onClick={() => setIsModalVisible(true)}>
              บันทึกพฤติกรรม
            </Button>
          </Card>
        )}
      </Card>

      {studentData && (
        <ReportModal
          student={studentData}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSubmit={handleReportSubmit}
          loading={loading}
        />
      )}
    </>
  );
} 