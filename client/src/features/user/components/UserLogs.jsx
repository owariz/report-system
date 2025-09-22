import { useState, useEffect, useCallback } from "react";
import { message, Spin, Empty, Timeline, Button, Typography } from "antd";
import {
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { getUserLogs } from '../userApi';
import { formatDate } from "../../../utils/formatDate";
import Card from "../../../components/common/Card";

const { Paragraph, Text } = Typography;

// Icon and color mapping for log actions
const logStyle = {
  'User Login': { icon: <LoginOutlined />, color: 'green' },
  'User Logout': { icon: <LogoutOutlined />, color: 'gray' },
  'User Registration': { icon: <UserAddOutlined />, color: 'blue' },
  'User Update': { icon: <EditOutlined />, color: 'orange' },
  'User Deletion': { icon: <DeleteOutlined />, color: 'red' },
  default: { icon: <HistoryOutlined />, color: 'purple' }
};

const getLogStyle = (action) => {
  return logStyle[action] || logStyle.default;
};

const UserLogs = ({ userEmail }) => {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = useCallback(async (page) => {
    setLoadingLogs(true);
    try {
      const response = await getUserLogs(userEmail, { page, limit: 5 });
      if (response && response.result) {
        setLogs(prevLogs => page === 1 ? response.result.logs : [...prevLogs, ...response.result.logs]);
        setPagination(response.result.pagination);
      }
    } catch (error) {
      message.error("ไม่สามารถโหลดประวัติการใช้งานได้");
    } finally {
      setLoadingLogs(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchLogs(1); // Fetch initial logs
  }, [fetchLogs]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchLogs(nextPage);
  };

  if (logs.length === 0 && loadingLogs) {
    return <div className="flex justify-center my-5"><Spin /></div>;
  }

  if (logs.length === 0) {
    return <Empty description="ไม่มีประวัติการใช้งาน" />;
  }

  const timelineItems = logs.map((log) => {
    const { icon, color } = getLogStyle(log.action);
    return {
      key: log.id,
      dot: icon,
      color: color,
      children: (
        <>
          <Text strong>{log.action}</Text>
          <Paragraph className="my-1">{log.details}</Paragraph>
          <Text type="secondary" className="text-xs">
            {formatDate(log.timestamp)}
            {log.ipAddress && ` - IP: ${log.ipAddress}`}
          </Text>
        </>
      ),
    };
  });

  const loadMoreButton =
    pagination && pagination.page < pagination.totalPages ? (
      <div className="text-center mt-3">
        <Button onClick={handleLoadMore} loading={loadingLogs}>
          โหลดเพิ่มเติม
        </Button>
      </div>
    ) : null;

  return (
    <Card className="bg-gray-50 my-4">
      <Timeline items={timelineItems} />
      {loadMoreButton}
    </Card>
  );
};

UserLogs.propTypes = {
  userEmail: PropTypes.string.isRequired,
};

export default UserLogs;
