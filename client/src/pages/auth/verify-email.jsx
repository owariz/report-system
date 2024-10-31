import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message as antdMessage, Spin, Typography } from 'antd';

import api from '../../lib/api';

const { Text } = Typography;

export default function VerifyEmail() {
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const navigate = useNavigate();

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get('token');

    const verifyEmail = async () => {
        if (!token) {
            antdMessage.error('จำเป็นต้องมีโทเค็นการยืนยัน');
            setIsLoading(false);
            navigate('/');
            return;
        }

        try {
            const response = await api.get(`/auth/verifyemail?token=${token}`);
            if (response.status === 200) {
                antdMessage.success('ยืนยันอีเมลสำเร็จแล้ว!');
                setIsLoading(false);

                const countdownInterval = setInterval(() => {
                    setCountdown(prevCountdown => {
                        if (prevCountdown <= 1) {
                            clearInterval(countdownInterval);
                            navigate('/auth/login');
                        }
                        return prevCountdown - 1;
                    });
                }, 1000);
            } else {
                antdMessage.error(response.data.message || 'การยืนยันล้มเหลว กรุณาลองใหม่อีกครั้ง');
                setIsLoading(false);
                navigate('/');
            }
        } catch (error) {
            console.error('Error:', error);
            antdMessage.error('เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง');
            setIsLoading(false);
            navigate('/');
        }
    };

    useEffect(() => {
        verifyEmail();
    }, []);

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