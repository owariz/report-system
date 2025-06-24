import { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from './authApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await loginUser(values);
            const { accessToken, refreshToken, user } = response;
            
            login(accessToken, refreshToken, user);
            message.success('Login successful! Redirecting...');
            
            navigate('/');

        } catch (error) {
            const resp = error.response;
            let errorMessage = 'An unexpected error occurred. Please try again later.';

            if (resp) {
                switch (resp.status) {
                    case 400:
                        errorMessage = 'Please complete the Turnstile CAPTCHA verification.';
                        break;
                    case 401:
                        errorMessage = 'Invalid email or password.';
                        break;
                    case 403:
                        errorMessage = 'Please verify your email before logging in.';
                        break;
                    case 404:
                        errorMessage = 'This account does not exist in our system.';
                        break;
                    case 429:
                        errorMessage = 'Too many login attempts. Please wait 15 minutes.';
                        break;
                    default:
                        break;
                }
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                padding: '32px',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={2}>Report System</Title>
                    <Text type="secondary">Please enter your credentials to log in.</Text>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                        >
                            Log in
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">System Version: 1.0.0</Text>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;