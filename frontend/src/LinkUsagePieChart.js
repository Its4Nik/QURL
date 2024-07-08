// LinkUsagePieChart.js
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const LinkUsagePieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${backendUrl}/stats`)
      .then(response => {
        // Assuming response.data is an array of objects with 'name' and 'value' fields
        setData(response.data.map(item => ({ name: item.slug, value: item.views })));
      })
      .catch(error => {
        console.error('Error fetching link usage data:', error);
      });
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          dataKey="value"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default LinkUsagePieChart;
