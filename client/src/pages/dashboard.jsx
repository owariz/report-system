import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState({
      averageScore: 0,
      maxScore: 0,
      newStudentsCount: 0,
      totalStudentsCount: 0,
  });

  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await fetch('http://localhost:4000/api/admin/dashboard');
              const result = await response.json();
              if (!result.isError) {
                  setData(result.result);
              } else {
                  console.error(result.message);
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

        {/* <Row gutter={16} className="mt-4">
            <Col xs={24} sm={24}>
                <Card title="กราฟคะแนนพฤติกรรม" size="small" bordered className="shadow-sm">
                    <Line data={data} options={options} />
                </Card>
            </Col>
        </Row> */}
    </>
  );
}