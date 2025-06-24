import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col, Switch, Card, Tabs, Spin, message, Select } from 'antd';
import api from '../../lib/api'; // Assuming you have this api utility

const { Title } = Typography;

const SettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fetch initial settings
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
    <Card title="General Settings">
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
    </Card>
  );

  const maintenanceSettings = (
    <Card title="Maintenance & Announcements">
        <Form.Item
            name="maintenanceMode"
            label="Maintenance Mode"
            valuePropName="checked"
            tooltip="If enabled, only admins will be able to log in. A maintenance page will be shown to other users."
        >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item
            name="announcementActive"
            label="Enable System-wide Announcement"
            valuePropName="checked"
            style={{ marginTop: '20px' }}
            tooltip="If enabled, a banner with your message will appear at the top of every page."
        >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
        </Form.Item>
        <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.announcementActive !== currentValues.announcementActive}
        >
            {({ getFieldValue }) =>
            getFieldValue('announcementActive') ? (
              <>
                <Form.Item
                    name="announcementType"
                    label="Announcement Type"
                    rules={[{ required: true, message: 'Please select an announcement type!' }]}
                >
                  <Select placeholder="Select a type">
                    <Select.Option value="info">Info</Select.Option>
                    <Select.Option value="success">Success</Select.Option>
                    <Select.Option value="warning">Warning</Select.Option>
                    <Select.Option value="error">Error</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                    name="announcementText"
                    label="Announcement Message"
                    rules={[{ required: true, message: 'Please enter an announcement message!' }]}
                >
                    <Input.TextArea rows={4} placeholder="e.g., The system will be down for maintenance..." />
                </Form.Item>
              </>
            ) : null
            }
        </Form.Item>
    </Card>
  );

  const registrationSettings = (
    <Card title="User Registration Settings">
      <Form.Item
        name="allowUserRegistration"
        label="Allow New User Registrations"
        valuePropName="checked"
        tooltip="If enabled, visitors will be able to sign up for new accounts."
      >
        <Switch checkedChildren="On" unCheckedChildren="Off" />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.allowUserRegistration !== currentValues.allowUserRegistration}
      >
        {({ getFieldValue }) =>
          getFieldValue('allowUserRegistration') ? (
            <Form.Item
              name="defaultUserRole"
              label="Default Role for New Users"
              rules={[{ required: true, message: 'Please select a default role!' }]}
              tooltip="This role will be automatically assigned to new users upon registration."
            >
              <Select placeholder="Select a role">
                {/* These values should ideally come from your backend/enum */}
                <Select.Option value="MEMBER">Member</Select.Option>
                <Select.Option value="GUEST">Guest</Select.Option>
                <Select.Option value="MODULATOR">Modulator</Select.Option>
              </Select>
            </Form.Item>
          ) : null
        }
      </Form.Item>
    </Card>
  );

  const tabItems = [
    {
      key: '1',
      label: 'General',
      children: generalSettings,
    },
    {
      key: '2',
      label: 'Maintenance & Announcements',
      children: maintenanceSettings,
    },
    {
      key: '3',
      label: 'User Registration',
      children: registrationSettings,
    },
  ];

  if (loading) {
    return <Spin tip="Loading Settings..." style={{ display: 'block', marginTop: '50px' }} />;
  }

  return (
    <>
      <Title level={2}>System Settings</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Tabs defaultActiveKey="1" items={tabItems} style={{background: 'white', padding: '16px', borderRadius: '8px'}}/>
        <Form.Item style={{ marginTop: '24px' }}>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default SettingsPage;