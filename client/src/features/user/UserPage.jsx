import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Typography,
  Space,
  message,
  Select,
  Checkbox,
  Tag,
} from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from "../../context/AuthContext";
import { getAllUsers, updateUser, createUser, deleteUser } from './userApi';
import { formatDate } from "../../utils/formatDate";
import useDebounce from "../../hooks/useDebounce";
import Card from "../../components/common/Card";
import UserLogs from "./components/UserLogs";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      if (response && response.result) {
        const usersWithKeys = response.result.map(user => ({ ...user, key: user.id }));
        setUsers(usersWithKeys);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchText) {
      return users;
    }
    const lowercasedText = debouncedSearchText.toLowerCase();
    return users.filter(user => 
      user.username.toLowerCase().includes(lowercasedText) ||
      user.email.toLowerCase().includes(lowercasedText)
    );
  }, [users, debouncedSearchText]);

  const showModal = (user) => {
    setEditingUser(user);
    if (user) {
      const formValues = { ...user };
      delete formValues.password; 
      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
      form.setFieldsValue({ isVerified: false });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success("อัปเดตผู้ใช้สำเร็จ");
      } else {
        await createUser(values);
        message.success("สร้างผู้ใช้ใหม่สำเร็จ");
      }
      setIsModalVisible(false);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error("Error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?',
      icon: <ExclamationCircleOutlined />,
      content: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
      okText: 'ใช่, ลบเลย',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteUser(id);
          setUsers(users.filter((user) => user.id !== id));
          message.success("ลบผู้ใช้เรียบร้อยแล้ว");
        } catch (error) {
          console.error("Error deleting user:", error);
          message.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
        }
      },
    });
  };

  const columns = [
    {
      title: "ชื่อ",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "อีเมล์",
      dataIndex: "email",
      key: "email",
      responsive: ['md'],
    },
    {
      title: "บทบาท",
      dataIndex: "role",
      key: "role",
      responsive: ['sm'],
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "สถานะ",
      dataIndex: "isVerified",
      key: "isVerified",
      responsive: ['md'],
      render: (isVerified) =>
        isVerified ? (
          <Tag color="success">ยืนยันแล้ว</Tag>
        ) : (
          <Tag color="error">ยังไม่ยืนยัน</Tag>
        ),
    },
    {
      title: "เข้าสู่ระบบล่าสุด",
      dataIndex: "lastLogin",
      key: "lastLogin",
      responsive: ['lg'],
      render: (text) => (text ? formatDate(text) : "N/A"),
    },
    {
      title: "สร้างเมื่อ",
      dataIndex: "createdAt",
      key: "createdAt",
      responsive: ['lg'],
      render: (text) => formatDate(text),
    },
    {
      title: "ดำเนินการ",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>
            แก้ไข
          </Button>
          <Button
            danger
            onClick={() => handleDelete(record.id)}
            disabled={record.role === 'SUPERADMIN' || record.id === currentUser?.id}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>จัดการผู้ใช้</Title>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <Button onClick={() => showModal(null)} type="primary" className="w-full sm:w-auto">
                เพิ่มผู้ใช้ใหม่
            </Button>
            <Search
                placeholder="ค้นหาจากชื่อ หรืออีเมล์"
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:max-w-xs"
                allowClear
            />
        </div>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          expandable={{
            expandedRowRender: record => <UserLogs userEmail={record.email} />,
            rowExpandable: record => true,
          }}
          rowKey="id"
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleOk}>
          <Form.Item
            name="username"
            label="ชื่อ"
            rules={[{ required: true, message: "กรุณากรอกชื่อ!" }]}
          >
            <Input placeholder="กรุณากรอกชื่อ" />
          </Form.Item>
          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: !editingUser, message: "กรุณากรอกรหัสผ่าน" }]}
          >
            <Input.Password
              placeholder={
                editingUser ? "เว้นว่างไว้เพื่อคงรหัสผ่านเดิม" : ""
              }
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="อีเมล์"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล์!" },
              { type: "email", message: "กรุณากรอกอีเมล์ให้ถูกต้อง!" },
            ]}
          >
            <Input placeholder="กรุณากรอกอีเมล์" />
          </Form.Item>
          <Form.Item
            name="isVerified"
            label="ยืนยันอีเมล์"
            valuePropName="checked"
          >
            <Checkbox>อีเมล์ถูกยืนยัน</Checkbox>
          </Form.Item>
          <Form.Item
            name="role"
            label="บทบาท"
            rules={[{ required: true, message: "กรุณาเลือกบทบาท!" }]}
          >
            <Select placeholder="กรุณาเลือกบทบาท">
              <Option value="SUPERADMIN">SuperAdmin</Option>
              <Option value="ADMIN">Admin</Option>
              <Option value="MODULATOR">Moderator</Option>
              <Option value="MEMBER">Member</Option>
              <Option value="GUEST">Guest</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingUser ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มผู้ใช้"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
