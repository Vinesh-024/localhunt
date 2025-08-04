// src/services/socketService.js
import { io } from 'socket.io-client';
import { getCurrentIdToken } from './authApi';
import { auth } from '../firebase'; // Import Firebase auth client instance

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL.replace('/api', '');

let socket = null;
let tokenRefreshInterval = null; // To store the interval ID

// Function to refresh the auth token and update socket
const refreshAuthToken = async () => {
  try {
    const newToken = await getCurrentIdToken();
    if (newToken && socket && socket.connected) {
      // Update the auth payload for the socket
      socket.auth.token = newToken;
      // Reconnect the socket to apply the new auth token
      // This will trigger the backend's io.use middleware again
      socket.disconnect(); // Disconnect current socket
      socket.connect(); // Reconnect with new auth
      console.log('SocketService: Auth token refreshed and socket reconnected.');
    } else if (!newToken && socket && socket.connected) {
      console.warn('SocketService: No new token available, disconnecting socket.');
      socket.disconnect(); // If no token, disconnect
    }
  } catch (error) {
    console.error('SocketService: Error refreshing auth token:', error);
    if (socket) socket.disconnect(); // Disconnect on token refresh failure
  }
};


export const connectSocket = async () => {
  if (socket && socket.connected) {
    console.log('Socket already connected, returning existing instance.');
    return socket;
  }

  const token = await getCurrentIdToken();
  if (!token) {
    console.error('No auth token available for socket connection.');
    throw new Error('Authentication required for chat.');
  }

  if (socket && !socket.connected) {
    socket.disconnect();
    socket = null;
  }

  socket = io(BACKEND_URL, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
  });

  // Clear any existing refresh interval
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
  }

  // Set up token refresh interval (e.g., every 50 minutes, before 1-hour expiry)
  // Firebase ID tokens expire in 1 hour (3600 seconds). Set refresh slightly before.
  tokenRefreshInterval = setInterval(refreshAuthToken, 50 * 60 * 1000); // 50 minutes


  return new Promise((resolve, reject) => {
    const connectTimeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Socket connection timed out.'));
    }, 15000);

    socket.on('connect', () => {
      clearTimeout(connectTimeout);
      console.log('Socket.IO connected via promise resolve:', socket.id);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      clearTimeout(connectTimeout);
      console.error('Socket.IO connection error during promise:', err.message);
      reject(new Error(`Socket connection failed: ${err.message}`));
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      if (connectTimeout) {
        clearTimeout(connectTimeout);
        // If disconnected before connecting, reject the promise
        reject(new Error(`Socket disconnected before connection: ${reason}`));
      }
      // If disconnected after connecting, try to reconnect or handle gracefully
      // For now, the setInterval will handle re-auth, or component will reconnect
    });

    socket.on('messageError', (errorMessage) => {
      console.error('Socket Message Error from server:', errorMessage);
    });
  });
};

export const disconnectSocket = () => {
  if (tokenRefreshInterval) { // Clear interval on manual disconnect
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket.IO disconnected manually.');
  }
};

// Functions now accept 'socket' as the first argument
export const sendMessage = (receiverId, vendorId, text, socketInstance) => {
  if (socketInstance && socketInstance.connected) {
    console.log('socketService: Attempting to emit sendMessage event:', { receiverId, vendorId, text }); // <--- ADD THIS LOG
    socketInstance.emit('sendMessage', { receiverId, vendorId, text });
  } else {
    console.error('Socket not connected. Cannot send message.');
  }
};


export const getConversationHistory = (otherUserId, currentVendorId, socketInstance) => { // <--- ADD socketInstance
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('getConversationHistory', { otherUserId, currentVendorId });
  } else {
    console.error('Socket not connected. Cannot get conversation history.');
  }
};

export const getConversationsList = (socketInstance) => { // <--- ADD socketInstance
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit('getConversationsList');
  } else {
    console.error('Socket not connected. Cannot get conversations list.');
  }
};

// Removed: export const getSocket = () => socket; // No longer needed