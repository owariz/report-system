import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography, Space } from 'antd';

const { Title } = Typography;

const initialUsers = [
  { key: '1', name: 'John Doe', email: 'john@example.com', role: 'User' },
  { key: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const showModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleFinish = (values) => {
    if (editingUser) {
      // แก้ไขผู้ใช้
      setUsers(users.map(user => (user.key === editingUser.key ? { ...user, ...values } : user)));
    } else {
      // เพิ่มผู้ใช้ใหม่
      setUsers([...users, { key: `${users.length + 1}`, ...values }]);
    }
    handleCancel();
  };

  const handleDelete = (key) => {
    setUsers(users.filter(user => user.key !== key));
  };

  const columns = [
    {
      title: 'ชื่อ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'อีเมล์',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'บทบาท',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'ดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>แก้ไข</Button>
          <Button type="danger" onClick={() => handleDelete(record.key)}>ลบ</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>จัดการผู้ใช้</Title>
      <Button type="primary" onClick={() => showModal(null)}>เพิ่มผู้ใช้ใหม่</Button>
      <Table columns={columns} dataSource={users} style={{ marginTop: '20px' }} />

      <Modal
        title={editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="ชื่อ"
            rules={[{ required: true, message: 'กรุณากรอกชื่อ!' }]}
          >
            <Input placeholder="กรุณากรอกชื่อ" />
          </Form.Item>
          <Form.Item
            name="email"
            label="อีเมล์"
            rules={[{ required: true, message: 'กรุณากรอกอีเมล์!' }, { type: 'email', message: 'กรุณากรอกอีเมล์ให้ถูกต้อง!' }]}
          >
            <Input placeholder="กรุณากรอกอีเมล์" />
          </Form.Item>
          <Form.Item
            name="role"
            label="บทบาท"
            rules={[{ required: true, message: 'กรุณาเลือกบทบาท!' }]}
          >
            <Input placeholder="กรุณากรอกบทบาท" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มผู้ใช้'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}