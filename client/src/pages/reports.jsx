import { useEffect, useState } from 'react';
import { Table, Typography, Row, Col, Card, Empty, message } from 'antd';
import api from '../lib/api';

const { Title } = Typography;

export default function Report() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Global fetch function for report data
    const fetchReportData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/report');
            setReportData(response.data.result.reportData);
        } catch (error) {
            console.error('Error fetching report data:', error);
            message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'ชื่อนักศึกษา',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'หัวข้อการรายงาน',
            dataIndex: 'reportTopic',
            key: 'reportTopic',
        },
        {
            title: 'คะแนนที่โดนหัก',
            dataIndex: 'deductedScore',
            key: 'deductedScore',
            render: (text) => <span className="text-red-600">- {text}</span>,
        },
        {
            title: 'คะแนนที่เหลืออยู่',
            dataIndex: 'finalScore',
            key: 'finalScore',
        },
        {
            title: 'ข้อมูลผู้กระทำการ',
            key: 'logDetails',
            render: (_, record) => (
                record.logDetails ? (
                    <div>
                        <p><strong>ผู้ใช้:</strong> {record.logDetails.username}</p>
                        <p><strong>อีเมล:</strong> {record.logDetails.email}</p>
                    </div>
                ) : (
                    <span>ไม่มีข้อมูล</span>
                )
            ),
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>รายงานผลการดำเนินงาน</Title>

            <Row gutter={16}>
                <Col xs={24} md={24}>
                    <Card title="ข้อมูลคะแนนผู้ใช้" size="small">
                        {reportData.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={reportData}
                                pagination={{ pageSize: 10 }}
                                loading={loading}
                            />
                        ) : (
                            <Empty description="ไม่มีข้อมูลคะแนน" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
