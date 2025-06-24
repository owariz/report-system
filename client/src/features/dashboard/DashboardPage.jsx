import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, Skeleton, Result } from 'antd';
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import {
  UserOutlined,
  ArrowUpOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import api from "../../lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/admin/dashboard');
        setData(response);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scoreDistributionData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        label: 'Score Distribution',
        data: data?.scoreDistribution || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  if (error) {
    return <Result status="error" title="Failed to Load Data" subTitle={error} />;
  }

  if (!data) {
    return <Result status="info" title="No Data Available" subTitle="There is no data to display for the dashboard yet." />;
  }

  return (
    <>
      <Typography.Title level={2} style={{ marginBottom: '24px' }}>
        Dashboard
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Score"
              value={data?.averageScore || 0}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<BarChartOutlined />}
              suffix="pts"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Max Score"
              value={data?.maxScore || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowUpOutlined />}
              suffix="pts"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="New Users"
              value={data?.newUsersCount || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={data?.totalUsersCount || 0}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Score Distribution">
            <div style={{ height: '300px' }}>
              <Bar data={scoreDistributionData} options={chartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Top 5 Users with Most Deducted Points">
            <ul style={{ paddingLeft: '20px' }}>
              {(data?.usersWithMostDeductedPoints || []).map((user) => (
                <li key={user.sid}>
                  <Typography.Text>
                    {user.name || 'N/A'}:{' '}
                  </Typography.Text>
                  <Typography.Text strong>{user.deductedPoints || 0} points</Typography.Text>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </>
  );
}