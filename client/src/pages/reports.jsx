import { useEffect, useState } from 'react';
import { Table, Typography, Row, Col, Card, Button, Modal, Empty } from 'antd';
import api from '../lib/api';

const { Title } = Typography;

export default function Report() {
    const [reportData, setReportData] = useState([]);
    const [usageData, setUsageData] = useState({ labels: [], datasets: [] });
    const [selectedReportDetail, setSelectedReportDetail] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const response = await api.get('/admin/report');
                setReportData(response.data.result.reportData);
                setUsageData(response.data.result.usageData);
            } catch (error) {
                console.error('Error fetching report data:', error);
            }
        };

        fetchReportData();
    }, []);

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'ชื่อผู้ใช้',
            dataIndex: 'username',
            key: 'username',
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
            title: 'รายละเอียดการรายงาน',
            dataIndex: 'reportDetail',
            key: 'reportDetail',
            render: (_, record) => (
                <Button color="default" variant="dashed" onClick={() => showDetail(record)}>
                    ดูรายละเอียด
                </Button>
            ),
        },
    ];

    const showDetail = (record) => {
        setSelectedReportDetail(record);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedReportDetail(null);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>รายงานผลการดำเนินงาน</Title>

            <Row gutter={16}>
                {/* <Col xs={24} md={24}>
                    <Card title="กราฟการใช้งาน" size="small">
                        <Line data={usageData} />
                    </Card>
                </Col> */}

                <Col xs={24} md={24}>
                    <Card title="ข้อมูลคะแนนผู้ใช้" size="small">
                        {reportData.length > 0 ? (
                            <Table columns={columns} dataSource={reportData} pagination={{ pageSize: 10 }} />
                        ) : (
                            <Empty description="ไม่มีข้อมูลคะแนน" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal
                title="รายละเอียดการรายงาน"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
            >
                {selectedReportDetail && (
                    <div>
                        <p><strong>ชื่อผู้ใช้:</strong> {selectedReportDetail.username}</p>
                        <p><strong>วันที่:</strong> {selectedReportDetail.date}</p>
                        <p><strong>คะแนน:</strong> {selectedReportDetail.score}</p>
                        <p><strong>คะแนนที่โดนหัก:</strong> {selectedReportDetail.deductedScore}</p>
                        <p><strong>คะแนนที่เหลืออยู่:</strong> {selectedReportDetail.finalScore}</p>
                        <p><strong>รายละเอียดการรายงาน:</strong> {selectedReportDetail.reportDetail}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
}