// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { Container, Navbar, Nav, Button, Spinner } from 'react-bootstrap'; // Ensure Spinner is imported
import { useAuth } from '../contexts/AuthContext';
import { logout, getCurrentIdToken } from '../services/authApi';
import { Link } from 'react-router-dom';
import NotificationBell from '../components/common/NotificationBell';
import { useToast } from '../contexts/ToastContext';

function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getCurrentIdToken();
      if (token) {
        console.log("Current Firebase ID Token:", token);
      }
    };
    if (currentUser) {
      fetchToken();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      addToast('success', 'Logged out successfully!');
    } catch (error) {
      console.error("Logout error:", error);
      addToast('danger', `Logout failed: ${error.message}`);
    }
  };

  // Show loading spinner while authentication state is being determined
  if (!currentUser || !userProfile) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Loading user session...</p>
      </Container>
    );
  }

  return (
    <>
      {/* Fixed-top Navbar with responsive collapse */}
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="shadow-sm py-2"> {/* Increased vertical padding */}
        <Container fluid="md"> {/* Use fluid-md for slightly wider container on larger screens */}
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-white">Local Hunt</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto my-2 my-lg-0"> {/* Added margin for collapsed nav on mobile */}
              <Nav.Link as={Link} to="/" className="text-white mx-lg-2 fs-6">Home</Nav.Link> {/* Larger font size */}
              <Nav.Link as={Link} to="/vendors" className="text-white mx-lg-2 fs-6">Vend. Discovery</Nav.Link>
              <Nav.Link as={Link} to="/messages" className="text-white mx-lg-2 fs-6">Messages</Nav.Link>
              <Nav.Link as={Link} to="/profile" className="text-white mx-lg-2 fs-6">Profile</Nav.Link>
              {userProfile.role === 'user' && (
                <Nav.Link as={Link} to="/register-vendor" className="text-white mx-lg-2 fs-6">Register Business</Nav.Link>
              )}
              {userProfile.role === 'vendor' && (
                <Nav.Link as={Link} to="/vendor-dashboard" className="text-white mx-lg-2 fs-6">My Business</Nav.Link>
              )}
              {userProfile.role === 'admin' && (
                <Nav.Link as={Link} to="/admin" className="text-white mx-lg-2 fs-6">Admin Panel</Nav.Link>
              )}
            </Nav>
            <Nav className="d-flex align-items-center my-2 my-lg-0"> {/* Align items for user info and logout */}
              <NotificationBell />
              <Navbar.Text className="me-lg-3 text-white text-nowrap fs-6"> {/* text-nowrap to prevent wrapping */}
                Signed in as: <span className="fw-bold">{userProfile.name} ({userProfile.role})</span>
              </Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout} className="rounded-pill px-3 py-2 fs-6">Logout</Button> {/* Larger touch target */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Dashboard Content */}
      <Container className="mt-5 pt-5 text-center dashboard-content animate__animated animate__fadeIn">
        <h1 className="mb-4 text-primary fw-bold display-5">Welcome to Local Hunt, {userProfile.name}!</h1> {/* Larger heading */}
        <p className="lead text-muted fs-5">Your role: <span className="badge bg-info fs-6 py-2 px-3 rounded-pill">{userProfile.role}</span></p> {/* Rounded pill badge */}
        <p className="mb-4 fs-5">This is your personalized dashboard. Explore vendors or manage your business.</p>

        {/* Responsive button group: stacks on small screens, wraps on medium */}
        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mb-5">
          {userProfile.role === 'vendor' && (
            <Button as={Link} to="/vendor-dashboard" variant="success" size="lg" className="shadow-sm animate__animated animate__pulse animate__infinite w-100 w-sm-auto">Manage Your Business</Button>
          )}
          {userProfile.role === 'admin' && (
            <Button as={Link} to="/admin" variant="danger" size="lg" className="shadow-sm animate__animated animate__pulse animate__infinite w-100 w-sm-auto">Access Admin Panel</Button>
          )}
          <Button as={Link} to="/vendors" variant="primary" size="lg" className="shadow-sm w-100 w-sm-auto">Discover Vendors</Button>
          {userProfile.role === 'user' && (
            <Button as={Link} to="/register-vendor" variant="info" size="lg" className="shadow-sm w-100 w-sm-auto">Register Your Business</Button>
          )}
        </div>
        <p className="mt-3 text-muted small">Your User ID: {currentUser.uid}</p>
      </Container>

      {/* Custom CSS for animations and styling (kept for reference, some might be overridden by Bootstrap classes) */}
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
        .dashboard-content {
            animation-duration: 0.8s;
        }
        /* Bootstrap handles most responsiveness, but these are general styles */
        .navbar-brand {
            letter-spacing: 1px;
        }
        .nav-link {
            transition: color 0.3s ease;
        }
        .nav-link:hover {
            color: #e9ecef !important; /* Lighter color on hover */
        }
        /* Custom class for button widths on small screens */
        .w-sm-auto {
            width: auto !important;
        }
        /* Ensure buttons stack on very small screens */
        @media (max-width: 575.98px) { /* xs breakpoint */
            .d-flex.flex-column.flex-sm-row > .btn {
                width: 100% !important;
            }
        }
      `}</style>
    </>
  );
}

export default Dashboard;