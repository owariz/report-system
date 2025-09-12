import { useState, useMemo } from 'react';
import { Layout, Menu, Breadcrumb, Alert, Avatar, Dropdown, Space, Typography, Spin } from 'antd';
import {
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  ToolOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link, useLocation, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import MaintenancePage from '../../features/maintenance/MaintenancePage';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

const breadcrumbNameMap = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/reports': 'All Reports',
  '/users': 'Users',
  '/setting': 'Setting',
  '/add': 'Developer',
  '/add/json': 'Add JSON',
};

const RootLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, settings, loadingSettings } = useAuth();
  const location = useLocation();
  
  const adminRoles = ['DEVELOPER', 'ADMIN', 'SUPERADMIN'];
  const devRoles = ['DEVELOPER', 'SUPERADMIN'];

  // Define roles that can bypass maintenance mode
  const maintenanceBypassRoles = ['ADMIN', 'SUPERADMIN', 'DEVELOPER'];

  // ถ้าเปิด maintenance mode และ (user ไม่มี หรือ user ไม่ใช่ bypass) ให้แสดงเฉพาะหน้า MaintenancePage
  if (
    settings?.maintenanceMode &&
    (!user || !maintenanceBypassRoles.includes(user.role))
  ) {
    return <MaintenancePage />;
  }

  const menuItems = useMemo(() => [
    { key: '/', icon: <FileTextOutlined />, label: <Link to="/">Report Student</Link> },
    { key: '/dashboard', icon: <PieChartOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/reports', icon: <FileOutlined />, label: <Link to="/reports">All Reports</Link> },
    { key: '/users', icon: <TeamOutlined />, label: <Link to="/users">Users</Link> },
    { key: '/setting', icon: <SettingOutlined />, label: <Link to="/setting">Setting</Link> },
    (user && adminRoles.includes(user.role)) && {
      key: 'sub-admin',
      icon: <ToolOutlined />,
      label: 'Developer',
      children: [
        { key: '/add/json', label: <Link to="/add/json">Add JSON</Link> },
      ],
    },
  ].filter(Boolean), [user, adminRoles]);

  const userMenuItems = (
    <Menu>
      <Menu.Item key="role" disabled style={{ cursor: 'default' }}>
        <Text strong>{user?.username}</Text>
        <br />
        <Text type="secondary">{user?.role}</Text>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = useMemo(() => {
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return (
        <Breadcrumb.Item key={url}>
          <Link to={url}>{breadcrumbNameMap[url] || url.split('/').pop()}</Link>
        </Breadcrumb.Item>
      );
    });
    return [
      <Breadcrumb.Item key="home">
        <Link to="/">Home</Link>
      </Breadcrumb.Item>,
    ].concat(extraBreadcrumbItems);
  }, [location.pathname]);

  if (location.pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ padding: '16px', textAlign: 'center', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {loadingSettings ? <Spin size="small" /> : (collapsed ? settings?.siteName?.charAt(0) || 'R' : settings?.siteName || 'Report System')}
          </Text>
        </div>
        <Menu theme="dark" defaultSelectedKeys={[location.pathname]} mode="inline" items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <Breadcrumb>{breadcrumbItems}</Breadcrumb>
          <Dropdown overlay={userMenuItems} trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <Text>{user?.username || 'Guest'}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '0 16px', display: 'flex', flexDirection: 'column' }}>
          {settings?.announcementActive && (
            <Alert
              message={settings.announcementText}
              type={settings.announcementType || 'info'}
              banner
              closable
              style={{ margin: '16px 0 0' }}
            />
          )}
          {user && !user.isVerified && (
            <Alert
              message="Please verify your email"
              description="Check your inbox to verify your email and gain full access."
              type="warning"
              showIcon
              closable
              style={{ margin: '16px 0' }}
            />
          )}
          <div style={{ flex: 1, padding: 24, background: '#fff', borderRadius: 8, marginTop: '16px' }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Report System ©{new Date().getFullYear()} Created by owariz
        </Footer>
      </Layout>
    </Layout>
  );
};

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RootLayout;