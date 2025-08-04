// src/server.js
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Import and register socket handlers
// Use the explicit path to the index.js file
const registerSocketHandlers = require('./socketHandlers/index.js'); // <--- CHANGE THIS LINE
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
  console.log(`Socket.IO listening on port ${PORT}`);
});