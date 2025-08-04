// src/pages/VendorDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Badge, Carousel, Button } from 'react-bootstrap';
import * as vendorApi from '../services/vendorApi';
import * as reviewApi from '../services/reviewApi';
import * as userApi from '../services/userApi';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewItem from '../components/reviews/ReviewItem';
import MapDisplay from '../components/maps/MapDisplay';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext'; // <--- ADD THIS IMPORT

function VendorDetailPage() {
  const { id: vendorId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast(); // <--- USE useToast hook
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  const fetchVendorAndReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedVendor = await vendorApi.getVendorById(vendorId);
      setVendor(fetchedVendor);

      if (userProfile && userProfile.favorites && fetchedVendor) {
        setIsFavorited(userProfile.favorites.includes(fetchedVendor.id));
      } else {
        setIsFavorited(false);
      }

      const fetchedReviews = await reviewApi.getReviewsForVendor(vendorId);
      setReviews(fetchedReviews);
    } catch (err) {
      setError(err || 'Failed to load vendor details or reviews.');
      console.error('Error fetching vendor/reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorId, userProfile]);

  useEffect(() => {
    fetchVendorAndReviews();
  }, [fetchVendorAndReviews]);

  const handleReviewSubmitted = () => {
    fetchVendorAndReviews();
  };

  const handleGetDirections = () => {
    if (vendor && vendor.location) {
      const { latitude, longitude, fullAddress } = vendor.location;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&query_place_id=${encodeURIComponent(fullAddress || vendor.businessName)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      addToast('info', 'Please log in to favorite vendors.'); // <--- USE TOAST
      return;
    }
    try {
      if (isFavorited) {
        await userApi.removeFavoriteVendor(vendorId);
        setIsFavorited(false);
        addToast('success', 'Vendor removed from favorites!'); // <--- USE TOAST
      } else {
        await userApi.addFavoriteVendor(vendorId);
        setIsFavorited(true);
        addToast('success', 'Vendor added to favorites!'); // <--- USE TOAST
      }
    } catch (err) {
      addToast('danger', `Failed to update favorites: ${err}`); // <--- USE TOAST
      console.error('Favorite toggle error:', err);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Loading vendor details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="danger">Error: {error}</Alert>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </Container>
    );
  }

  if (!vendor) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="info">Vendor not found.</Alert>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </Container>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffc107' : '#e4e5e9', fontSize: '1.5rem' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const isCurrentUserVendor = currentUser && userProfile && userProfile.role === 'vendor' && vendor.userId === currentUser.uid;

  return (
    <Container className="mt-5 pt-5 mb-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <Row>
                <Col md={4}>
                  {/* Profile Image */}
                  <img
                    src={vendor.profileImageUrl || 'https://placehold.co/400x400/cccccc/333333?text=No+Logo'}
                    alt={`${vendor.businessName} logo`}
                    className="img-fluid rounded-circle mb-3 shadow-sm"
                    style={{ width: '100%', height: 'auto', maxWidth: '200px', display: 'block', margin: '0 auto' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/cccccc/333333?text=Image+Error'; }}
                  />
                  {/* Additional Images Carousel */}
                  {vendor.additionalImages && vendor.additionalImages.length > 0 && (
                    <Carousel className="mt-3 mb-3">
                      {vendor.additionalImages.map((imgUrl, idx) => (
                        <Carousel.Item key={idx}>
                          <img
                            className="d-block w-100 rounded"
                            src={imgUrl}
                            alt={`Additional ${idx + 1}`}
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/cccccc/333333?text=Image+Error'; }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  )}
                  {/* Embedded Map */}
                  {vendor.location && vendor.location.latitude && vendor.location.longitude && (
                    <div className="mt-4">
                      <h5 className="text-secondary mb-3">Location on Map</h5>
                      <MapDisplay
                        center={[vendor.location.longitude, vendor.location.latitude]}
                        zoom={14}
                        vendors={[vendor]}
                        showGeocoder={false}
                        isInteractive={false}
                        style='mapbox://styles/mapbox/streets-v11'
                      />
                      <Button variant="outline-primary" className="w-100 mt-3" onClick={handleGetDirections}>
                        Get Directions
                      </Button>
                    </div>
                  )}
                </Col>
                <Col md={8}>
                  <h1 className="text-primary">{vendor.businessName}</h1>
                  <h4 className="text-muted mb-3">{vendor.description}</h4>
                  <p className="lead">
                    <Badge bg="secondary" className="me-2">{vendor.category}</Badge>
                    {vendor.isOpen ? (
                      <Badge bg="success">Open Now</Badge>
                    ) : (
                      <Badge bg="danger">Closed</Badge>
                    )}
                  </p>
                  <p>
                    Rating: {renderStars(vendor.averageRating)} {' '}
                    <span className="text-muted">({vendor.totalReviews} reviews)</span>
                  </p>
                  <ListGroup variant="flush" className="mb-4">
                    <ListGroup.Item><strong>Contact:</strong> {vendor.contactEmail} {vendor.contactPhone && ` | ${vendor.contactPhone}`}</ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Address:</strong> {vendor.address.street}
                      {vendor.address.colony && `, ${vendor.address.colony}`}
                      {`, ${vendor.address.city}, ${vendor.address.state}, ${vendor.address.zipCode}, ${vendor.address.country}`}
                    </ListGroup.Item>
                    {vendor.operatingHours && Object.keys(vendor.operatingHours).length > 0 && (
                      <ListGroup.Item>
                        <strong>Hours:</strong>
                        <ul>
                          {Object.entries(vendor.operatingHours).map(([day, hours]) => (
                            <li key={day} className="text-capitalize">{day}: {hours || 'Closed'}</li>
                          ))}
                        </ul>
                      </ListGroup.Item>
                    )}
                    {vendor.establishmentDate && (
                      <ListGroup.Item><strong>Established:</strong> {new Date(vendor.establishmentDate._seconds * 1000).toLocaleDateString()}</ListGroup.Item>
                    )}
                    {vendor.awards && vendor.awards.length > 0 && (
                      <ListGroup.Item><strong>Awards:</strong> {vendor.awards.join(', ')}</ListGroup.Item>
                    )}
                  </ListGroup>

                  {/* Chat with Vendor Button (Conditional) */}
                  {currentUser && !isCurrentUserVendor && (
                    <Button
                      as={Link}
                      to={`/messages/${vendor.id}`}
                      state={{ vendor: vendor }}
                      variant="primary"
                      className="w-100 mb-2"
                    >
                      Chat with {vendor.businessName}
                    </Button>
                  )}

                  {/* Favorite Button (Conditional) */}
                  {currentUser && !isCurrentUserVendor && ( // Show only if logged in and not the vendor themselves
                    <Button
                      variant={isFavorited ? 'warning' : 'outline-warning'}
                      className="w-100 mb-4"
                      onClick={handleFavoriteToggle}
                    >
                      {isFavorited ? '★ Favorited' : '☆ Add to Favorites'}
                    </Button>
                  )}

                  {/* Services Section */}
                  {vendor.services && vendor.services.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-secondary">Services</h4>
                      <ListGroup className="mb-3">
                        {vendor.services.map((service, index) => (
                          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{service.name}</strong>
                              {service.description && <small className="d-block text-muted">{service.description}</small>}
                            </div>
                            {service.price && <Badge bg="info">₹{service.price.toFixed(2)}</Badge>}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                </Col>
              </Row>

              {/* Reviews Section */}
              <div className="mt-5">
                <h3 className="text-primary mb-4">Customer Reviews ({reviews.length})</h3>
                <ReviewForm vendorId={vendorId} onReviewSubmitted={handleReviewSubmitted} />
                {reviews.length === 0 ? (
                  <Alert variant="info" className="text-center mt-4">No reviews yet. Be the first to review!</Alert>
                ) : (
                  <div className="mt-4">
                    {reviews.map((review) => (
                      <ReviewItem key={review.id} review={review} />
                    ))}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default VendorDetailPage;

// // src/pages/VendorDetailPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Badge, Carousel, Button, Modal } from 'react-bootstrap';
// import * as vendorApi from '../services/vendorApi';
// import * as reviewApi from '../services/reviewApi';
// import * as userApi from '../services/userApi';
// import ReviewForm from '../components/reviews/ReviewForm';
// import ReviewItem from '../components/reviews/ReviewItem';
// import MapDisplay from '../components/maps/MapDisplay'; // Ensure MapDisplay is imported
// // Removed DirectionsMap import
// import { useAuth } from '../contexts/AuthContext';
// import { useToast } from '../contexts/ToastContext';
// import useGeolocation from '../hooks/useGeolocation'; // Keep useGeolocation for user's location
// import ConfirmationModal from '../components/common/ConfirmationModal';

// import '../styles/VendorDetailPage.css';

// function VendorDetailPage() {
//   const { id: vendorId } = useParams();
//   const { currentUser, userProfile } = useAuth();
//   const { addToast } = useToast();
//   const [vendor, setVendor] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null); // Changed to null for consistency
//   const [isFavorited, setIsFavorited] = useState(false);

//   // --- ENSURE THESE STATES ARE DECLARED HERE ---
//   const [showDirectionsModal, setShowDirectionsModal] = useState(false);
//   const [travelMode, setTravelMode] = useState('driving');
//   const [routeInfo, setRouteInfo] = useState(null); // { distance, duration, mode }
//   // Removed states related to directions modal: showDirectionsModal, travelMode, routeInfo

//   const { location: userGeoLoc, loading: userGeoLoading, error: userGeoError, getPosition: getUserGeoPosition } = useGeolocation(); // Keep useGeolocation

//   const fetchVendorAndReviews = useCallback(async () => {
//     setLoading(true);
//     setError(null); // Clear error on new fetch
//     try {
//       const fetchedVendor = await vendorApi.getVendorById(vendorId);
//       setVendor(fetchedVendor);

//       if (userProfile && userProfile.favorites && fetchedVendor) {
//         setIsFavorited(userProfile.favorites.includes(fetchedVendor.id));
//       } else {
//         setIsFavorited(false);
//       }

//       const fetchedReviews = await reviewApi.getReviewsForVendor(vendorId);
//       setReviews(fetchedReviews);
//     } catch (err) {
//       setError(err || 'Failed to load vendor details or reviews.');
//       console.error('Error fetching vendor/reviews:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [vendorId, userProfile]);

//   useEffect(() => {
//     fetchVendorAndReviews();
//   }, [fetchVendorAndReviews]);

//   const handleReviewSubmitted = () => {
//     fetchVendorAndReviews();
//   };

//   // Reverted handleGetDirectionsClick to open Google Maps externally
//   const handleGetDirectionsClick = () => {
//     if (!currentUser) {
//       addToast('info', 'Please log in to get directions.');
//       return;
//     }
//     getUserGeoPosition(); // Attempt to get user's location

//     // Open Google Maps after a short delay to allow geolocation to attempt
//     setTimeout(() => {
//         if (vendor && vendor.location) {
//             const { latitude, longitude, fullAddress } = vendor.location;
//             // Use user's current location if available, otherwise just destination
//             const origin = (userGeoLoc.latitude && userGeoLoc.longitude) ? `${userGeoLoc.latitude},${userGeoLoc.longitude}` : '';
//             const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${latitude},${longitude}&query_place_id=${encodeURIComponent(fullAddress || vendor.businessName)}`;
//             window.open(mapsUrl, '_blank');
//         } else {
//             addToast('warning', 'Vendor location not available for directions.');
//         }
//     }, userGeoLoading ? 2000 : 0); // Wait 2 seconds if geolocation is loading
//   };

//   // Removed handleRouteCalculated

//   const renderStars = (rating) => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <span key={i} style={{ color: i <= rating ? '#ffc107' : '#e4e5e9', fontSize: '1.5rem' }}>
//           ★
//         </span>
//       );
//     }
//     return stars;
//   };

//   const handleFavoriteToggle = async () => {
//     if (!currentUser) {
//       addToast('info', 'Please log in to favorite vendors.');
//       return;
//     }
//     try {
//       if (isFavorited) {
//         await userApi.removeFavoriteVendor(vendorId);
//         setIsFavorited(false);
//         addToast('success', 'Vendor removed from favorites!');
//       } else {
//         await userApi.addFavoriteVendor(vendorId);
//         setIsFavorited(true);
//         addToast('success', 'Vendor added to favorites!');
//       }
//     } catch (err) {
//       addToast('danger', `Failed to update favorites: ${err}`);
//       console.error('Favorite toggle error:', err);
//     }
//   };

//   const isCurrentUserVendor = currentUser && userProfile && userProfile.role === 'vendor' && vendor.userId === currentUser.uid;

//   if (loading) {
//     return (
//       <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//         <Spinner animation="border" variant="primary" />
//         <p className="ms-2 text-primary">Loading vendor details...</p>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="mt-5 pt-5 text-center">
//         <Alert variant="danger">Error: {error}</Alert>
//         <Button onClick={() => window.history.back()}>Go Back</Button>
//       </Container>
//     );
//   }

//   if (!vendor) {
//     return (
//       <Container className="mt-5 pt-5 text-center">
//         <Alert variant="info">Vendor not found.</Alert>
//         <Button onClick={() => window.history.back()}>Go Back</Button>
//       </Container>
//     );
//   }

//   return (
//     <Container className="mt-5 pt-5 mb-5 animate__animated animate__fadeIn">
//       <Row className="justify-content-center">
//         <Col lg={10}>
//           <Card className="shadow-lg p-4 vendor-detail-card">
//             <Card.Body>
//               <Row className="g-4">
//                 <Col md={4} className="d-flex flex-column align-items-center">
//                   {/* Profile Image */}
//                   <img
//                     src={vendor.profileImageUrl || 'https://placehold.co/400x400/cccccc/333333?text=No+Logo'}
//                     alt={`${vendor.businessName} logo`}
//                     className="img-fluid rounded-circle mb-3 shadow-sm vendor-detail-profile-img"
//                     style={{ width: '100%', height: 'auto', maxWidth: '200px', display: 'block', margin: '0 auto' }}
//                     onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/cccccc/333333?text=Image+Error'; }}
//                   />
//                   {/* Additional Images Carousel */}
//                   {vendor.additionalImages && vendor.additionalImages.length > 0 && (
//                     <Carousel className="mt-3 mb-3 vendor-detail-carousel">
//                       {vendor.additionalImages.map((imgUrl, idx) => (
//                         <Carousel.Item key={idx}>
//                           <img
//                             className="d-block w-100 rounded"
//                             src={imgUrl}
//                             alt={`Additional ${idx + 1}`}
//                             style={{ height: '200px', objectFit: 'cover' }}
//                             onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/cccccc/333333?text=Image+Error'; }}
//                           />
//                         </Carousel.Item>
//                       ))}
//                     </Carousel>
//                   )}
//                   {/* Embedded Map */}
//                   {vendor.location && vendor.location.latitude && vendor.location.longitude && (
//                     <div className="mt-4 w-100">
//                       <h5 className="text-secondary mb-3">Location on Map</h5>
//                       <div className="vendor-detail-map-container" style={{ height: '250px' }}>
//                         <MapDisplay
//                           center={[vendor.location.longitude, vendor.location.latitude]}
//                           zoom={14}
//                           markers={[{
//                             id: vendor.id,
//                             lng: vendor.location.longitude,
//                             lat: vendor.location.latitude,
//                             businessName: vendor.businessName,
//                             description: vendor.description,
//                             profileImageUrl: vendor.profileImageUrl,
//                             averageRating: vendor.averageRating,
//                             totalReviews: vendor.totalReviews,
//                           }]}
//                           isInteractive={false} // Static map
//                           style='mapbox://styles/mapbox/streets-v11'
//                           // showGeocoder and showDirectionsControls are false for embedded map
//                         />
//                       </div>
//                       <Button variant="outline-primary" className="w-100 mt-3 rounded-pill" onClick={handleGetDirectionsClick}>
//                         Get Directions
//                       </Button>
//                     </div>
//                   )}
//                 </Col>
//                 <Col md={8}>
//                   <h1 className="text-primary fw-bold display-5">{vendor.businessName}</h1>
//                   <h4 className="text-muted mb-3 fs-5">{vendor.description}</h4>
//                   <p className="lead">
//                     <Badge bg="secondary" className="me-2 rounded-pill px-3 py-1">{vendor.category}</Badge>
//                     {vendor.isOpen ? (
//                       <Badge bg="success" className="rounded-pill px-3 py-1">Open Now</Badge>
//                     ) : (
//                       <Badge bg="danger" className="rounded-pill px-3 py-1">Closed</Badge>
//                     )}
//                   </p>
//                   <p className="fs-5">
//                     Rating: {renderStars(vendor.averageRating)} {' '}
//                     <span className="text-muted">({vendor.totalReviews} reviews)</span>
//                   </p>
//                   <ListGroup variant="flush" className="mb-4">
//                     <ListGroup.Item className="vendor-detail-list-group-item"><strong>Contact:</strong> {vendor.contactEmail} {vendor.contactPhone && ` | ${vendor.contactPhone}`}</ListGroup.Item>
//                     <ListGroup.Item className="vendor-detail-list-group-item">
//                       <strong>Address:</strong> {vendor.address.street}
//                       {vendor.address.colony && `, ${vendor.address.colony}`}
//                       {`, ${vendor.address.city}, ${vendor.address.state}, ${vendor.address.zipCode}, ${vendor.address.country}`}
//                     </ListGroup.Item>
//                     {vendor.operatingHours && Object.keys(vendor.operatingHours).length > 0 && (
//                       <ListGroup.Item className="vendor-detail-list-group-item">
//                         <strong>Hours:</strong>
//                         <ul className="mt-2">
//                           {Object.entries(vendor.operatingHours).map(([day, hours]) => (
//                             <li key={day} className="text-capitalize">{day}: {hours || 'Closed'}</li>
//                           ))}
//                         </ul>
//                       </ListGroup.Item>
//                     )}
//                     {vendor.establishmentDate && (
//                       <ListGroup.Item className="vendor-detail-list-group-item"><strong>Established:</strong> {new Date(vendor.establishmentDate._seconds * 1000).toLocaleDateString()}</ListGroup.Item>
//                     )}
//                     {vendor.awards && vendor.awards.length > 0 && (
//                       <ListGroup.Item className="vendor-detail-list-group-item"><strong>Awards:</strong> {vendor.awards.join(', ')}</ListGroup.Item>
//                     )}
//                   </ListGroup>

//                   {/* Chat with Vendor Button (Conditional) */}
//                   {currentUser && !isCurrentUserVendor && (
//                     <Button
//                       as={Link}
//                       to={`/messages/${vendor.id}`}
//                       state={{ vendor: vendor }}
//                       variant="primary"
//                       className="w-100 mb-2 rounded-pill"
//                     >
//                       Chat with {vendor.businessName}
//                     </Button>
//                   )}

//                   {/* Favorite Button (Conditional) */}
//                   {currentUser && !isCurrentUserVendor && (
//                     <Button
//                       variant={isFavorited ? 'warning' : 'outline-warning'}
//                       className="w-100 mb-4 rounded-pill"
//                       onClick={handleFavoriteToggle}
//                     >
//                       {isFavorited ? '★ Favorited' : '☆ Add to Favorites'}
//                     </Button>
//                   )}

//                   {/* Services Section */}
//                   {vendor.services && vendor.services.length > 0 && (
//                     <div className="mb-4">
//                       <h4 className="text-secondary">Services</h4>
//                       <ListGroup className="mb-3">
//                         {vendor.services.map((service, index) => (
//                           <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
//                             <div>
//                               <strong>{service.name}</strong>
//                               {service.description && <small className="d-block text-muted">{service.description}</small>}
//                             </div>
//                             {service.price && <Badge bg="info">₹{service.price.toFixed(2)}</Badge>}
//                           </ListGroup.Item>
//                         ))}
//                       </ListGroup>
//                     </div>
//                   )}
//                 </Col>
//               </Row>

//               {/* Reviews Section */}
//               <div className="mt-5">
//                 <h3 className="text-primary mb-4">Customer Reviews ({reviews.length})</h3>
//                 <ReviewForm vendorId={vendorId} onReviewSubmitted={handleReviewSubmitted} />
//                 {reviews.length === 0 ? (
//                   <Alert variant="info" className="text-center mt-4">No reviews yet. Be the first to review!</Alert>
//                 ) : (
//                   <div className="mt-4">
//                     {reviews.map((review) => (
//                       <ReviewItem key={review.id} review={review} />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Directions Modal (Reverted to external Google Maps) */}
//       <Modal show={showDirectionsModal} onHide={() => setShowDirectionsModal(false)} size="lg" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Get Directions</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {userGeoLoading ? (
//             <div className="text-center my-3">
//               <Spinner animation="border" variant="primary" />
//               <p className="ms-2">Getting your location...</p>
//             </div>
//           ) : userGeoError ? (
//             <Alert variant="warning">
//               <strong>Location Error:</strong> {userGeoError}. Please enable location services.
//             </Alert>
//           ) : !userGeoLoc.latitude || !userGeoLoc.longitude ? (
//             <Alert variant="info">Your location is not available. Please ensure GPS is enabled and try again.</Alert>
//           ) : (
//             <>
//               <p className="text-center">
//                 Directions from your current location to <strong>{vendor.businessName}</strong>.
//               </p>
//               <div className="text-center mt-3">
//                 <Button variant="primary" size="lg" onClick={() => {
//                     const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userGeoLoc.latitude},${userGeoLoc.longitude}&destination=${vendor.location.latitude},${vendor.location.longitude}`;
//                     window.open(mapsUrl, '_blank');
//                 }} className="rounded-pill px-4">
//                   Open in Google Maps
//                 </Button>
//               </div>
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//     </Container>
//   );
// }

// export default VendorDetailPage;