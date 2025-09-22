import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Switch, Tabs, Spin, message, Select } from 'antd';
import api from '../../lib/api';
import Card from '../../components/common/Card';

const { Title, Text } = Typography;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/settings');
        form.setFieldsValue(response);
      } catch (error) {
        message.error('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await api.put('/admin/settings', values);
      message.success('Settings saved successfully!');
    } catch (err) {
      message.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const generalSettings = (
    <div className="space-y-4">
        <Title level={4}>General Settings</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Form.Item
                name="siteName"
                label="Site Name"
                rules={[{ required: true, message: 'Please enter the site name!' }]}
            >
                <Input placeholder="Your Site Name" />
            </Form.Item>
            <Form.Item
                name="adminEmail"
                label="Admin Email (for notifications)"
                rules={[{ type: 'email', message: 'Please enter a valid admin email!' }]}
            >
                <Input placeholder="admin@example.com" />
            </Form.Item>
        </div>
    </div>
  );

  const maintenanceSettings = (
    <div className="space-y-4">
        <Title level={4}>Maintenance & Announcements</Title>
        <Form.Item
            name="maintenanceMode"
            label="Maintenance Mode"
            valuePropName="checked"
            tooltip="If enabled, only admins will be able to log in. A maintenance page will be shown to other users."
        >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.maintenanceMode !== curr.maintenanceMode}>
            {({ getFieldValue }) => getFieldValue('maintenanceMode') && (
                <Form.Item name="maintenanceMessage" label="Maintenance Message">
                    <Input.TextArea rows={3} placeholder="Optional maintenance message" />
                </Form.Item>
            )}
        </Form.Item>
        <Form.Item
            name="announcementActive"
            label="Enable System-wide Announcement"
            valuePropName="checked"
            tooltip="If enabled, a banner with your message will appear at the top of every page."
        >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.announcementActive !== curr.announcementActive}>
            {({ getFieldValue }) => getFieldValue('announcementActive') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item name="announcementType" label="Type" rules={[{ required: true }]}>
                  <Select placeholder="Select a type">
                    <Select.Option value="info">Info</Select.Option>
                    <Select.Option value="success">Success</Select.Option>
                    <Select.Option value="warning">Warning</Select.Option>
                    <Select.Option value="error">Error</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="announcementText" label="Message" rules={[{ required: true }]}>
                    <Input.TextArea rows={4} placeholder="e.g., The system will be down for maintenance..." />
                </Form.Item>
              </div>
            )}
        </Form.Item>
    </div>
  );

  const registrationSettings = (
    <div className="space-y-4">
        <Title level={4}>User Registration</Title>
        <Form.Item
            name="allowUserRegistration"
            label="Allow New User Registrations"
            valuePropName="checked"
            tooltip="If enabled, visitors will be able to sign up for new accounts."
        >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.allowUserRegistration !== curr.allowUserRegistration}>
            {({ getFieldValue }) => getFieldValue('allowUserRegistration') && (
                <Form.Item
                    name="defaultUserRole"
                    label="Default Role for New Users"
                    rules={[{ required: true }]}
                    tooltip="This role will be automatically assigned to new users upon registration."
                >
                    <Select placeholder="Select a role">
                        <Select.Option value="MEMBER">Member</Select.Option>
                        <Select.Option value="GUEST">Guest</Select.Option>
                        <Select.Option value="MODULATOR">Modulator</Select.Option>
                    </Select>
                </Form.Item>
            )}
        </Form.Item>
    </div>
  );

  const tabItems = [
    { key: '1', label: 'General', children: generalSettings },
    { key: '2', label: 'Maintenance', children: maintenanceSettings },
    { key: '3', label: 'Registration', children: registrationSettings },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spin size="large" /></div>;
  }

  return (
    <div className="space-y-6">
      <Title level={2}>System Settings</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Card>
            <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>
        <Form.Item className="mt-6">
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingsPage;