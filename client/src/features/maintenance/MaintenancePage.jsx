import React from 'react';
import { Result, Card } from 'antd';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MaintenancePage = () => {
  const { settings, loadingSettings } = useAuth();

  if (loadingSettings) return null;
  if (!settings?.maintenanceMode) return <Navigate to="/" replace />;

  return (
    <div className="p-5">
      <Card>
        <Result
          status="500"
          title="System Maintenance"
          subTitle={settings.maintenanceMessage || "Sorry, we're performing maintenance right now. We'll be back online shortly!"}
        />
      </Card>
    </div>
  );
};

export default MaintenancePage; 