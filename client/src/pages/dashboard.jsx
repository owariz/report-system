import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography } from 'antd';
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
import api from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState({
      averageScore: 0,
      maxScore: 0,
      newStudentsCount: 0,
      totalStudentsCount: 0,
      scoreDistribution: [],
      studentsWithMostDeductedPoints: [],
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Average Score',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Max Score',
        data: [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  });

  const [scoreDistributionData, setScoreDistributionData] = useState({
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        label: 'Score Distribution',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        if (!response.data.isError) {
          setData(response.data.result);

          // Assuming the response contains historical data for the chart
          const labels = response.data.result.dates; // Array of dates
          const averageScores = response.data.result.averageScores; // Array of average scores
          const maxScores = response.data.result.maxScores; // Array of max scores

          setChartData({
            labels,
            datasets: [
              {
                label: 'Average Score',
                data: averageScores,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
              },
              {
                label: 'Max Score',
                data: maxScores,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
              },
            ],
          });

          // Assuming the response contains score distribution data
          const scoreDistribution = response.data.result.scoreDistribution; // Array of score distribution counts
          setScoreDistributionData(prevData => ({
            ...prevData,
            datasets: [
              {
                ...prevData.datasets[0],
                data: scoreDistribution,
              },
            ],
          }));
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
        <Typography.Title level={2}>Dashboard คะแนนพฤติกรรม</Typography.Title>

        <Row gutter={16}>
            <Col xs={12} sm={12} md={6} className="mb-2">
                <Card title="คะแนนเฉลี่ย" size="small" bordered className="shadow-sm">
                    <Typography.Paragraph style={{ margin: 0 }}>{data.averageScore} คะแนน</Typography.Paragraph>
                </Card>
            </Col>
            <Col xs={12} sm={12} md={6} className="mb-2">
                <Card title="คะแนนสูงสุด" size="small" bordered className="shadow-sm">
                    <Typography.Paragraph style={{ margin: 0 }}>{data.maxScore} คะแนน</Typography.Paragraph>
                </Card>
            </Col>
            <Col xs={12} sm={12} md={6} className="mb-2">
                <Card title="นักศึกษาใหม่" size="small" bordered className="shadow-sm">
                    <Typography.Paragraph style={{ margin: 0 }}>{data.newStudentsCount} คน</Typography.Paragraph>
                </Card>
            </Col>
            <Col xs={12} sm={12} md={6} className="mb-2">
                <Card title="นักศึกษาทั้งหมด" size="small" bordered className="shadow-sm">
                    <Typography.Paragraph style={{ margin: 0 }}>{data.totalStudentsCount} คน</Typography.Paragraph>
                </Card>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col xs={24} sm={24} md={24} className="mb-2">
                <Card title="คะแนนพฤติกรรม (กราฟ)" size="small" bordered className="shadow-sm">
                    <Line data={chartData} />
                </Card>
            </Col>
        </Row>

        <Row gutter={16}>
            <Col xs={24} sm={24} md={12} className="mb-2">
                <Card title="การกระจายคะแนน" size="small" bordered className="shadow-sm">
                    <Bar data={scoreDistributionData} />
                </Card>
            </Col>
            <Col xs={24} sm={24} md={12} className="mb-2">
                <Card title="นักศึกษาที่โดนหักคะแนนเยอะที่สุด" size="small" bordered className="shadow-sm">
                    <ul>
                        {data.studentsWithMostDeductedPoints.map((student, index) => (
                            <li key={index}>รหัสนักศึกษา: {student.sid} | {student.name}: {student.deductedPoints} คะแนน</li>
                        ))}
                    </ul>
                </Card>
            </Col>
        </Row>
    </>
  );
}