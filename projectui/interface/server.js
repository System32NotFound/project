const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const WebSocket = require('ws'); // Add this line to import WebSocket

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  console.log(filePath);

  // Start POX controller in the background
  const poxDir = '/home/vboxuser/Project/pox';
  const poxCommand = spawn('sudo', ['python3', 'pox.py', 'forwarding.l2_learning'], {
    cwd: poxDir,
    stdio: ['ignore', 'ignore', 'ignore'],
    detached: true
  });
  poxCommand.unref();

  // Respond to the client that POX has started
  res.status(200).json({ message: 'POX controller has started successfully' });

  // Clean up Mininet resources
  const cleanupCommand = spawn('sudo', ['mn', '-c']);
  cleanupCommand.on('close', (code) => {
    if (code !== 0) {
      console.error(`Error cleaning Mininet: sudo mn -c exited with error code ${code}`);
      return;
    }
    console.log('Mininet cleanup completed successfully');

    // Run the Mininet topology Python script
    const pythonCommand = spawn('sudo', ['python3', 'mn_topology.py', filePath], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    // Stream Python output to the client
    pythonCommand.stdout.pipe(res, { end: false });
    pythonCommand.stderr.pipe(res, { end: false });

    // Start tshark to capture network traffic
    const tsharkCommand = spawn('sudo', ['tshark', '-i', 'any', '-T', 'fields', '-e', 'frame.time', '-e', 'ip.src', '-e', 'ip.dst', '-e', 'ip.proto']);

    tsharkCommand.stdout.on('data', (data) => {
      // Broadcast tshark data to all connected WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data.toString());
        }
      });
    });

    pythonCommand.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with error code ${code}`);
      }
      // Cleanup the uploaded file after everything is done
      fs.unlinkSync(filePath);

      // Kill tshark process
      tsharkCommand.kill();
    });
  });
});

const server = app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

// Handling WebSocket connections
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});