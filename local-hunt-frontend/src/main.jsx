// // src/main.jsx
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'mapbox-gl/dist/mapbox-gl.css';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   // <React.StrictMode> {/* Temporarily disabled for Socket.IO debugging */}
//     <App />
//   // </React.StrictMode>,
// );

// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext'; // <--- ADD THIS IMPORT

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> // Keep StrictMode commented out for now
  <AuthProvider>
    <ToastProvider> {/* <--- WRAP WITH ToastProvider */}
      <App />
    </ToastProvider> {/* <--- CLOSE ToastProvider */}
  </AuthProvider> // <--- NO COMMA HERE
  // </React.StrictMode>,
);