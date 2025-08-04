// src/socketHandlers/index.js
const messageHandler = require('./messageHandler');
const { auth, db } = require('../config/firebaseAdmin');

module.exports = (io) => {
  io.use(async (socket, next) => {
    console.log(`Backend Socket Auth: Incoming connection attempt from client ID: ${socket.id}`);
    const token = socket.handshake.auth.token;

    if (!token) {
      console.error(`Backend Socket Auth: No token provided for socket ${socket.id}. Rejecting connection.`);
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      socket.user = decodedToken; // Attach decoded user info to socket

      // Fetch user role from Firestore and attach to socket
      const userDoc = await db.collection('users').doc(socket.user.uid).get();
      if (userDoc.exists) {
        socket.user.role = userDoc.data().role;
      } else {
        // This case should ideally not happen if user is authenticated via Firebase Auth
        // but no profile in Firestore. Default to 'user'.
        console.warn(`Backend Socket Auth: User profile not found for UID ${socket.user.uid}. Defaulting role to 'user'.`);
        socket.user.role = 'user';
      }
      console.log(`Backend Socket Auth: User ${socket.user.uid} (${socket.user.role}) authenticated successfully for socket ${socket.id}.`);
      next(); // Proceed with connection
    } catch (error) {
      console.error(`Backend Socket Auth: Authentication failed for socket ${socket.id}. Token error:`, error.message);
      // Specific Firebase Auth error codes can be handled here if needed
      if (error.code === 'auth/id-token-expired') {
        return next(new Error('Authentication error: Token expired. Please re-authenticate.'));
      } else if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
        return next(new Error('Authentication error: Invalid token.'));
      }
      return next(new Error('Authentication error: Could not verify token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Backend Socket: User ${socket.user.uid} (${socket.user.role}) connected to Socket.IO with ID ${socket.id}.`);
    // Join a room based on user ID for direct messaging
    socket.join(socket.user.uid);
    console.log(`Backend Socket: User ${socket.user.uid} joined room ${socket.user.uid}.`);

    // Register specific handlers
    messageHandler(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Backend Socket: User ${socket.user?.uid || 'unknown'} (Socket ID: ${socket.id}) disconnected: ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`Backend Socket: Error on socket ${socket.id} for ${socket.user?.uid || 'unknown user'}:`, err.message);
    });
  });
};