import PropTypes from "prop-types"; 
import { Card, Space } from "antd";

import Navbar from "./Navbar";
import AdminMenu from "./AdminMenu";

export default function RootLayout({ children, profile }) {
  const adminRoles = ["DEVELOPER", "ADMIN", "SUPERADMIN"];

  return (
    <div className="container max-w-6xl mx-auto p-5">
      <Card bordered={false} className="shadow-md">
        <Space direction="vertical" size="large" className="w-full">
          <Navbar profile={profile} />
          {/* ตรวจสอบ profile ก่อนที่จะเข้าถึง role */}
          {profile && adminRoles.includes(profile.role) && <AdminMenu profile={profile} />}
          {children}
        </Space>
      </Card>
    </div>
  );
}


RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
  profile: PropTypes.shape({
    role: PropTypes.string.isRequired,
    // สามารถเพิ่ม prop อื่น ๆ ของ profile ที่คุณต้องการได้
  }), // ทำให้ profile ไม่ต้องเป็น required
};