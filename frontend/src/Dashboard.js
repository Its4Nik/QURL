import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    axios.get(`${backendUrl}/stats`)
      .then(response => {
        setQrCodes(response.data);
        generateChartData(response.data);
      })
      .catch(error => {
        console.error('Error fetching QR codes:', error);
      });
  }, []);

  const generateChartData = (qrCodes) => {
    const labels = qrCodes.map(qrCode => qrCode.slug);
    const viewsData = qrCodes.map(qrCode => qrCode.views);

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Views',
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(75,192,192,0.4)',
          hoverBorderColor: 'rgba(75,192,192,1)',
          data: viewsData
        }
      ]
    });
  };

  return (
    <div>
      <h1>QR Code Dashboard</h1>
      
      {/* Views Chart */}
      {qrCodes.length > 0 && (
        <div>
          <h2>Views per QR Code</h2>
          <Bar
            data={chartData}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: false,
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            }}
          />
        </div>
      )}

      {/* QR Codes Table */}
      <table>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Original URL</th>
            <th>QR Code</th>
            <th>Views</th>
            <th>Created At</th>
            <th>Updated At</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
