import { useState } from "react";
import axios from 'axios';
import { Layout, Input, Button, message, Card, Typography, Modal, Form, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const ReportModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [reportTopic, setReportTopic] = useState('');

  const handleFinish = (values) => {
    const reportData = {
      reportTopic: reportTopic === "อื่น ๆ" ? values.customReportTopic : reportTopic,
      reportDetail: values.reportDetail,
      deductedScore: values.deductedScore,
    };
    onSubmit(reportData);
    form.resetFields();
    setReportTopic(''); // Reset selected topic
  };

  return (
    <Modal
      title="รายงานนักศึกษา"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} onFinish={handleFinish}>
        <Form.Item
          name="reportTopic"
          label="หัวข้อการรายงาน"
          rules={[{ required: true, message: 'กรุณาเลือกหัวข้อการรายงาน' }]}
        >
          <Select placeholder="เลือกหัวข้อการรายงาน" onChange={setReportTopic}>
            <Option value="ผิดกฎ">ผิดกฎ</Option>
            <Option value="มีพฤติกรรมไม่เหมาะสม">มีพฤติกรรมไม่เหมาะสม</Option>
            <Option value="ขาดเรียน">ขาดเรียน</Option>
            <Option value="อื่น ๆ">อื่น ๆ</Option>
          </Select>
        </Form.Item>
        {reportTopic === "อื่น ๆ" && (
          <Form.Item
            name="customReportTopic"
            label="กรอกหัวข้ออื่น"
            rules={[{ required: true, message: 'กรุณากรอกหัวข้ออื่น' }]}
          >
            <Input placeholder="กรอกหัวข้อที่ต้องการ" />
          </Form.Item>
        )}
        <Form.Item
          name="reportDetail"
          label="รายละเอียดการรายงาน"
          rules={[{ required: true, message: 'กรุณากรอกรายละเอียดการรายงาน' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="deductedScore"
          label="คะแนนที่ต้องการหัก"
          rules={[{ required: true, message: 'กรุณากรอกคะแนนที่ต้องการหัก' }]}
        >
          <Input type="number" placeholder="กรอกคะแนนที่ต้องการหัก" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            ส่งรายงาน
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function Home() {
  const [studentData, setStudentData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSearch = async (sid) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/student/${sid}`);
      setStudentData(res.data.result);
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || "ไม่พบข้อมูลนักศึกษา");
        setStudentData(null);
      } else {
        console.error(error);
        message.error("เกิดข้อผิดพลาดในการค้นหา");
      }
    }
  };

  const handleReportSubmit = async (values) => {
      const reportData = {
          studentId: studentData.id, // เพิ่ม studentId ที่ถูกค้นหามาจากข้อมูลนักเรียน
          reportTopic: values.reportTopic,
          reportDetail: values.reportDetail,
          deductedScore: Number(values.deductedScore),
          username: localStorage.getItem('username'), // แทนที่ด้วยชื่อผู้ใช้จริง
          email: 'test@test.com', // แทนที่ด้วยอีเมลจริง
      };

      try {
          await axios.post('http://localhost:4000/api/student/report', reportData);
          message.success('ส่งรายงานเรียบร้อยแล้ว');
          setIsModalVisible(false);
      } catch (error) {
          console.error(error);
          message.error('เกิดข้อผิดพลาดในการส่งรายงาน');
      }
  };

  return (
    <Layout className="max-w-screen-xl">
      <div className="min-w-full md:min-w-96 mx-auto">
        <h1 className="text-xl font-bold mb-4">ค้นหาข้อมูลนักศึกษา</h1>
        <Search
          placeholder="กรอก SID ของนักศึกษา"
          enterButton
          icon={<SearchOutlined />}
          onSearch={handleSearch}
          className="mb-4"
        />

        {studentData && (
          <Card className="shadow-md">
            <Typography.Paragraph>
              <strong>SID:</strong> {studentData.sid}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>ชื่อ:</strong> {studentData.prefix} {studentData.firstName} {studentData.lastName} 
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>ชื่อเล่น:</strong> {studentData.nickname || 'ไม่มีชื่อเล่น'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>อีเมล:</strong> {studentData.email || 'ไม่มีอีเมล'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>เบอร์โทรศัพท์:</strong> {studentData.phoneNumber || 'ไม่มีเบอร์โทรศัพท์'}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>ชั้นเรียน:</strong> {studentData.grade}/{studentData.classroom}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>สถานะ:</strong> {studentData.status}
            </Typography.Paragraph>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              รายงานนักศึกษา
            </Button>
          </Card>
        )}

        <ReportModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSubmit={handleReportSubmit}
        />
      </div>
    </Layout>
  );
}