// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Nav, Spinner, Alert, Button, Table, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as adminApi from '../services/adminApi';

function AdminDashboardPage() {
  const { userProfile, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'vendors', 'reviews'
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!loadingAuth && userProfile && userProfile.role !== 'admin') {
      setError('Access Denied. You must be an administrator to view this page.');
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  }, [userProfile, loadingAuth, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const fetchedUsers = await adminApi.getAllUsers();
        setUsers(fetchedUsers);
      } else if (activeTab === 'vendors') {
        const fetchedVendors = await adminApi.getAllVendorsAdmin();
        setVendors(fetchedVendors);
      } else if (activeTab === 'reviews') {
        const fetchedReviews = await adminApi.getAllReviewsAdmin();
        setReviews(fetchedReviews);
      }
    } catch (err) {
      setError(err || 'Failed to fetch data.');
      console.error(`Admin Dashboard: Error fetching ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // Dependency: re-fetch when tab changes

  useEffect(() => {
    if (!loadingAuth && userProfile && userProfile.role === 'admin') {
      fetchData();
    }
  }, [fetchData, loadingAuth, userProfile]);

  // --- Admin Action Handlers ---

  const handleDeleteUser = async (uid) => {
    if (window.confirm(`Are you sure you want to delete user ${uid}? This action is irreversible.`)) {
      setLoading(true);
      try {
        await adminApi.deleteUser(uid);
        alert('User deleted successfully.');
        fetchData(); // Re-fetch data
      } catch (err) {
        setError(err || 'Failed to delete user.');
        console.error('Admin: Error deleting user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateVendorStatus = async (vendorId, status) => {
    setLoading(true);
    try {
      await adminApi.updateVendorStatus(vendorId, status);
      alert(`Vendor status updated to ${status}.`);
      fetchData(); // Re-fetch data
    } catch (err) {
      setError(err || 'Failed to update vendor status.');
      console.error('Admin: Error updating vendor status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm(`Are you sure you want to delete vendor ${vendorId}? This action is irreversible.`)) {
      setLoading(true);
      try {
        await adminApi.deleteVendor(vendorId);
        alert('Vendor deleted successfully.');
        fetchData(); // Re-fetch data
      } catch (err) {
        setError(err || 'Failed to delete vendor.');
        console.error('Admin: Error deleting vendor:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateReviewStatus = async (reviewId, status) => {
    setLoading(true);
    try {
      await adminApi.updateReviewStatus(reviewId, status);
      alert(`Review status updated to ${status}.`);
      fetchData(); // Re-fetch data
    } catch (err) {
      setError(err || 'Failed to update review status.');
      console.error('Admin: Error updating review status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm(`Are you sure you want to delete review ${reviewId}? This action is irreversible.`)) {
      setLoading(true);
      try {
        await adminApi.deleteReview(reviewId);
        alert('Review deleted successfully.');
        fetchData(); // Re-fetch data
      } catch (err) {
        setError(err || 'Failed to delete review.');
        console.error('Admin: Error deleting review:', err);
      } finally {
        setLoading(false);
      }
    }
  };


  if (loadingAuth || (userProfile && userProfile.role !== 'admin')) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">
          {loadingAuth ? 'Loading user session...' : 'Redirecting...'}
        </p>
      </Container>
    );
  }

  if (error && userProfile.role === 'admin') { // Only show error if admin and something went wrong with data fetch
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="danger">Error: {error}</Alert>
        <Button onClick={fetchData}>Retry Data Fetch</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5 mb-5">
      <h1 className="text-center mb-4 text-primary">Admin Dashboard</h1>

      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link onClick={() => setActiveTab('users')} active={activeTab === 'users'}>
            Users
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => setActiveTab('vendors')} active={activeTab === 'vendors'}>
            Vendors
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => setActiveTab('reviews')} active={activeTab === 'reviews'}>
            Reviews
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="ms-2 text-primary">Loading {activeTab} data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'users' && (
            <Card className="shadow-sm p-4">
              <h4 className="text-secondary mb-3">All Users ({users.length})</h4>
              <Table striped bordered hover responsive className="text-start">
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>{user.name}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.role !== 'admin' && user.id !== userProfile.uid && ( // Cannot delete self or other admins
                          <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}

          {activeTab === 'vendors' && (
            <Card className="shadow-sm p-4">
              <h4 className="text-secondary mb-3">All Vendors ({vendors.length})</h4>
              <Table striped bordered hover responsive className="text-start">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Business Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Reviews</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td>{vendor.id}</td>
                      <td>{vendor.businessName}</td>
                      <td>{vendor.category}</td>
                      <td>{vendor.status}</td>
                      <td>{vendor.averageRating?.toFixed(1) || 'N/A'}</td>
                      <td>{vendor.totalReviews}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={vendor.status}
                          onChange={(e) => handleUpdateVendorStatus(vendor.id, e.target.value)}
                          className="me-2 mb-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="suspended">Suspended</option>
                          <option value="rejected">Rejected</option>
                        </Form.Select>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteVendor(vendor.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}

          {activeTab === 'reviews' && (
            <Card className="shadow-sm p-4">
              <h4 className="text-secondary mb-3">All Reviews ({reviews.length})</h4>
              <Table striped bordered hover responsive className="text-start">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vendor</th>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.id}</td>
                      <td>{review.vendorId}</td> {/* Can fetch vendor name later */}
                      <td>{review.userId}</td> {/* Can fetch user name later */}
                      <td>{review.rating}</td>
                      <td>{review.comment}</td>
                      <td>{review.status}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={review.status}
                          onChange={(e) => handleUpdateReviewStatus(review.id, e.target.value)}
                          className="me-2 mb-1"
                        >
                          <option value="approved">Approved</option>
                          <option value="flagged">Flagged</option>
                          <option value="removed">Removed</option>
                        </Form.Select>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteReview(review.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}

export default AdminDashboardPage;