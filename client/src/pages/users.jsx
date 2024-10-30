import { useState, useEffect } from "react";
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
} from "antd";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const loadUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/admin/account",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setUsers(response.data.result);
    } catch (error) {
      console.error("Error loading users:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user || { isVerified: false }); // เพิ่มค่าเริ่มต้นให้กับ isVerified
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      const updatedUser = { ...editingUser, ...values };

      // ตรวจสอบว่ามีการกรอกรหัสผ่านหรือไม่
      if (!values.password) {
        delete updatedUser.password; // ถ้ารหัสผ่านไม่ถูกกรอก ให้ลบฟิลด์รหัสผ่าน
      }

      if (editingUser) {
        // แก้ไขข้อมูลผู้ใช้
        await axios.put(
          `http://localhost:4000/api/admin/edit/account/${editingUser.uid}`,
          updatedUser,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        setUsers(
          users.map((user) =>
            user.uid === editingUser.uid ? updatedUser : user
          )
        );
        message.success("แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว");
      } else {
        // เพิ่มผู้ใช้ใหม่
        const response = await axios.post(
          "http://localhost:4000/api/admin/add/account",
          updatedUser,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setUsers([...users, response.data]);
        message.success("เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้");
    } finally {
      handleCancel(); // เคลียร์ข้อมูลทั้งหมด
    }
  };

  const handleDelete = async (uid) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/admin/delete/account/${uid}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setUsers(users.filter((user) => user.uid !== uid));
      message.success("ลบผู้ใช้เรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
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
    },
    {
      title: "บทบาท",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => (status === 0 ? "ใช้งาน" : "ระงับใช้งาน"),
    },
    {
      title: "ยืนยันอีเมล์",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified) =>
        isVerified ? (
          <span className="text-green-400">อีเมล์ถูกยืนยัน</span>
        ) : (
          <span className="text-red-400">ยังไม่ได้ยืนยัน</span>
        ),
    },
    {
      title: "ดำเนินการ",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => showModal(record)}
            color="primary"
            variant="dashed"
          >
            แก้ไข
          </Button>
          <Button
            type="danger"
            onClick={() => handleDelete(record.uid)}
            color="danger"
            variant="solid"
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>จัดการผู้ใช้</Title>
      <Button type="primary" onClick={() => showModal(null)}>
        เพิ่มผู้ใช้ใหม่
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        style={{ marginTop: "20px" }}
      />

      <Modal
        title={editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="username"
            label="ชื่อ"
            rules={[{ required: true, message: "กรุณากรอกชื่อ!" }]}
          >
            <Input placeholder="กรุณากรอกชื่อ" />
          </Form.Item>
          <Form.Item name="password" label="รหัสผ่าน">
            <Input placeholder="กรุณากรอกรหัสผ่าน (ถ้าต้องการเปลี่ยน)" />
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
          {/* เพิ่ม Form.Item สำหรับ isVerified ใน Modal */}
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
              <Option value="DEVELOPER">Developer</Option>
              <Option value="MODULATOR">Moderator</Option>
              <Option value="MEMBER">Member</Option>
              <Option value="GUEST">Guest</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มผู้ใช้"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}