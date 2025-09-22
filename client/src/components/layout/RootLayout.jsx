import { useState, useMemo } from 'react';
import { Layout, Menu, Breadcrumb, Alert, Avatar, Dropdown, Space, Typography, Spin, Button } from 'antd';
import {
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
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
  '/admin/add-student': 'Add Student',
  '/add/json': 'Add JSON',
};

const RootLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, settings, loadingSettings } = useAuth();
  const location = useLocation();

  const maintenanceBypassRoles = ['ADMIN', 'SUPERADMIN', 'DEVELOPER'];

  if (settings?.maintenanceMode && (!user || !maintenanceBypassRoles.includes(user.role))) {
    return <MaintenancePage />;
  }

  const menuItems = useMemo(() => [
    { key: '/', icon: <FileTextOutlined />, label: <Link to="/">Report Student</Link> },
    { key: '/dashboard', icon: <PieChartOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/reports', icon: <FileOutlined />, label: <Link to="/reports">All Reports</Link> },
    { key: '/users', icon: <TeamOutlined />, label: <Link to="/users">Users</Link> },
    { key: '/setting', icon: <SettingOutlined />, label: <Link to="/setting">Setting</Link> },
    { key: '/admin/add-student', icon: <SettingOutlined />, label: <Link to="/admin/add-student">Add Student</Link> },
  ].filter(Boolean), []);

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

  const SiderContent = () => (
    <>
      <div className="h-16 flex items-center justify-center p-4">
        <Text className="text-white text-lg font-bold overflow-hidden text-ellipsis whitespace-nowrap">
          {loadingSettings ? <Spin size="small" /> : (collapsed ? settings?.siteName?.charAt(0) || 'R' : settings?.siteName || 'Report System')}
        </Text>
      </div>
      <Menu theme="dark" defaultSelectedKeys={[location.pathname]} mode="inline" items={menuItems} />
    </>
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sider */}
      <Sider
        className="hidden lg:block"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <SiderContent />
      </Sider>

      {/* Mobile Drawer */}
      <Sider
        className="block lg:hidden"
        trigger={null}
        collapsible
        collapsed={!mobileMenuOpen}
        onCollapse={setMobileMenuOpen}
        collapsedWidth={0}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <SiderContent />
      </Sider>

      <Layout>
        <Header className="flex justify-between items-center px-6 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <Button
              className="block lg:hidden mr-4"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
            <Breadcrumb className="hidden md:block">{breadcrumbItems}</Breadcrumb>
          </div>
          <Dropdown overlay={userMenuItems} trigger={['click']}>
            <Space className="cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <Text className="hidden sm:inline">{user?.username || 'Guest'}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content className="m-0 md:m-4 flex flex-col">
          {settings?.announcementActive && (
            <Alert
              message={settings.announcementText}
              type={settings.announcementType || 'info'}
              banner
              closable
              className="mt-4"
            />
          )}
          {user && !user.isVerified && (
            <Alert
              message="Please verify your email"
              description="Check your inbox to verify your email and gain full access."
              type="warning"
              showIcon
              closable
              className="my-4"
            />
          )}
          <div className="flex-grow p-6 bg-white rounded-lg mt-4">
            {children}
          </div>
        </Content>
        <Footer className="text-center">
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