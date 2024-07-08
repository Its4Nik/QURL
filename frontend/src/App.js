import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const backendUrl = process.env.BACKEND_URL; // Access environment variable

function App() {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [qrCode, setQrCode] = useState(null);

  const generateQrCode = () => {
    axios.post(`${backendUrl}/generate`, { originalUrl: url, customSlug })
      .then(response => {
        setQrCode(response.data.qrCode);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div className="App">
      <h1>QURL - QR Code Generator</h1>
      <input 
        type="text" 
        placeholder="Enter URL" 
        value={url} 
        onChange={(e) => setUrl(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Custom Slug (optional)" 
        value={customSlug} 
        onChange={(e) => setCustomSlug(e.target.value)} 
      />
      <button onClick={generateQrCode}>Generate QR Code</button>
      {qrCode && <img src={qrCode} alt="QR Code" />}
    </div>
  );
}

export default App;
