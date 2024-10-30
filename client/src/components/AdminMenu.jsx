import PropTypes from "prop-types"; 
import { Card, Menu } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function AdminMenu({ profile }) {
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const adminRoles = ["DEVELOPER", "ADMIN", "SUPERADMIN"];
  const devRoles = ["DEVELOPER", "SUPERADMIN"];

  return (
    <Card size="small" bordered={false}>
      <Menu onClick={handleMenuClick} mode="horizontal" className="w-full">
        <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
          Dashboard
        </Menu.Item>

        <Menu.Item key="/reports" icon={<FileTextOutlined />}>
          รายงาน
        </Menu.Item>

        {profile && adminRoles.includes(profile.role) && (
          <>
            <Menu.Item key="/users" icon={<UserOutlined />}>
              จัดการผู้ใช้งาน
            </Menu.Item>

            <Menu.Item key="/setting" icon={<SettingOutlined />}>
              การตั้งค่า
            </Menu.Item>
          </>
        )}

        {/* ตรวจสอบบทบาทสำหรับเมนู ADD JSON DATA */}
        {profile && devRoles.includes(profile.role) && (
          <Menu.Item key="/add/json">
            ADD JSON DATA
          </Menu.Item>
        )}
      </Menu>
    </Card>
  );
}

AdminMenu.propTypes = {
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
    // สามารถเพิ่ม prop อื่น ๆ ของ profile ที่คุณต้องการได้
  }), // ทำให้ profile ไม่ต้องเป็น required
};