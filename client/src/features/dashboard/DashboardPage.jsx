import { useEffect, useState } from 'react';
import { Typography, Statistic, Skeleton, Result, Table } from 'antd';
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
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
import Card from '../../components/common/Card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ChartTitle, Tooltip, Legend, ArcElement);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const PIE_CHART_COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];

const StatCard = ({ title, value, prefix, color }) => (
  <Card>
    <Statistic title={title} value={value} prefix={prefix} valueStyle={{ color }} />
  </Card>
);

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
    { title: 'คะแนนที่โดนหัก', dataIndex: 'deductedScore', key: 'deductedScore', render: (text) => <span className="text-red-600">- {text}</span> },
    { title: 'คะแนนที่เหลือ', dataIndex: 'finalScore', key: 'finalScore', render: (text) => <span className={text > 50 ? 'text-green-600' : 'text-orange-500'}>{text}</span> },
  ];

  if (loading) {
    return <Skeleton active paragraph={{ rows: 15 }} />;
  }

  if (error) {
    return <Result status="error" title="Failed to Load Data" subTitle={error} />;
  }

  return (
    <div className="space-y-6">
      <Typography.Title level={2}>
        Dashboard Overview
      </Typography.Title>
      
      {/* --- Main Stats --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="รายงานทั้งหมด" value={summary?.totalReports || 0} prefix={<FileTextOutlined />} color="#1677ff" />
        <StatCard title="รายงานเดือนนี้" value={reportsThisMonth} prefix={<BarChartOutlined />} color="#1677ff" />
        <StatCard title="รายงานวันนี้" value={reportsToday} prefix={<PieChartOutlined />} color="#1677ff" />
        <StatCard title="ผู้ใช้ทั้งหมด" value={userStats?.totalUsersCount || 0} prefix={<UsergroupAddOutlined />} color="#3f8600" />
        <StatCard title="ผู้ใช้ใหม่ (7 วัน)" value={userStats?.newUsersCount || 0} prefix={<UserOutlined />} color="#3f8600" />
        <StatCard title="คะแนนเฉลี่ย" value={userStats?.averageScore || 0} precision={2} prefix={<ArrowUpOutlined />} suffix="pts" color="#faad14" />
      </div>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="แนวโน้มจำนวนรายงาน (12 เดือนล่าสุด)">
          <div className="h-72">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </Card>
        <Card title="การกระจายของคะแนน">
          <div className="h-72">
            <Bar data={scoreDistributionData} options={chartOptions} />
          </div>
        </Card>
        <Card title="สัดส่วนประเภทของรายงาน (10 รายการล่าสุด)">
          <div className="h-72">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </Card>
        <Card title="Top 5 ผู้ใช้ที่โดนหักคะแนนเยอะสุด">
          <ul className="h-72 overflow-y-auto space-y-2">
            {(userStats?.usersWithMostDeductedPoints || []).map((user, index) => (
              <li key={index}>
                <Typography.Text>{user.name || 'N/A'} (SID: {user.sid || 'N/A'}): </Typography.Text>
                <Typography.Text strong className="text-red-700">{user.deductedPoints || 0} points</Typography.Text>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* --- Recent Reports Table --- */}
      <Card title="รายงานล่าสุด (10 รายการ)">
        <Table
          columns={columns}
          dataSource={recent}
          pagination={false}
          rowKey="id"
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}