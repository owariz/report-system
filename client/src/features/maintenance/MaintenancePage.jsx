import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const MaintenancePage = () => (
  <Result
    status="503"
    title="System Maintenance"
    subTitle="Sorry, we're performing maintenance right now. We'll be back online shortly!"
    extra={
      <Button type="primary">
        <Link to="/">Go Home</Link>
      </Button>
    }
  />
);

export default MaintenancePage; 