// Dashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);
  const [overallUsage, setOverallUsage] = useState([]);
  
  useEffect(() => {
    // Fetch QR codes with stats
    axios.get(`${backendUrl}/stats`)
      .then(response => {
        setQrCodes(response.data);
      })
      .catch(error => {
        console.error('Error fetching QR codes:', error);
      });

    // Fetch overall usage over last 7 days
    axios.get(`${backendUrl}/usageOverLast7Days`)
      .then(response => {
        setOverallUsage(response.data);
      })
      .catch(error => {
        console.error('Error fetching overall usage:', error);
      });
  }, []);

  return (
    <div>
      <h1>QR Code Dashboard</h1>

      {/* Overall Usage Graph */}
      <h2>Overall Usage Over Last 7 Days</h2>
      <Bar
        data={{
          labels: overallUsage.map(entry => entry._id),
          datasets: [
            {
              label: 'Views',
              data: overallUsage.map(entry => entry.views),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        }}
        options={{
          scales: {
            x: { stacked: true },
            y: { stacked: true },
          },
        }}
      />

      {/* QR Code Entries */}
      <h2>QR Code Entries</h2>
      <table>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Original URL</th>
            <th>QR Code</th>
            <th>Views</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Views (Last 7 Days)</th>
          </tr>
        </thead>
        <tbody>
          {qrCodes.map((qrCode, index) => (
            <tr key={index}>
              <td>{qrCode.slug}</td>
              <td>{qrCode.originalUrl}</td>
              <td><img src={qrCode.qrCode} alt="QR Code" style={{ width: '50px' }} /></td>
              <td>{qrCode.views}</td>
              <td>{new Date(qrCode.createdAt).toLocaleString()}</td>
              <td>{new Date(qrCode.updatedAt).toLocaleString()}</td>
              <td>{qrCode.weekViews}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
