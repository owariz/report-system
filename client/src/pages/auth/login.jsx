import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Space, Alert, Card, Typography } from "antd";
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        if (loggedIn === 'true') return window.location.href = '/';
    }, []);

    const loginUser = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        if (email.length <= 0) {
            setErrorMessage('กรุณากรอกอีเมล');
            setLoading(false);
            return;
        }

        if (password.length <= 0) {
            setErrorMessage('กรุณากรอกรหัสผ่าน');
            setLoading(false);
            return;
        }

        if (!email || !password && email.length <= 0 && password.length <= 0) {
            setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', {
                email,
                password,
            });

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            setSuccessMessage('เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...');
            setTimeout(() => {
                window.location.href = '/';;
            }, 1000);
        } catch (error) {
            let resp = error.response;
            
            if (resp.status == 400) return setErrorMessage('กรุณายืนยันตัวตนผ่าน Turnstile CAPTCHA');
            if (resp.status == 401) return setErrorMessage('รหัสผ่านหรืออีเมล์ไม่ถูกต้อง');
            if (resp.status == 403) return setErrorMessage('คุณยังไม่ได่ยืนยันอีเมล์');
            if (resp.status == 404) return setErrorMessage('เราไม่พบบัญชี้นี้ในระบบ');
            if (resp.status == 429) return setErrorMessage('ระบบล็อกเป็นเวลา 15 นาที');
            
            setErrorMessage('เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center my-10">
            <Card bordered={true} className="w-full max-w-lg">
                <Space direction="vertical" size="large" className="w-full">
                    <div className="text-center mb-6">
                        <Title level={2} className="m-0">เข้าสู่ระบบ</Title>
                        <Typography.Text type="secondary">
                            กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
                        </Typography.Text>
                    </div>

                    {errorMessage && (
                        <Alert
                            message="เกิดข้อผิดพลาด"
                            description={errorMessage}
                            type="error"
                            showIcon
                        />
                    )}
                    
                    {successMessage && (
                        <Alert
                            message="สำเร็จ"
                            description={successMessage}
                            type="success"
                            showIcon
                        />
                    )}

                    <Input
                        placeholder="อีเมล"
                        prefix={<UserOutlined />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    
                    <Input.Password
                        placeholder="รหัสผ่าน"
                        prefix={<LockOutlined />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* <div className="flex justify-center items-center">
                        <div className="cf-turnstile" data-sitekey="0x4AAAAAAAyf14burWjbEQk6" />
                    </div> */}

                    <Button
                        color="default"
                        variant="solid"
                        block
                        onClick={loginUser}
                        loading={loading}
                        icon={loading ?? <LoadingOutlined />}
                    >
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </Button>
                    
                    <div className="text-end">
                        <Typography.Text type="secondary">System Version: 1.0.0</Typography.Text>
                    </div>
                </Space>
            </Card>
        </div>
    );
};