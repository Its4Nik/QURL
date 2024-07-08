import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);

  useEffect(() => {
    fetchQRCodeList();
  }, []);

  const fetchQRCodeList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/stats`);
      setQrCodes(response.data);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await axios.delete(`${backendUrl}/s/delete/${slug}`);
      fetchQRCodeList(); // Refresh the QR code list after deletion
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  const handleEdit = async (slug, newUrl) => {
    try {
      await axios.put(`${backendUrl}/s/edit/${slug}`, { originalUrl: newUrl });
      fetchQRCodeList(); // Refresh the QR code list after editing
    } catch (error) {
      console.error('Error editing QR code:', error);
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
            <th>Actions</th> {/* New column for actions */}
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
                <button onClick={() => handleDelete(qrCode.slug)}>Delete</button>
                <button onClick={() => {
                  const newUrl = prompt('Enter the new URL:');
                  if (newUrl) {
                    handleEdit(qrCode.slug, newUrl);
                  }
                }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
