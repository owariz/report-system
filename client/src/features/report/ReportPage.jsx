import React, { useMemo, useState } from 'react';
import { Table, Typography, Tag, Input, DatePicker, Button, Modal, Descriptions } from 'antd';
import useFetch from "../../hooks/useFetch";
import { getReports } from './reportApi';
import useDebounce from '../../hooks/useDebounce';
import Card from '../../components/common/Card';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const ReportPage = () => {
    const { data, loading, error } = useFetch(getReports); 
    const reports = data?.result || [];
    
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const debouncedSearchText = useDebounce(searchText, 300);
    const [selectedReport, setSelectedReport] = useState(null);

    const handleViewDetail = (report) => {
        setSelectedReport(report);
    };

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => {
                const d = new Date(text);
                return isNaN(d) ? '-' : d.toLocaleDateString('th-TH');
            },
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
            sorter: (a, b) => a.deductedScore - b.deductedScore,
        },
        {
            title: 'คะแนนที่เหลือ',
            dataIndex: 'finalScore',
            key: 'finalScore',
            render: (text) => <Tag color={text > 50 ? 'green' : 'orange'}>{text}</Tag>,
            sorter: (a, b) => a.finalScore - b.finalScore,
        },
        {
            title: 'รายละเอียด',
            key: 'action',
            render: (_, record) => (
                <Button type="default" onClick={() => handleViewDetail(record)}>
                    ดูรายละเอียด
                </Button>
            ),
        },
    ];

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
        <div className="space-y-6">
            <Title level={2}>All Reports</Title>
            <Card>
                <div className="flex flex-col gap-4 mb-4 md:flex-row">
                    <Search
                        placeholder="Search by SID, Name, or Topic..."
                        onChange={(e) => setSearchText(e.target.value)}
                        className="flex-grow"
                        allowClear
                    />
                     <RangePicker
                        className="flex-grow w-full md:w-auto"
                        onChange={(dates) => setDateRange(dates)}
                     />
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredReports}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 'max-content' }}
                />
            </Card>
            <Modal
                visible={!!selectedReport}
                title={<Title level={4}>รายละเอียดรายงาน</Title>}
                onCancel={() => setSelectedReport(null)}
                footer={null}
                destroyOnClose
            >
                {selectedReport && (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="วันที่">
                            {(() => { const d = new Date(selectedReport.createdAt); return isNaN(d) ? '-' : d.toLocaleDateString('th-TH'); })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="SID">
                            {selectedReport.student?.sid}
                        </Descriptions.Item>
                        <Descriptions.Item label="ชื่อ">
                            {selectedReport.student?.prefix} {selectedReport.student?.firstName} {selectedReport.student?.lastName}
                        </Descriptions.Item>
                        <Descriptions.Item label="หัวข้อ">
                            {selectedReport.reportTopic}
                        </Descriptions.Item>
                        <Descriptions.Item label="รายละเอียด">
                            {selectedReport.reportDetail || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="คะแนนที่โดนหัก">
                            <Tag color="red">- {selectedReport.deductedScore}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="คะแนนที่เหลือ">
                            <Tag color={selectedReport.finalScore > 50 ? 'green' : 'orange'}>
                                {selectedReport.finalScore}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="ผู้รายงาน">
                            {selectedReport.logs && selectedReport.logs[0] ? selectedReport.logs[0].username : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="วันที่บันทึก">
                            {selectedReport.logs && selectedReport.logs[0] ? (() => { const d = new Date(selectedReport.logs[0].timestamp); return isNaN(d) ? '-' : d.toLocaleString('th-TH'); })() : 'N/A'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
     );
}

export default ReportPage;
  