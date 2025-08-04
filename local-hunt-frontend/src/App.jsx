// // src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import AuthPage from './pages/AuthPage';
// import Dashboard from './pages/Dashboard';
// import UserProfilePage from './pages/UserProfilePage';
// import VendorRegistrationPage from './pages/VendorRegistrationPage';
// import VendorDiscoveryPage from './pages/VendorDiscoveryPage';
// import VendorDetailPage from './pages/VendorDetailPage';
// import MessagesPage from './pages/MessagesPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';
// import VendorDashboardPage from './pages/VendorDashboardPage';
// import NotificationsPage from './pages/NotificationsPage';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { ToastProvider } from './contexts/ToastContext'; // <--- ADD THIS IMPORT

// const ProtectedRoute = ({ children }) => {
//   const { currentUser, loadingAuth } = useAuth();

//   if (loadingAuth) {
//     return (
//       <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="ms-2 text-primary">Loading user session...</p>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return <Navigate to="/auth" replace />;
//   }

//   return children;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <ToastProvider> {/* <--- WRAP WITH ToastProvider */}
//         <Router>
//           <Routes>
//             <Route path="/auth" element={<AuthPage />} />

//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/profile"
//               element={
//                 <ProtectedRoute>
//                   <UserProfilePage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/register-vendor"
//               element={
//                 <ProtectedRoute>
//                   <VendorRegistrationPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/vendors"
//               element={
//                 <ProtectedRoute>
//                   <VendorDiscoveryPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/vendors/:id"
//               element={
//                 <ProtectedRoute>
//                   <VendorDetailPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/messages"
//               element={
//                 <ProtectedRoute>
//                   <MessagesPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/messages/:vendorId"
//               element={
//                 <ProtectedRoute>
//                   <MessagesPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/admin"
//               element={
//                 <ProtectedRoute>
//                   <AdminDashboardPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/vendor-dashboard"
//               element={
//                 <ProtectedRoute>
//                   <VendorDashboardPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/notifications"
//               element={
//                 <ProtectedRoute>
//                   <NotificationsPage />
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="/" element={<InitialRedirect />} />

//             <Route path="*" element={
//               <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//                 <h1 className="text-danger">404 - Page Not Found</h1>
//               </div>
//             } />
//           </Routes>
//         </Router>
//       </ToastProvider> {/* <--- CLOSE ToastProvider */}
//     </AuthProvider>
//   );
// }

// const InitialRedirect = () => {
//   const { currentUser, loadingAuth } = useAuth();

//   if (loadingAuth) {
//     return (
//       <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading initial session...</span>
//         </div>
//         <p className="ms-2 text-primary">Checking session...</p>
//       </div>
//     );
//   }

//   return currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
// };

// export default App;

// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UserProfilePage from './pages/UserProfilePage';
import VendorRegistrationPage from './pages/VendorRegistrationPage';
import VendorDiscoveryPage from './pages/VendorDiscoveryPage';
import VendorDetailPage from './pages/VendorDetailPage';
import MessagesPage from './pages/MessagesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import HomePage from './pages/HomePage'; // <--- ADD THIS IMPORT
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-2 text-primary">Loading user session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-vendor"
              element={
                <ProtectedRoute>
                  <VendorRegistrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedRoute>
                  <VendorDiscoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors/:id"
              element={
                <ProtectedRoute>
                  <VendorDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:vendorId"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor-dashboard"
              element={
                <ProtectedRoute>
                  <VendorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            {/* Change the root route to HomePage */}
            <Route path="/" element={<HomePage />} /> {/* <--- CHANGE THIS LINE */}

            {/* The InitialRedirect component is no longer needed as / is now HomePage */}
            {/* <Route path="/" element={<InitialRedirect />} /> */}

            <Route path="*" element={
              <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <h1 className="text-danger">404 - Page Not Found</h1>
              </div>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

// The InitialRedirect component is now removed as / is directly HomePage
/*
const InitialRedirect = () => {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading initial session...</span>
        </div>
        <p className="ms-2 text-primary">Checking session...</p>
      </div>
    );
  }

  return currentUser ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
};
*/

export default App;