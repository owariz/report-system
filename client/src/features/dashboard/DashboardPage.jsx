import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, Skeleton, Result, Table } from 'antd';
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import api from "../../lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

// ตั้งค่า Chart Options กลาง
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

// สีสำหรับ Pie Chart
const PIE_CHART_COLORS = [
  '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
];

export default function DashboardPage() {
  const [reportData, setReportData] = useState({ summary: null, trend: [], recent: [] });
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [reportRes, userStatsRes] = await Promise.allSettled([
          Promise.all([
            api.get('/student/reports/summary'),
            api.get('/student/reports/trend'),
            api.get('/student/reports/recent?limit=10'),
          ]),
          api.get('/admin/dashboard'),
        ]);
        
        if (reportRes.status === 'fulfilled') {
          const [summaryRes, trendRes, recentRes] = reportRes.value;
          setReportData({
            summary: summaryRes.result,
            trend: trendRes.result,
            recent: recentRes.result,
          });
        }

        if (userStatsRes.status === 'fulfilled') {
          setUserStats(userStatsRes.value);
        }

        const aError = [reportRes, userStatsRes].find(res => res.status === 'rejected');
        if (aError) {
            setError(aError.reason.message || 'Failed to fetch some dashboard data.');
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const { summary, trend, recent } = reportData;

  const trendChartData = {
    labels: trend.map(item => item.month),
    datasets: [
      {
        label: 'จำนวนรายงาน',
        data: trend.map(item => item.count),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const today = now.toISOString().slice(0, 10);
  const reportsThisMonth = trend.find(item => item.month === thisMonth)?.count || 0;
  const reportsToday = recent.filter(r => {
    if (!r.createdAt) return false;
    let dateStr = '';
    if (typeof r.createdAt === 'string') {
      dateStr = r.createdAt;
    } else if (typeof r.createdAt === 'number') {
      dateStr = new Date(r.createdAt).toISOString();
    } else if (r.createdAt instanceof Date) {
      dateStr = r.createdAt.toISOString();
    } else {
      dateStr = String(r.createdAt);
    }
    return dateStr.slice(0, 10) === today;
  }).length;

  const topicCount = recent.reduce((acc, r) => {
    const topic = r.reportTopic || 'N/A';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = {
    labels: Object.keys(topicCount),
    datasets: [
      {
        data: Object.values(topicCount),
        backgroundColor: PIE_CHART_COLORS,
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const scoreDistributionData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        label: 'Score Distribution',
        data: userStats?.scoreDistribution || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const columns = [
    { title: 'วันที่', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleDateString('th-TH') },
    { title: 'SID', dataIndex: ['student', 'sid'], key: 'sid' },
    { title: 'ชื่อนักศึกษา', dataIndex: ['student', 'firstName'], key: 'studentName', render: (_, r) => r.student ? `${r.student.prefix} ${r.student.firstName} ${r.student.lastName}` : 'N/A' },
    { title: 'หัวข้อการรายงาน', dataIndex: 'reportTopic', key: 'reportTopic', render: (text) => text || 'N/A' },
    { title: 'คะแนนที่โดนหัก', dataIndex: 'deductedScore', key: 'deductedScore', render: (text) => <span style={{ color: 'red' }}>- {text}</span> },
    { title: 'คะแนนที่เหลือ', dataIndex: 'finalScore', key: 'finalScore', render: (text) => <span style={{ color: text > 50 ? 'green' : 'orange' }}>{text}</span> },
  ];

  if (loading) {
    return <Skeleton active paragraph={{ rows: 15 }} />;
  }

  if (error) {
    return <Result status="error" title="Failed to Load Data" subTitle={error} />;
  }

  return (
    <>
      <Typography.Title level={2} style={{ marginBottom: '24px' }}>
        Dashboard Overview
      </Typography.Title>

      {/* --- Report Stats --- */}
      <Typography.Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
        ภาพรวมรายงาน
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic title="รายงานทั้งหมด" value={summary?.totalReports || 0} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }}/>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic title="รายงานเดือนนี้" value={reportsThisMonth} prefix={<BarChartOutlined />} valueStyle={{ color: '#1890ff' }}/>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic title="รายงานวันนี้" value={reportsToday} prefix={<PieChartOutlined />} valueStyle={{ color: '#1890ff' }}/>
          </Card>
        </Col>
      </Row>

      {/* --- User & Score Stats --- */}
      <Typography.Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>
        ภาพรวมผู้ใช้และคะแนน
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic title="ผู้ใช้ทั้งหมด" value={userStats?.totalUsersCount || 0} prefix={<UsergroupAddOutlined />} valueStyle={{ color: '#3f8600' }}/>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic title="ผู้ใช้ใหม่ (7 วัน)" value={userStats?.newUsersCount || 0} prefix={<UserOutlined />} valueStyle={{ color: '#3f8600' }}/>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic title="คะแนนเฉลี่ย" value={userStats?.averageScore || 0} precision={2} prefix={<ArrowUpOutlined />} suffix="pts" valueStyle={{ color: '#faad14' }}/>
          </Card>
        </Col>
      </Row>

      {/* --- Charts Row 1 --- */}
      <Row gutter={[16, 16]} style={{ marginTop: '32px' }}>
        <Col xs={24} lg={12}>
          <Card title="แนวโน้มจำนวนรายงาน (12 เดือนล่าสุด)" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <div style={{ height: '300px' }}>
              <Line data={trendChartData} options={chartOptions} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="การกระจายของคะแนน" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <div style={{ height: '300px' }}>
              <Bar data={scoreDistributionData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* --- Charts Row 2 --- */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
      <Col xs={24} lg={12}>
          <Card title="สัดส่วนประเภทของรายงาน (10 รายการล่าสุด)" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <div style={{ height: '300px' }}>
              <Pie data={pieData} options={chartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top 5 ผู้ใช้ที่โดนหักคะแนนเยอะสุด" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <ul style={{ paddingLeft: '20px', height: '300px', overflowY: 'auto' }}>
              {(userStats?.usersWithMostDeductedPoints || []).map((user, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <Typography.Text>{user.name || 'N/A'} (SID: {user.sid || 'N/A'}): </Typography.Text>
                  <Typography.Text strong style={{ color: '#cf1322' }}>{user.deductedPoints || 0} points</Typography.Text>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>

      {/* --- Recent Reports Table --- */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24}>
          <Card title="รายงานล่าสุด (10 รายการ)" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Table
              columns={columns}
              dataSource={recent}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}