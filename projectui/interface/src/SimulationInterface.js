import React, { useState } from 'react';
import RealTimeTraffic from './RealTimeTraffic';

const SimulationInterface = () => {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    setIsLoading(true);
    setOutput("");
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput(prev => prev + decoder.decode(value));
      }
    } catch (error) {
      console.error("Error:", error);
      setOutput("An error occurred during the simulation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Simulation Interface</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fileUpload}>
            <label htmlFor="file-upload" style={styles.fileLabel}>
              <span>Click to upload or drag and drop</span>
              <p style={styles.fileText}>Upload your simulation file</p>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
          </div>
          {file && (
            <div style={styles.alert}>
              <strong>File selected:</strong> {file.name}
            </div>
          )}
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Running Simulation...' : 'Start Simulation'}
          </button>
        </form>
        {output && (
          <div style={styles.outputContainer}>
            <pre style={styles.output}>{output}</pre>
          </div>
        )}
        <RealTimeTraffic />
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    width: '100%',
    maxWidth: '32rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  fileUpload: {
    border: '2px dashed #d1d5db',
    borderRadius: '0.5rem',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
  },
  fileLabel: {
    display: 'block',
    fontWeight: 'semibold',
  },
  fileText: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  fileInput: {
    display: 'none',
  },
  alert: {
    backgroundColor: '#e5e7eb',
    borderRadius: '0.25rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'semibold',
  },
  outputContainer: {
    marginTop: '1rem',
    backgroundColor: '#1f2937',
    borderRadius: '0.5rem',
    padding: '1rem',
    maxHeight: '15rem',
    overflow: 'auto',
  },
  output: {
    color: '#34d399',
    fontSize: '0.875rem',
    margin: 0,
  },
};

export default SimulationInterface;