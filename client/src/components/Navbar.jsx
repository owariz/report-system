import PropTypes from 'prop-types';

import { Card, Typography, Flex, Button, Dropdown, Space } from "antd";
import { SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";

const { Title } = Typography;

export default function Navbar({ profile }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const username = localStorage.getItem("username");

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.reload();
    };

    const items = [
        {
          key: '1',
          label: profile?.email ?? "Email",
          disabled: true,
        },
        {
          type: 'divider',
        },
        {
          key: '2',
          label: 'Profile',
          icon: <UserOutlined />,
        },
        {
          key: '3',
          label: 'Settings',
          icon: <SettingOutlined />,
        },
        {
            key: '4',
            label: 'ออกจากระบบ',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Card size="small" type="inner" className="shadow-sm">
            <Flex justify="space-between" align="center">
                <Link to={'/'}>
                    <Title level={5} style={{ margin: 0 }}>My Application</Title>
                </Link>

                <Flex justify="center" gap={10}>
                    {isLoggedIn ? (
                        <Dropdown menu={{items}} color="primary">
                            <Space><Button color="default" variant="solid" className="w-20 md:w-32">{username}</Button></Space>
                        </Dropdown>
                    ) : (
                        <Button color="default" variant="solid" className="w-24 md:w-32">เข้าสู่ระบบ</Button>
                    )}
                </Flex>
            </Flex>
        </Card>
    );
}

Navbar.propTypes = {
    profile: PropTypes.shape({
        email: PropTypes.string,
        role: PropTypes.string,
    }),
};