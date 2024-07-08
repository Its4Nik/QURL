// InlineUsageChart.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const InlineUsageChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${backendUrl}/usageOverLast7Days`)
      .then(response => {
        // Assuming response.data is an array of objects with 'day' and 'views' fields
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching usage over last 7 days:', error);
      });
  }, []);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="views" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default InlineUsageChart;
