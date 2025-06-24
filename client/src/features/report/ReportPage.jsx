import React, { useMemo, useState } from 'react';
import { Table, Typography, Card, Tag, Input, Row, Col, DatePicker } from 'antd';
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { getReports } from './reportApi';
import useDebounce from '../../hooks/useDebounce';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const columns = [
    {
        title: 'วันที่',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text) => new Date(text).toLocaleDateString('th-TH'),
    },
    {
        title: 'SID',
        dataIndex: ['student', 'sid'],
        key: 'sid',
    },
    {
        title: 'ชื่อนักศึกษา',
        dataIndex: ['student', 'firstName'],
        key: 'studentName',
        render: (_, record) => record.student ? `${record.student.prefix} ${record.student.firstName} ${record.student.lastName}` : 'N/A'
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
        render: (text) => <Tag color="red">- {text}</Tag>,
    },
    {
        title: 'คะแนนที่เหลือ',
        dataIndex: 'finalScore',
        key: 'finalScore',
        render: (text) => <Tag color={text > 50 ? 'green' : 'orange'}>{text}</Tag>,
    },
    {
        title: 'ผู้รายงาน',
        dataIndex: ['log', 'username'],
        key: 'reporter',
        render: (username) => username || 'N/A'
    }
];

const ReportPage = () => {
    const { user } = useAuth();
    const { data: reports = [], loading, error } = useFetch(getReports); 
    
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const debouncedSearchText = useDebounce(searchText, 300);

    const filteredReports = useMemo(() => {
        let filtered = Array.isArray(reports) ? reports : [];

        if (debouncedSearchText) {
            const lowercasedText = debouncedSearchText.toLowerCase();
            filtered = filtered.filter(item =>
                (item.student?.sid?.toString().toLowerCase().includes(lowercasedText)) ||
                (item.student?.firstName?.toLowerCase().includes(lowercasedText)) ||
                (item.student?.lastName?.toLowerCase().includes(lowercasedText)) ||
                (item.reportTopic?.toLowerCase().includes(lowercasedText))
            );
        }

        if (dateRange) {
            const [startDate, endDate] = dateRange;
            if (startDate && endDate) {
                filtered = filtered.filter(item => {
                    const itemDate = new Date(item.createdAt);
                    return !isNaN(itemDate.getTime()) && itemDate >= startDate.startOf('day') && itemDate <= endDate.endOf('day');
                });
            }
        }

        return filtered;
    }, [reports, debouncedSearchText, dateRange]);

    if (error) {
        return <Card><p>Error loading reports: {error.message}</p></Card>;
    }

    return (
        <>
            <Title level={2}>All Reports</Title>
            <Card>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} md={12}>
                        <Search
                            placeholder="Search by SID, Name, or Topic..."
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={12}>
                         <RangePicker 
                            style={{ width: '100%' }}
                            onChange={(dates) => setDateRange(dates)}
                         />
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={filteredReports}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                />
            </Card>
       </>
     );
}

export default ReportPage;
  