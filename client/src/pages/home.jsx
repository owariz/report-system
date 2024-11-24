import { useState } from "react";
import { Layout, Button, message, Card, Typography, Modal, Form, Select, Space, Alert, Input } from "antd";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import api from "../lib/api";

const { Title, Text } = Typography;
const { Option } = Select;

const deductedScores = {
  "แต่งกายผิดระเบียบ": 5,
  "ทรงผมผิดระเบียบ": 5,
  "ไม่คล้องบัตรประจำตัว": 5,
  "หนีเรียน": 5,
  "เสพยาเสพติด": 30,
  "การพนัน": 30,
  "ทะเลาะวิวาท": 50,
};

const ReportModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [reportTopic, setReportTopic] = useState('');
  const [deductedScore, setDeductedScore] = useState(null);

  const handleFinish = (values) => {
    const reportData = {
      reportTopic: reportTopic === "อื่น ๆ" ? values.customReportTopic : reportTopic,
      reportDetail: values.reportDetail,
      deductedScore: reportTopic === "อื่น ๆ" ? values.deductedScore : deductedScore,
    };
    onSubmit(reportData);
    form.resetFields();
    setReportTopic('');
    setDeductedScore(null);
  };

  const handleReportTopicChange = (value) => {
    setReportTopic(value);
    const score = deductedScores[value] || null;
    setDeductedScore(score);
    form.setFieldsValue({ deductedScore: score });
  };

  const handleCancel = () => {
    form.resetFields(); // รีเซ็ตฟอร์มเมื่อปิด Modal
    onCancel();
  };

  return (
    <Modal
      title="รายงานนักศึกษา"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} onFinish={handleFinish}>
        <Form.Item
          name="reportTopic"
          label="หัวข้อการรายงาน"
          rules={[{ required: true, message: 'กรุณาเลือกหัวข้อการรายงาน' }]}
        >
          <Select placeholder="เลือกหัวข้อการรายงาน" onChange={handleReportTopicChange}>
            {Object.keys(deductedScores).map((topic) => (
              <Option key={topic} value={topic}>{topic}</Option>
            ))}
            <Option value="อื่น ๆ">อื่น ๆ</Option>
          </Select>
        </Form.Item>

        {reportTopic && reportTopic !== "อื่น ๆ" && (
          <Alert
            className="mb-5"
            message={`คะแนนที่จะหัก: ${deductedScore} คะแนน`}
            type="info"
            showIcon
          />
        )}

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
          name="deductedScore"
          label="คะแนนที่ต้องการหัก"
          rules={[{ required: true, message: 'กรุณากรอกคะแนนที่ต้องการหัก' }]}
        >
          <Input
            type="number"
            placeholder="กรอกคะแนนที่ต้องการหัก"
            value={deductedScore ?? ''}
            onChange={(e) => setDeductedScore(e.target.value)}
            disabled={reportTopic !== "อื่น ๆ"} // Lock input unless "อื่น ๆ" is selected
          />
        </Form.Item>

        <Form.Item
          name="reportDetail"
          label="รายละเอียดการรายงาน"
          rules={[{ required: false, message: 'กรุณากรอกรายละเอียดการรายงาน' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            บันทึก
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function Home() {
  const [sid, setSid] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);

    if (sid.trim() === '') {
      setLoading(false);
      setErrorMessage('กรุณากรอกรหัสนักศึกษา');
      message.error('กรุณากรอกรหัสนักศึกษา');
      return;
    }

    try {
      const res = await api.get(`/student/${sid}`);
      setStudentData(res.data.result);
      setErrorMessage('');
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || "ไม่พบข้อมูลนักศึกษา");
        setStudentData(null);
      } else {
        console.error(error);
        setErrorMessage('เกิดข้อผิดพลาดในการค้นหา');
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (values) => {
    setLoading(true);
  
    const reportData = {
      studentId: studentData.id,
      reportTopic: values.reportTopic,
      reportDetail: values.reportDetail,
      deductedScore: Number(values.deductedScore),
      username: localStorage.getItem('username'),
      email: localStorage.getItem('email'),
    };
  
    try {
      await api.post('/student/report', reportData);
      message.success('ส่งรายงานเรียบร้อยแล้ว');
      setIsModalVisible(false);
      // รีโหลดข้อมูลนักศึกษาใหม่
      // const updatedData = await api.get(`/student/${studentData.sid}`);
      setStudentData(null);
    } catch (error) {
      console.error(error);
      message.error('เกิดข้อผิดพลาดในการส่งรายงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="max-w-screen-xl justify-center items-center bg-transparent my-10">
      <Card bordered={true} className="w-full max-w-lg">
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center mb-6">
            <Title level={2}>ค้นหาข้อมูลนักศึกษา</Title>
            <Typography.Text>กรอกรหัสนักศึกษา</Typography.Text>
          </div>

          {errorMessage && (
              <Alert
                  message="เกิดข้อผิดพลาด"
                  description={errorMessage}
                  type="error"
                  showIcon
              />
          )}

          <Input
            placeholder="กรอก SID ของนักศึกษา"
            value={sid}
            prefix={<SearchOutlined />}
            onChange={(e) => setSid(e.target.value)}
            className="mb-4"
          />

          <Button
            color="default"
            variant="solid"
            block
            onClick={handleSearch}
            loading={loading}
            icon={loading ?? <LoadingOutlined />}
          >
            {loading ? 'กำลังค้าหา...' : 'ค้นหา'}
          </Button>

          {studentData && (
            <Card className="shadow-sm" title="ข้อมูลนักศึกษา">
              <Typography.Paragraph>
                <strong>SID:</strong> <span>{studentData.sid}</span>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>ชื่อ:</strong> <span>{studentData.prefix} {studentData.firstName} {studentData.lastName}</span>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>ชื่อเล่น:</strong> <span>{studentData.nickname || 'ไม่มีชื่อเล่น'}</span>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>อีเมล:</strong> <span>{studentData.email || 'ไม่มีอีเมล'}</span>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>เบอร์โทรศัพท์:</strong> <span>{studentData.phoneNumber || 'ไม่มีเบอร์โทรศัพท์'}</span>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>ชั้นเรียน:</strong> <span>{studentData.grade}/{studentData.classroom}</span>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>สถานะ:</strong> <span>{studentData.status}</span>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>คะแนน:</strong> <span>{studentData.latestScore}</span>
              </Typography.Paragraph>
              <Button type="primary" onClick={() => setIsModalVisible(true)}>
                บันทึกพฤติกรรมนักศึกษา
              </Button>
            </Card>
          )}
        </Space>

        <ReportModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onSubmit={handleReportSubmit}
          loading={loading}
        />
      </Card>
    </Layout>
  );
}