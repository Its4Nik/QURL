// Dashboard.js
import React from 'react';
import LinkUsagePieChart from './LinkUsagePieChart';
import InlineUsageChart from './InlineUsageChart';

const Dashboard = () => {
  return (
    <div>
      <h2>Link Usage Statistics</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: '0 0 48%', marginRight: '2%' }}>
          <h3>Usage Distribution</h3>
          <LinkUsagePieChart />
        </div>
        <div style={{ flex: '0 0 48%' }}>
          <h3>Usage Over Last 7 Days</h3>
          <InlineUsageChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
