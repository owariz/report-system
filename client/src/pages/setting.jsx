import { useState } from "react";
import { Form, Input, Button, Typography, Alert, Row, Col, Switch, Card, Flex } from "antd";

const { Title } = Typography;

export default function Settings() {
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);

  const handleFinish = async (values) => {
    try {
      // ทำการส่งค่าที่ได้ไปยัง API (ตัวอย่าง)
      console.log("Settings Updated:", values);
      setSuccess(true);
      setError('');
      // เคลียร์ฟอร์มหลังจากบันทึก
      form.resetFields();
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
      setSuccess(false);
    }
  };

  const handleSwitchChange = (checked) => {
    setIsAnnouncementActive(checked);
    // ถ้าเปลี่ยนสถานะเป็นปิด ก็เคลียร์ข้อความ
    if (!checked) {
      form.setFieldsValue({ announcementText: '' });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
        <Title level={2}>ตั้งค่าระบบ</Title>
        {success && <Alert message="บันทึกการตั้งค่าเรียบร้อยแล้ว" type="success" showIcon />}
        {error && <Alert message={error} type="error" showIcon />}

        <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Row gutter={16}>
                <Col xs={24} sm={24} md={24}>
                    <Form.Item
                        name="siteName"
                        label="ชื่อเว็บไซต์"
                        rules={[{ required: true, message: 'กรุณากรอกชื่อเว็บไซต์!' }]}
                    >
                        <Input placeholder="กรุณากรอกชื่อเว็บไซต์" />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12}>
                    <Form.Item
                        name="adminEmail"
                        label="อีเมล์ผู้ดูแลระบบ"
                        rules={[{ required: true, message: 'กรุณากรอกอีเมล์!' }, { type: 'email', message: 'กรุณากรอกอีเมล์ให้ถูกต้อง!' }]}
                    >
                        <Input placeholder="กรุณากรอกอีเมล์ผู้ดูแลระบบ" />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12}>
                    <Form.Item
                        name="supportEmail"
                        label="อีเมล์นักพัฒนา"
                        rules={[{ required: true, message: 'กรุณากรอกอีเมล์!' }, { type: 'email', message: 'กรุณากรอกอีเมล์ให้ถูกต้อง!' }]}
                    >
                        <Input placeholder="กรุณากรอกอีเมล์นักพัฒนา" />
                    </Form.Item>
                </Col>

                {/* ตั้งค่าการเปิด-ปิดเว็บไซต์ */}
                <Col xs={24} sm={24} md={12}>
                    <Card size="small">
                        <Form.Item
                            name="siteActive"
                            // label="สถานะเว็บไซต์"
                            valuePropName="checked"
                            className="mb-0"
                        >
                            <Flex justify="space-between">
                                <span>สถานะเว็บไซต์</span>
                                <Switch checkedChildren="เปิด" unCheckedChildren="ปิด" />
                            </Flex>
                        </Form.Item>
                    </Card>
                    
                </Col>

                {/* ตั้งค่าการเปิด-ปิดระบบประกาศ */}
                <Col xs={24} sm={24} md={12}>
                    <Card size="small">
                        <Form.Item
                            name="announcementActive"
                            valuePropName="checked"
                            className="mb-0"
                        >
                            <Flex justify="space-between">
                                <span>ประกาศข่าวสาร</span>
                                <Switch
                                    checkedChildren="เปิด"
                                    unCheckedChildren="ปิด"
                                    onChange={handleSwitchChange}
                                />
                            </Flex>
                        </Form.Item>

                        {/* แสดง Input เมื่อประกาศเปิด */}
                        {isAnnouncementActive && (
                            <Form.Item
                                name="announcementText"
                                label="ข้อความประกาศ"
                                rules={[{ required: true, message: 'กรุณากรอกข้อความประกาศ!' }]}
                            >
                                <Input.TextArea placeholder="กรุณากรอกข้อความประกาศ" rows={4} />
                            </Form.Item>
                        )}
                    </Card>
                </Col>
            </Row>

            <Form.Item className="mt-5">
                <Button type="primary" htmlType="submit">บันทึกการตั้งค่า</Button>
            </Form.Item>
        </Form>
    </div>
  );
}