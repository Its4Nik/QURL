import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);

  useEffect(() => {
    axios.get(`${backendUrl}/stats`)
      .then(response => {
        setQrCodes(response.data);
      })
      .catch(error => {
        console.error('Error fetching QR codes:', error);
      });
  }, []);

  const handleDelete = async (slug) => {
    try {
      await axios.delete(`${backendUrl}/delete/${slug}`);
      setQrCodes(qrCodes.filter(qrCode => qrCode.slug !== slug));
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  return (
    <div>
      <h1>QR Code Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Original URL</th>
            <th>QR Code</th>
            <th>Views</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
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
              <td>
                <button onClick={() => window.location.href = `${backendUrl}/s/${qrCode.slug}`} target="_blank">Visit Link</button>
                <button onClick={() => handleDelete(qrCode.slug)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
