import React, { useState, useEffect, useRef } from 'react';

const RealTimeTraffic = () => {
  const [trafficData, setTrafficData] = useState([]);
  const wsRef = useRef(null);

  // Function to generate sample data
  const generateSampleData = () => {
    const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'];
    const newData = {
      time: new Date().toISOString().split('T')[1].split('.')[0],
      source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      destination: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      protocol: protocols[Math.floor(Math.random() * protocols.length)]
    };
    return newData;
  };

  useEffect(() => {
    // Attempt to establish WebSocket connection
    wsRef.current = new WebSocket('ws://localhost:5000');

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    wsRef.current.onmessage = (event) => {
      // Parse incoming tshark data
      const newData = event.data.trim().split('\t');
      if (newData.length === 4) {
        setTrafficData((prevData) => [...prevData, {
          time: newData[0],
          source: newData[1],
          destination: newData[2],
          protocol: newData[3]
        }].slice(-10)); // Keep only the last 10 entries
      }
    };

    wsRef.current.onerror = (error) => {
      console.log('WebSocket error:', error);
      console.log('Using sample data instead');
      // Start generating sample data if WebSocket connection fails
      const interval = setInterval(() => {
        setTrafficData((prevData) => [...prevData, generateSampleData()].slice(-10));
      }, 2000); // Generate new data every 2 seconds

      return () => clearInterval(interval);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Real-time Network Traffic</h2>
      <p style={styles.subtitle}>{wsRef.current && wsRef.current.readyState === WebSocket.OPEN ? 'Live Data' : 'Sample Data'}</p>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Source IP</th>
            <th style={styles.th}>Destination IP</th>
            <th style={styles.th}>Protocol</th>
          </tr>
        </thead>
        <tbody>
          {trafficData.map((data, index) => (
            <tr key={index}>
              <td style={styles.td}>{data.time}</td>
              <td style={styles.td}>{data.source}</td>
              <td style={styles.td}>{data.destination}</td>
              <td style={styles.td}>{data.protocol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    maxWidth: '800px',
    margin: '20px auto',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
  },
};

export default RealTimeTraffic;