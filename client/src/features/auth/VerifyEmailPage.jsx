import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message as antdMessage, Spin, Typography } from 'antd';
import { verifyUserEmail } from './authApi';

const { Text } = Typography;

export default function VerifyEmail() {
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get('token');

    const verify = useCallback(async () => {
        if (token) {
            try {
                const response = await verifyUserEmail(token);
                antdMessage.success(response.data.message);
                setTimeout(() => navigate('/login'), 2000);
            } catch (error) {
                console.error('Error:', error);
                antdMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง');
                setIsLoading(false);
                navigate('/');
            }
        } else {
            antdMessage.error('จำเป็นต้องมีโทเค็นการยืนยัน');
            setIsLoading(false);
            navigate('/');
        }
    }, [token, navigate]);

    useEffect(() => {
        verify();
    }, [verify]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            {isLoading ? (
                <Spin size="large" tip="กำลังโหลด..." />
            ) : countdown > 0 ? (
                <Text type="secondary">กำลังเปลี่ยนเส้นทางใน {countdown} วินาที</Text>
            ) : null}
        </div>
    );
}