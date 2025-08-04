// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col, Nav, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userApi';
import useGeolocation from '../hooks/useGeolocation';
import * as reviewApi from '../services/reviewApi';
import * as vendorApi from '../services/vendorApi'; // <--- ADD THIS IMPORT for fetching favorited vendor details
import ReviewItem from '../components/reviews/ReviewItem';
import VendorCard from '../components/vendors/VendorCard'; // <--- ADD THIS IMPORT for displaying favorited vendors

function UserProfilePage() {
  const { userProfile: authUserProfile, loadingAuth, currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const [myFavorites, setMyFavorites] = useState([]); // <--- NEW STATE for user's favorites
  const [loadingFavorites, setLoadingFavorites] = useState(true); // <--- NEW STATE
  const [favoritesError, setFavoritesError] = useState(''); // <--- NEW STATE

  const [activeTab, setActiveTab] = useState('profile');

  // State for review editing modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReviewToEdit, setCurrentReviewToEdit] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

  // Effect to load user profile when component mounts or authUserProfile changes
  useEffect(() => {
    if (authUserProfile) {
      setProfile(authUserProfile);
      setName(authUserProfile.name || '');
      setLatitude(authUserProfile.location?.latitude || '');
      setLongitude(authUserProfile.location?.longitude || '');
      setAddress(authUserProfile.location?.fullAddress || authUserProfile.location?.address || authUserProfile.location?.colony || '');
    }
  }, [authUserProfile]);

  // Fetch user's reviews (made a useCallback for reusability)
  const fetchMyReviews = useCallback(async () => {
    if (!authUserProfile) return;
    setLoadingReviews(true);
    setReviewsError('');
    try {
      const reviews = await reviewApi.getReviewsByUser();
      setMyReviews(reviews);
    } catch (err) {
      setReviewsError(err || 'Failed to fetch your reviews.');
      console.error('Error fetching my reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, [authUserProfile]);

  // Fetch user's favorites (new useCallback)
  const fetchMyFavorites = useCallback(async () => {
    if (!authUserProfile || !authUserProfile.favorites || authUserProfile.favorites.length === 0) {
      setMyFavorites([]);
      setLoadingFavorites(false);
      return;
    }
    setLoadingFavorites(true);
    setFavoritesError('');
    try {
      // Fetch details for each favorited vendor ID
      const favoriteVendorPromises = authUserProfile.favorites.map(vendorId =>
        vendorApi.getVendorById(vendorId)
      );
      const fetchedFavorites = await Promise.all(favoriteVendorPromises);
      // Filter out any nulls if a vendor was deleted
      setMyFavorites(fetchedFavorites.filter(vendor => vendor !== null));
    } catch (err) {
      setFavoritesError(err || 'Failed to fetch your favorites.');
      console.error('Error fetching my favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  }, [authUserProfile]); // Depends on authUserProfile for its favorites array

  // Effect to trigger review fetch when tab changes or userProfile loads
  useEffect(() => {
    if (activeTab === 'myReviews' && authUserProfile) {
      fetchMyReviews();
    } else if (activeTab === 'myFavorites' && authUserProfile) { // <--- NEW: Trigger favorites fetch
      fetchMyFavorites();
    }
  }, [activeTab, authUserProfile, fetchMyReviews, fetchMyFavorites]); // Added fetchMyFavorites to dependencies

  // Effect to update form fields when geolocation changes
  useEffect(() => {
    if (geoLoc.latitude !== null && geoLoc.longitude !== null) {
      setLatitude(geoLoc.latitude);
      setLongitude(geoLoc.longitude);
      setMessage('Location fetched successfully! Click Save to update your profile.');
    }
  }, [geoLoc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const updates = {
        name,
        location: {
          latitude: parseFloat(latitude) || null,
          longitude: parseFloat(longitude) || null,
          address: address || '',
        },
      };

      if (updates.location.latitude === null || updates.location.longitude === null) {
        delete updates.location;
      }

      const updatedUser = await updateUserProfile(updates);
      // Important: Update AuthContext's userProfile to reflect new favorites if any
      // This is a simplified approach; a more robust solution would be to
      // trigger a re-fetch of the userProfile in AuthContext or update it directly.
      // For now, assume userProfile in context updates on next full login/refresh.
      setProfile(updatedUser); // Update local profile state
      setName(updatedUser.name || '');
      setLatitude(updatedUser.location?.latitude || '');
      setLongitude(updatedUser.location?.longitude || '');
      setAddress(updatedUser.location?.fullAddress || updatedUser.location?.address || updatedUser.location?.colony || '');
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Review Edit/Delete Handlers ---
  const handleShowEditModal = (review) => {
    setCurrentReviewToEdit(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentReviewToEdit(null);
    setEditRating(0);
    setEditComment('');
    setError('');
    setMessage('');
  };

  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!currentReviewToEdit) return;
    if (editRating === 0) {
      setError('Please select a rating.');
      setLoading(false);
      return;
    }
    if (!editComment.trim()) {
      setError('Please enter a comment.');
      setLoading(false);
      return;
    }

    try {
      await reviewApi.updateReview(currentReviewToEdit.id, {
        rating: editRating,
        comment: editComment,
      });
      setMessage('Review updated successfully!');
      handleCloseEditModal();
      fetchMyReviews();
    } catch (err) {
      setError(err || 'Failed to update review.');
      console.error('Review update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      setLoading(true);
      try {
        await reviewApi.deleteReview(reviewId);
        setMessage('Review deleted successfully!');
        fetchMyReviews();
      } catch (err) {
        setError(err || 'Failed to delete review.');
        console.error('Review delete error:', err);
      } finally {
        setLoading(false);
      }
    }
  };
  // --- End Review Edit/Delete Handlers ---


  if (loadingAuth || !profile) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={10} lg={9}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <h2 className="text-center mb-4 text-primary">Your Profile</h2>

              {/* Navigation Tabs */}
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link onClick={() => setActiveTab('profile')} active={activeTab === 'profile'}>
                    Profile Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link onClick={() => setActiveTab('myReviews')} active={activeTab === 'myReviews'}>
                    My Reviews
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item> {/* <--- NEW TAB */}
                  <Nav.Link onClick={() => setActiveTab('myFavorites')} active={activeTab === 'myFavorites'}>
                    My Favorites
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {/* Content based on active tab */}
              {activeTab === 'profile' && (
                <>
                  {error && <Alert variant="danger">{error}</Alert>}
                  {message && <Alert variant="success">{message}</Alert>}
                  {geoError && <Alert variant="warning">Geolocation Error: {geoError}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="profileName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="profileLatitude">
                      <Form.Label>Latitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        placeholder="Enter latitude"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="profileLongitude">
                      <Form.Label>Longitude</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        placeholder="Enter longitude"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="profileAddress">
                      <Form.Label>Display Address / Colony Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., Banjara Hills, Hyderabad"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        This is for display. Coordinates will be used for search.
                      </Form.Text>
                    </Form.Group>

                    <Button
                      variant="info"
                      onClick={getPosition}
                      disabled={geoLoading || loading}
                      className="w-100 mb-3"
                    >
                      {geoLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-2">Getting Location...</span>
                        </>
                      ) : (
                        'Get My Current Location (GPS)'
                      )}
                    </Button>

                    <Button variant="primary" type="submit" className="w-100" disabled={loading || geoLoading}>
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-2">Saving Profile...</span>
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </Button>
                  </Form>
                </>
              )}

              {activeTab === 'myReviews' && (
                <div className="mt-4">
                  <h4 className="mb-3 text-secondary">My Submitted Reviews</h4>
                  {loadingReviews ? (
                    <div className="text-center">
                      <Spinner animation="border" size="sm" variant="primary" />
                      <p className="ms-2">Loading your reviews...</p>
                    </div>
                  ) : reviewsError ? (
                    <Alert variant="danger">{reviewsError}</Alert>
                  ) : myReviews.length === 0 ? (
                    <Alert variant="info" className="text-center">You haven't submitted any reviews yet.</Alert>
                  ) : (
                    <div>
                      {myReviews.map((review) => (
                        <Card key={review.id} className="mb-3 shadow-sm">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="mb-0 text-primary">{review.vendorName || 'Unknown Vendor'}</h6>
                              <small className="text-muted">
                                {review.createdAt ? new Date(review.createdAt._seconds * 1000).toLocaleDateString() : 'N/A'}
                              </small>
                            </div>
                            <div className="mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  style={{ color: star <= review.rating ? '#ffc107' : '#e4e5e9', fontSize: '1.2rem' }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <Card.Text>{review.comment}</Card.Text>
                            {/* Edit/Delete Buttons */}
                            {currentUser && review.userId === currentUser.uid && (
                              <div className="mt-2 text-end">
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(review)}>
                                  Edit
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteReview(review.id)}>
                                  Delete
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'myFavorites' && ( // <--- NEW TAB CONTENT
                <div className="mt-4">
                  <h4 className="mb-3 text-secondary">My Favorited Vendors</h4>
                  {loadingFavorites ? (
                    <div className="text-center">
                      <Spinner animation="border" size="sm" variant="primary" />
                      <p className="ms-2">Loading your favorites...</p>
                    </div>
                  ) : favoritesError ? (
                    <Alert variant="danger">{favoritesError}</Alert>
                  ) : myFavorites.length === 0 ? (
                    <Alert variant="info" className="text-center">You haven't favorited any vendors yet.</Alert>
                  ) : (
                    <Row xs={1} md={2} lg={3} className="g-4">
                      {myFavorites.map((vendor) => (
                        <Col key={vendor.id}>
                          <VendorCard vendor={vendor} /> {/* Reuse VendorCard */}
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Review Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Your Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleEditReviewSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Rating <span className="text-danger">*</span></Form.Label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= editRating ? '#ffc107' : '#e4e5e9' }}
                    onClick={() => setEditRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="editComment">
              <Form.Label>Comment <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default UserProfilePage;