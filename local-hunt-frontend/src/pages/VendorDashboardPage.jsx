// // src/pages/VendorDashboardPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { Container, Row, Col, Card, Nav, Spinner, Alert, Button, Form, ListGroup, Badge } from 'react-bootstrap';
// import { useAuth } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import useGeolocation from '../hooks/useGeolocation';
// import * as vendorApi from '../services/vendorApi';
// import * as reviewApi from '../services/reviewApi'; // To fetch vendor's own reviews
// import ReviewItem from '../components/reviews/ReviewItem'; // To display reviews

// function VendorDashboardPage() {
//   const { userProfile, loadingAuth, currentUser } = useAuth();
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'reviews', 'analytics'
//   const [vendorData, setVendorData] = useState(null); // Full vendor profile
//   const [vendorReviews, setVendorReviews] = useState([]); // Reviews for this vendor
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [message, setMessage] = useState(''); // For success messages

//   // Form states for profile editing
//   const [businessName, setBusinessName] = useState('');
//   const [description, setDescription] = useState('');
//   const [category, setCategory] = useState('');
//   const [contactEmail, setContactEmail] = useState('');
//   const [contactPhone, setContactPhone] = useState('');
//   const [street, setStreet] = useState('');
//   const [colony, setColony] = useState('');
//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');
//   const [zipCode, setZipCode] = useState('');
//   const [country, setCountry] = useState('');
//   const [latitude, setLatitude] = useState('');
//   const [longitude, setLongitude] = useState('');
//   const [services, setServices] = useState([]);
//   const [operatingHours, setOperatingHours] = useState({});
//   const [establishmentDate, setEstablishmentDate] = useState('');
//   const [awards, setAwards] = useState([]);
//   const [profileImage, setProfileImage] = useState(null); // New file for upload
//   const [additionalImages, setAdditionalImages] = useState([]); // New files for upload
//   const [existingProfileImageUrl, setExistingProfileImageUrl] = useState(''); // Existing URL
//   const [existingAdditionalImagesUrls, setExistingAdditionalImagesUrls] = useState([]); // Existing URLs
//   const [isOpen, setIsOpen] = useState(true); // Vendor status toggle

//   const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

//   // Categories for dropdown
//   const categories = [
//     'Food & Beverage', 'Retail', 'Services', 'Automotive', 'Healthcare', 'Education', 'Other'
//   ];

//   // Redirect if not a vendor or admin
//   useEffect(() => {
//     if (!loadingAuth && userProfile && userProfile.role !== 'vendor' && userProfile.role !== 'admin') {
//       setError('Access Denied. You must be a vendor or administrator to view this page.');
//       setTimeout(() => navigate('/dashboard'), 3000);
//     }
//   }, [userProfile, loadingAuth, navigate]);

//   // Fetch vendor's own profile and reviews
//   const fetchVendorData = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const fetchedVendor = await vendorApi.getVendorProfileForOwner();
//       setVendorData(fetchedVendor);

//       // Populate form fields for editing
//       setBusinessName(fetchedVendor.businessName || '');
//       setDescription(fetchedVendor.description || '');
//       setCategory(fetchedVendor.category || '');
//       setContactEmail(fetchedVendor.contactEmail || '');
//       setContactPhone(fetchedVendor.contactPhone || '');
//       setStreet(fetchedVendor.address?.street || '');
//       setColony(fetchedVendor.address?.colony || '');
//       setCity(fetchedVendor.address?.city || '');
//       setState(fetchedVendor.address?.state || '');
//       setZipCode(fetchedVendor.address?.zipCode || '');
//       setCountry(fetchedVendor.address?.country || '');
//       setLatitude(fetchedVendor.location?.latitude || '');
//       setLongitude(fetchedVendor.location?.longitude || '');
//       setServices(fetchedVendor.services || [{ name: '', price: '', description: '' }]);
//       setOperatingHours(fetchedVendor.operatingHours || { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' });
//       setEstablishmentDate(fetchedVendor.establishmentDate ? new Date(fetchedVendor.establishmentDate._seconds * 1000).toISOString().split('T')[0] : '');
//       setAwards(fetchedVendor.awards || ['']);
//       setExistingProfileImageUrl(fetchedVendor.profileImageUrl || '');
//       setExistingAdditionalImagesUrls(fetchedVendor.additionalImages || []);
//       setIsOpen(fetchedVendor.isOpen !== undefined ? fetchedVendor.isOpen : true); // Default to true

//       // Fetch reviews for this vendor
//       const reviews = await reviewApi.getReviewsForVendor(fetchedVendor.id);
//       setVendorReviews(reviews);

//     } catch (err) {
//       setError(err || 'Failed to fetch vendor data.');
//       console.error('Vendor Dashboard: Error fetching data:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [userProfile]); // Depends on userProfile (to get owner's UID)

//   useEffect(() => {
//     if (!loadingAuth && userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin')) {
//       fetchVendorData();
//     }
//   }, [fetchVendorData, loadingAuth, userProfile]);

//   // Update location fields from geolocation hook
//   useEffect(() => {
//     if (geoLoc.latitude !== null && geoLoc.longitude !== null) {
//       setLatitude(geoLoc.latitude);
//       setLongitude(geoLoc.longitude);
//       setMessage('Location fetched successfully! Click Save to update your profile.');
//     }
//   }, [geoLoc]);

//   // --- Form Handlers for Services and Awards ---
//   const handleAddService = () => setServices([...services, { name: '', price: '', description: '' }]);
//   const handleServiceChange = (index, field, value) => {
//     const newServices = [...services];
//     newServices[index][field] = value;
//     setServices(newServices);
//   };
//   const handleRemoveService = (index) => setServices(services.filter((_, i) => i !== index));

//   const handleAddAward = () => setAwards([...awards, '']);
//   const handleAwardChange = (index, value) => {
//     const newAwards = [...awards];
//     newAwards[index] = value;
//     setAwards(newAwards);
//   };
//   const handleRemoveAward = (index) => setAwards(awards.filter((_, i) => i !== index));

//   const handleProfileImageChange = (e) => setProfileImage(e.target.files[0]);
//   const handleAdditionalImagesChange = (e) => {
//     const files = Array.from(e.target.files).slice(0, 3);
//     setAdditionalImages(files);
//   };

//   const handleUpdateProfile = async (e) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       // Append only changed fields or required fields
//       formData.append('businessName', businessName);
//       formData.append('description', description);
//       formData.append('category', category);
//       formData.append('contactEmail', contactEmail);
//       formData.append('contactPhone', contactPhone);
//       formData.append('street', street);
//       formData.append('colony', colony);
//       formData.append('city', city);
//       formData.append('state', state);
//       formData.append('zipCode', zipCode);
//       formData.append('country', country);
//       formData.append('latitude', latitude);
//       formData.append('longitude', longitude);
//       formData.append('services', JSON.stringify(services.filter(s => s.name)));
//       formData.append('operatingHours', JSON.stringify(operatingHours));
//       formData.append('establishmentDate', establishmentDate);
//       formData.append('awards', JSON.stringify(awards.filter(a => a)));
//       formData.append('isOpen', isOpen); // Send status toggle

//       // Append image files if new ones are selected
//       if (profileImage) {
//         formData.append('profileImage', profileImage);
//       } else {
//         // If no new profile image, send existing URL to backend
//         formData.append('existingProfileImageUrl', existingProfileImageUrl);
//       }

//       if (additionalImages.length > 0) {
//         additionalImages.forEach((file) => {
//           formData.append('additionalImages', file);
//         });
//       } else {
//         // If no new additional images, send existing URLs (as JSON string)
//         formData.append('existingAdditionalImagesUrls', JSON.stringify(existingAdditionalImagesUrls));
//       }

//       const response = await vendorApi.updateVendorProfile(formData);
//       setMessage(response.message || 'Profile updated successfully!');
//       // Re-fetch data to update local state with fresh data from backend
//       fetchVendorData();

//     } catch (err) {
//       setError(err || 'Failed to update profile.');
//       console.error('Vendor Profile Update Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };


//   if (loadingAuth || (userProfile && userProfile.role !== 'vendor' && userProfile.role !== 'admin')) {
//     return (
//       <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//         <Spinner animation="border" variant="primary" />
//         <p className="ms-2 text-primary">
//           {loadingAuth ? 'Loading user session...' : 'Redirecting...'}
//         </p>
//       </Container>
//     );
//   }

//   if (error && (userProfile.role === 'vendor' || userProfile.role === 'admin')) {
//     return (
//       <Container className="mt-5 pt-5 text-center">
//         <Alert variant="danger">Error: {error}</Alert>
//         <Button onClick={fetchVendorData}>Retry Data Fetch</Button>
//       </Container>
//     );
//   }

//   if (!vendorData) { // If vendor data hasn't loaded yet or user is not a vendor
//     return (
//       <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//         <Spinner animation="border" variant="primary" />
//         <p className="ms-2 text-primary">Loading vendor data...</p>
//       </Container>
//     );
//   }

//   return (
//     <Container className="mt-5 pt-5 mb-5">
//       <h1 className="text-center mb-4 text-primary">Vendor Dashboard</h1>

//       <Nav variant="tabs" className="mb-4">
//         <Nav.Item>
//           <Nav.Link onClick={() => setActiveTab('profile')} active={activeTab === 'profile'}>
//             Business Profile
//           </Nav.Link>
//         </Nav.Item>
//         <Nav.Item>
//           <Nav.Link onClick={() => setActiveTab('reviews')} active={activeTab === 'reviews'}>
//             Customer Reviews
//           </Nav.Link>
//         </Nav.Item>
//         <Nav.Item>
//           <Nav.Link onClick={() => setActiveTab('analytics')} active={activeTab === 'analytics'}>
//             Analytics
//           </Nav.Link>
//         </Nav.Item>
//       </Nav>

//       {loading ? (
//         <div className="text-center my-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="ms-2 text-primary">Loading {activeTab} data...</p>
//         </div>
//       ) : (
//         <>
//           {activeTab === 'profile' && (
//             <Card className="shadow-sm p-4">
//               <h4 className="text-secondary mb-3">Edit Business Profile</h4>
//               {message && <Alert variant="success">{message}</Alert>}
//               {geoError && <Alert variant="warning">Geolocation Error: {geoError}</Alert>}
//               <Form onSubmit={handleUpdateProfile}>
//                 {/* Basic Info */}
//                 <Form.Group className="mb-3" controlId="businessName">
//                   <Form.Label>Business Name <span className="text-danger">*</span></Form.Label>
//                   <Form.Control type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="description">
//                   <Form.Label>Description <span className="text-danger">*</span></Form.Label>
//                   <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="category">
//                   <Form.Label>Category <span className="text-danger">*</span></Form.Label>
//                   <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} required>
//                     <option value="">Select a category</option>
//                     {categories.map(cat => (
//                       <option key={cat} value={cat}>{cat}</option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="contactEmail">
//                   <Form.Label>Contact Email <span className="text-danger">*</span></Form.Label>
//                   <Form.Control type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="contactPhone">
//                   <Form.Label>Contact Phone</Form.Label>
//                   <Form.Control type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
//                 </Form.Group>

//                 {/* Address */}
//                 <h5 className="mt-4 text-secondary">Address Information</h5>
//                 <Form.Group className="mb-3" controlId="street">
//                   <Form.Label>Street Address <span className="text-danger">*</span></Form.Label>
//                   <Form.Control type="text" value={street} onChange={(e) => setStreet(e.target.value)} required />
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="colony">
//                   <Form.Label>Colony/Neighborhood</Form.Label>
//                   <Form.Control type="text" value={colony} onChange={(e) => setColony(e.target.value)} />
//                 </Form.Group>
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3" controlId="city">
//                       <Form.Label>City <span className="text-danger">*</span></Form.Label>
//                       <Form.Control type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3" controlId="state">
//                       <Form.Label>State <span className="text-danger">*</span></Form.Label>
//                       <Form.Control type="text" value={state} onChange={(e) => setState(e.target.value)} required />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3" controlId="zipCode">
//                       <Form.Label>Zip Code <span className="text-danger">*</span></Form.Label>
//                       <Form.Control type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3" controlId="country">
//                       <Form.Label>Country <span className="text-danger">*</span></Form.Label>
//                       <Form.Control type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
//                     </Form.Group>
//                   </Col>
//                 </Row>

//                 {/* Location Coordinates */}
//                 <h5 className="mt-4 text-secondary">Location Coordinates</h5>
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3" controlId="latitude">
//                       <Form.Label>Latitude <span className="text-danger">*</span></Form.Label>
//                       <Form.Control type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3" controlId="longitude">
//                       <Form.Label>Longitude <span className="text-danger">*</span></Form.Label>
//                       <Form.Control type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Button
//                   variant="info"
//                   onClick={getPosition}
//                   disabled={geoLoading || loading}
//                   className="w-100 mb-3"
//                 >
//                   {geoLoading ? (
//                     <>
//                       <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                       <span className="ms-2">Getting Location...</span>
//                     </>
//                   ) : (
//                     'Auto-fill Location (GPS)'
//                   )}
//                 </Button>
//                 <Form.Text className="text-muted d-block mb-3">
//                   Providing accurate coordinates helps users find you easily.
//                 </Form.Text>

//                 {/* Services Offered */}
//                 <h5 className="mt-4 text-secondary">Services Offered</h5>
//                 {services.map((service, index) => (
//                   <Card key={index} className="mb-3 p-3">
//                     <Row>
//                       <Col md={4}>
//                         <Form.Group className="mb-3" controlId={`serviceName${index}`}>
//                           <Form.Label>Service Name</Form.Label>
//                           <Form.Control
//                             type="text"
//                             value={service.name}
//                             onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={3}>
//                         <Form.Group className="mb-3" controlId={`servicePrice${index}`}>
//                           <Form.Label>Price</Form.Label>
//                           <Form.Control
//                             type="number"
//                             step="0.01"
//                             value={service.price}
//                             onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={4}>
//                         <Form.Group className="mb-3" controlId={`serviceDescription${index}`}>
//                           <Form.Label>Description</Form.Label>
//                           <Form.Control
//                             type="text"
//                             value={service.description}
//                             onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={1} className="d-flex align-items-end mb-3">
//                         <Button variant="danger" onClick={() => handleRemoveService(index)} className="w-100">
//                           -
//                         </Button>
//                       </Col>
//                     </Row>
//                   </Card>
//                 ))}
//                 <Button variant="outline-primary" onClick={handleAddService} className="mb-4">
//                   Add Service
//                 </Button>

//                 {/* Operating Hours */}
//                 <h5 className="mt-4 text-secondary">Operating Hours</h5>
//                 {Object.keys(operatingHours).map(day => (
//                   <Form.Group className="mb-3" controlId={`hours${day}`} key={day}>
//                     <Form.Label className="text-capitalize">{day}</Form.Label>
//                     <Form.Control
//                       type="text"
//                       placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
//                       value={operatingHours[day]}
//                       onChange={(e) => setOperatingHours({ ...operatingHours, [day]: e.target.value })}
//                     />
//                   </Form.Group>
//                 ))}

//                 {/* Optional Details */}
//                 <h5 className="mt-4 text-secondary">Optional Details</h5>
//                 <Form.Group className="mb-3" controlId="establishmentDate">
//                   <Form.Label>Establishment Date</Form.Label>
//                   <Form.Control type="date" value={establishmentDate} onChange={(e) => setEstablishmentDate(e.target.value)} />
//                 </Form.Group>

//                 <Form.Group className="mb-3" controlId="awards">
//                   <Form.Label>Awards (e.g., "Best Cafe 2023")</Form.Label>
//                   {awards.map((award, index) => (
//                     <Row key={index} className="mb-2">
//                       <Col xs={10}>
//                         <Form.Control
//                           type="text"
//                           value={award}
//                           onChange={(e) => handleAwardChange(index, e.target.value)}
//                           placeholder="Enter award name"
//                         />
//                       </Col>
//                       <Col xs={2}>
//                         <Button variant="danger" onClick={() => handleRemoveAward(index)} className="w-100">
//                           -
//                         </Button>
//                       </Col>
//                     </Row>
//                   ))}
//                   <Button variant="outline-secondary" onClick={handleAddAward} className="mt-2">
//                     Add Award
//                   </Button>
//                 </Form.Group>

//                 {/* Image Uploads */}
//                 <h5 className="mt-4 text-secondary">Images</h5>
//                 <Form.Group className="mb-3" controlId="profileImage">
//                   <Form.Label>Business Logo / Profile Image</Form.Label>
//                   {existingProfileImageUrl && (
//                     <div className="mb-2">
//                       Current: <img src={existingProfileImageUrl} alt="Current Logo" style={{ maxWidth: '100px', maxHeight: '100px' }} className="img-thumbnail" />
//                     </div>
//                   )}
//                   <Form.Control type="file" accept="image/*" onChange={handleProfileImageChange} />
//                   <Form.Text className="text-muted">
//                     Upload a new logo to replace the current one.
//                   </Form.Text>
//                   {profileImage && <p className="mt-2">New selected: {profileImage.name}</p>}
//                 </Form.Group>

//                 <Form.Group className="mb-3" controlId="additionalImages">
//                   <Form.Label>Additional Photos (Max 3)</Form.Label>
//                   {existingAdditionalImagesUrls && existingAdditionalImagesUrls.length > 0 && (
//                     <div className="mb-2">
//                       Current:
//                       <div className="d-flex flex-wrap">
//                         {existingAdditionalImagesUrls.map((url, index) => (
//                           <img key={index} src={url} alt={`Additional ${index}`} style={{ maxWidth: '80px', maxHeight: '80px', margin: '5px' }} className="img-thumbnail" />
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   <Form.Control type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
//                   <Form.Text className="text-muted">
//                     Upload new photos. These will be added to existing ones (max 3 total).
//                   </Form.Text>
//                   {additionalImages.length > 0 && (
//                     <div className="mt-2">
//                       New selected ({additionalImages.length}):
//                       <ul>
//                         {additionalImages.map((file, index) => (
//                           <li key={index}>{file.name}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </Form.Group>

//                 {/* Open/Closed Toggle */}
//                 <h5 className="mt-4 text-secondary">Operational Status</h5>
//                 <Form.Group className="mb-3" controlId="isOpen">
//                   <Form.Check
//                     type="switch"
//                     id="custom-switch"
//                     label={isOpen ? "Business is Open" : "Business is Closed"}
//                     checked={isOpen}
//                     onChange={(e) => setIsOpen(e.target.checked)}
//                   />
//                 </Form.Group>

//                 <Button variant="primary" type="submit" className="w-100 mt-4" disabled={loading || geoLoading}>
//                   {loading ? (
//                     <>
//                       <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                       <span className="ms-2">Saving Profile...</span>
//                     </>
//                   ) : (
//                     'Save Profile'
//                   )}
//                 </Button>
//               </Form>
//             </Card>
//           )}

//           {/* Reviews Tab */}
//           {activeTab === 'reviews' && (
//             <Card className="shadow-sm p-4">
//               <h4 className="text-secondary mb-3">Your Customer Reviews ({vendorReviews.length})</h4>
//               {vendorReviews.length === 0 ? (
//                 <Alert variant="info" className="text-center">No reviews yet for your business.</Alert>
//               ) : (
//                 <div>
//                   {vendorReviews.map((review) => (
//                     <ReviewItem key={review.id} review={review} />
//                   ))}
//                 </div>
//               )}
//             </Card>
//           )}

//           {/* Analytics Tab */}
//           {activeTab === 'analytics' && (
//             <Card className="shadow-sm p-4">
//               <h4 className="text-secondary mb-3">Business Analytics</h4>
//               <ListGroup variant="flush">
//                 <ListGroup.Item>
//                   <strong>Profile Views:</strong> {vendorData.profileViews || 0}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <strong>Search Impressions:</strong> {vendorData.searchImpressions || 0}
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <strong>Average Rating:</strong> {vendorData.averageRating?.toFixed(1) || 'N/A'} ({vendorData.totalReviews || 0} reviews)
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <strong>Current Status:</strong>{' '}
//                   <Badge bg={vendorData.status === 'approved' ? 'success' : 'warning'}>
//                     {vendorData.status}
//                   </Badge>
//                 </ListGroup.Item>
//                 <ListGroup.Item>
//                   <strong>Operational Status:</strong>{' '}
//                   <Badge bg={vendorData.isOpen ? 'success' : 'danger'}>
//                     {vendorData.isOpen ? 'Open' : 'Closed'}
//                   </Badge>
//                 </ListGroup.Item>
//               </ListGroup>
//             </Card>
//           )}
//         </>
//       )}
//     </Container>
//   );
// }

// export default VendorDashboardPage;



// src/pages/VendorDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Nav, Spinner, Alert, Button, Form, ListGroup, Badge, Carousel } from 'react-bootstrap'; // Import Carousel
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../hooks/useGeolocation';
import * as vendorApi from '../services/vendorApi';
import * as reviewApi from '../services/reviewApi';
import ReviewItem from '../components/reviews/ReviewItem';
import { useToast } from '../contexts/ToastContext'; // <--- ADD THIS IMPORT
import ConfirmationModal from '../components/common/ConfirmationModal'; // <--- ADD THIS IMPORT

import '../styles/VendorDashboardPage.css'; // <--- ADD THIS IMPORT

function VendorDashboardPage() {
  const { userProfile, loadingAuth, currentUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast(); // Use useToast hook

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'reviews', 'analytics'
  const [vendorData, setVendorData] = useState(null); // Full vendor profile
  const [vendorReviews, setVendorReviews] = useState([]); // Reviews for this vendor
  const [loading, setLoading] = useState(true); // For main data fetch
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages (can be replaced by toast fully)

  // Form states for profile editing
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [street, setStreet] = useState('');
  const [colony, setColony] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [services, setServices] = useState([]);
  const [operatingHours, setOperatingHours] = useState({});
  const [establishmentDate, setEstablishmentDate] = useState('');
  const [awards, setAwards] = useState([]);
  const [profileImage, setProfileImage] = useState(null); // New file for upload
  const [additionalImages, setAdditionalImages] = useState([]); // New files for upload
  const [existingProfileImageUrl, setExistingProfileImageUrl] = useState(''); // Existing URL
  const [existingAdditionalImagesUrls, setExistingAdditionalImagesUrls] = useState([]); // Existing URLs
  const [isOpen, setIsOpen] = useState(true); // Vendor status toggle

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmVariant, setConfirmVariant] = useState('danger');


  const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

  // Categories for dropdown
  const categories = [
    'Food & Beverage', 'Retail', 'Services', 'Automotive', 'Healthcare', 'Education', 'Other'
  ];

  // Redirect if not a vendor or admin
  useEffect(() => {
    if (!loadingAuth && userProfile && userProfile.role !== 'vendor' && userProfile.role !== 'admin') {
      addToast('danger', 'Access Denied. You must be a vendor or administrator to view this page.');
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  }, [userProfile, loadingAuth, navigate, addToast]);

  // Fetch vendor's own profile and reviews
  const fetchVendorData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedVendor = await vendorApi.getVendorProfileForOwner();
      setVendorData(fetchedVendor);

      // Populate form fields for editing
      setBusinessName(fetchedVendor.businessName || '');
      setDescription(fetchedVendor.description || '');
      setCategory(fetchedVendor.category || '');
      setContactEmail(fetchedVendor.contactEmail || '');
      setContactPhone(fetchedVendor.contactPhone || '');
      setStreet(fetchedVendor.address?.street || '');
      setColony(fetchedVendor.address?.colony || '');
      setCity(fetchedVendor.address?.city || '');
      setState(fetchedVendor.address?.state || '');
      setZipCode(fetchedVendor.address?.zipCode || '');
      setCountry(fetchedVendor.address?.country || '');
      setLatitude(fetchedVendor.location?.latitude || '');
      setLongitude(fetchedVendor.location?.longitude || '');
      setServices(fetchedVendor.services && fetchedVendor.services.length > 0 ? fetchedVendor.services : [{ name: '', price: '', description: '' }]); // Ensure at least one empty service
      setOperatingHours(fetchedVendor.operatingHours || { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' });
      setEstablishmentDate(fetchedVendor.establishmentDate ? new Date(fetchedVendor.establishmentDate._seconds * 1000).toISOString().split('T')[0] : '');
      setAwards(fetchedVendor.awards && fetchedVendor.awards.length > 0 ? fetchedVendor.awards : ['']); // Ensure at least one empty award
      setExistingProfileImageUrl(fetchedVendor.profileImageUrl || '');
      setExistingAdditionalImagesUrls(fetchedVendor.additionalImages || []);
      setIsOpen(fetchedVendor.isOpen !== undefined ? fetchedVendor.isOpen : true);

      // Fetch reviews for this vendor
      const reviews = await reviewApi.getReviewsForVendor(fetchedVendor.id);
      setVendorReviews(reviews);

    } catch (err) {
      setError(err || 'Failed to fetch vendor data.');
      console.error('Vendor Dashboard: Error fetching data:', err);
      setVendorData(null); // Ensure vendorData is null on error
      setVendorReviews([]); // Clear reviews on error
    } finally {
      setLoading(false);
    }
  }, [userProfile, addToast]); // Added addToast to dependencies

  useEffect(() => {
    if (!loadingAuth && userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin')) {
      fetchVendorData();
    }
  }, [fetchVendorData, loadingAuth, userProfile]);

  // Update location fields from geolocation hook
  useEffect(() => {
    if (geoLoc.latitude !== null && geoLoc.longitude !== null) {
      setLatitude(geoLoc.latitude);
      setLongitude(geoLoc.longitude);
      addToast('info', 'Location fetched successfully! Click Save to update your profile.');
    }
  }, [geoLoc, addToast]);

  // --- Form Handlers for Services and Awards ---
  const handleAddService = () => setServices([...services, { name: '', price: '', description: '' }]);
  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };
  const handleRemoveService = (index) => setServices(services.filter((_, i) => i !== index));

  const handleAddAward = () => setAwards([...awards, '']);
  const handleAwardChange = (index, value) => {
    const newAwards = [...awards];
    newAwards[index] = value;
    setAwards(newAwards);
  };
  const handleRemoveAward = (index) => setAwards(awards.filter((_, i) => i !== index));

  const handleProfileImageChange = (e) => setProfileImage(e.target.files[0]);
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setAdditionalImages(files);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    // Clear local error/message states as toasts handle feedback
    // setError('');
    // setMessage('');
    setLoading(true);

    // Basic client-side validation
    if (!businessName.trim() || !description.trim() || !category.trim() || !contactEmail.trim() || !street.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim() || !latitude || !longitude) {
        addToast('danger', 'Please fill in all required fields (marked with *).');
        setLoading(false);
        return;
    }
    if (profileImage === null && !existingProfileImageUrl) {
        addToast('danger', 'A business logo is required.');
        setLoading(false);
        return;
    }


    try {
      const formData = new FormData();
      formData.append('businessName', businessName);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('contactEmail', contactEmail);
      formData.append('contactPhone', contactPhone);
      formData.append('street', street);
      formData.append('colony', colony);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('zipCode', zipCode);
      formData.append('country', country);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('services', JSON.stringify(services.filter(s => s.name)));
      formData.append('operatingHours', JSON.stringify(operatingHours));
      formData.append('establishmentDate', establishmentDate);
      formData.append('awards', JSON.stringify(awards.filter(a => a)));
      formData.append('isOpen', isOpen);

      if (profileImage) {
        formData.append('profileImage', profileImage);
      } else {
        formData.append('existingProfileImageUrl', existingProfileImageUrl);
      }

      if (additionalImages.length > 0) {
        additionalImages.forEach((file) => {
          formData.append('additionalImages', file);
        });
      } else {
        formData.append('existingAdditionalImagesUrls', JSON.stringify(existingAdditionalImagesUrls));
      }

      const response = await vendorApi.updateVendorProfile(formData);
      addToast('success', response.message || 'Profile updated successfully!');
      fetchVendorData(); // Re-fetch data to update local state with fresh data from backend

    } catch (err) {
      addToast('danger', err || 'Failed to update profile.');
      console.error('Vendor Profile Update Error:', err);
    } finally {
      setLoading(false);
    }
  };


  if (loadingAuth || (userProfile && userProfile.role !== 'vendor' && userProfile.role !== 'admin')) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">
          {loadingAuth ? 'Loading user session...' : 'Redirecting...'}
        </p>
      </Container>
    );
  }

  if (error && (userProfile.role === 'vendor' || userProfile.role === 'admin')) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Alert variant="danger">Error: {error}</Alert>
        <Button onClick={fetchVendorData}>Retry Data Fetch</Button>
      </Container>
    );
  }

  if (!vendorData) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Loading vendor data...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5 mb-5">
      <h1 className="text-center mb-4 text-primary">Vendor Dashboard</h1>

      <Nav variant="tabs" className="mb-4 justify-content-center">
        <Nav.Item>
          <Nav.Link onClick={() => setActiveTab('profile')} active={activeTab === 'profile'}>
            Business Profile
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => setActiveTab('reviews')} active={activeTab === 'reviews'}>
            Customer Reviews
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => setActiveTab('analytics')} active={activeTab === 'analytics'}>
            Analytics
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
          {activeTab === 'profile' && (
            <Card className="shadow-sm p-4 vendor-dashboard-card animate__animated animate__fadeIn"> {/* Added class and animation */}
              <h4 className="text-secondary mb-3">Edit Business Profile</h4>
              {geoError && (
                <Alert variant="warning">
                  <strong>Geolocation Error:</strong> {geoError}.
                  {geoError.includes('429') && " You might have hit a rate limit for location services. Please try again later."}
                </Alert>
              )}
              <Form onSubmit={handleUpdateProfile} className="p-3 border rounded shadow-sm">
                {/* Basic Info */}
                <h5 className="mb-3 text-secondary">Basic Information</h5>
                <Form.Group className="mb-3" controlId="businessName">
                  <Form.Label>Business Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="category">
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="contactEmail">
                  <Form.Label>Contact Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="contactPhone">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </Form.Group>

                {/* Address */}
                <h5 className="mt-4 text-secondary">Address Information</h5>
                <Form.Group className="mb-3" controlId="street">
                  <Form.Label>Street Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" value={street} onChange={(e) => setStreet(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="colony">
                  <Form.Label>Colony/Neighborhood</Form.Label>
                  <Form.Control type="text" value={colony} onChange={(e) => setColony(e.target.value)} />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="city">
                      <Form.Label>City <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="state">
                      <Form.Label>State <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" value={state} onChange={(e) => setState(e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="zipCode">
                      <Form.Label>Zip Code <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="country">
                      <Form.Label>Country <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Location Coordinates */}
                <h5 className="mt-4 text-secondary">Location Coordinates</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="latitude">
                      <Form.Label>Latitude <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="longitude">
                      <Form.Label>Longitude <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  variant="info"
                  onClick={getPosition}
                  disabled={geoLoading || loading}
                  className="w-100 mb-3 rounded-pill"
                >
                  {geoLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Getting Location...</span>
                    </>
                  ) : (
                    'Auto-fill Location (GPS)'
                  )}
                </Button>
                <Form.Text className="text-muted d-block mb-3">
                  Providing accurate coordinates helps users find you easily.
                </Form.Text>

                {/* Services Offered */}
                <h5 className="mt-4 text-secondary">Services Offered</h5>
                {services.map((service, index) => (
                  <Card key={index} className="mb-3 service-award-card"> {/* Added class */}
                    <Row>
                      <Col xs={12} md={4}>
                        <Form.Group className="mb-3" controlId={`serviceName${index}`}>
                          <Form.Label>Service Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={service.name}
                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={3}>
                        <Form.Group className="mb-3" controlId={`servicePrice${index}`}>
                          <Form.Label>Price</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={service.price}
                            onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Group className="mb-3" controlId={`serviceDescription${index}`}>
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            type="text"
                            value={service.description}
                            onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={1} className="d-flex align-items-end mb-3">
                        <Button variant="danger" onClick={() => handleRemoveService(index)} className="w-100">
                          -
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button variant="outline-primary" onClick={handleAddService} className="mb-4 rounded-pill">
                  Add Service
                </Button>

                {/* Operating Hours */}
                <h5 className="mt-4 text-secondary">Operating Hours</h5>
                {Object.keys(operatingHours).map(day => (
                  <Form.Group className="mb-3" controlId={`hours${day}`} key={day}>
                    <Form.Label className="text-capitalize">{day}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                      value={operatingHours[day]}
                      onChange={(e) => setOperatingHours({ ...operatingHours, [day]: e.target.value })}
                    />
                  </Form.Group>
                ))}

                {/* Optional Details */}
                <h5 className="mt-4 text-secondary">Optional Details</h5>
                <Form.Group className="mb-3" controlId="establishmentDate">
                  <Form.Label>Establishment Date</Form.Label>
                  <Form.Control type="date" value={establishmentDate} onChange={(e) => setEstablishmentDate(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="awards">
                  <Form.Label>Awards (e.g., "Best Cafe 2023")</Form.Label>
                  {awards.map((award, index) => (
                    <Row key={index} className="mb-2 service-award-card"> {/* Added class */}
                      <Col xs={10}>
                        <Form.Control
                          type="text"
                          value={award}
                          onChange={(e) => handleAwardChange(index, e.target.value)}
                          placeholder="Enter award name"
                        />
                      </Col>
                      <Col xs={2}>
                        <Button variant="danger" onClick={() => handleRemoveAward(index)} className="w-100">
                          -
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button variant="outline-secondary" onClick={handleAddAward} className="mt-2 rounded-pill">
                    Add Award
                  </Button>
                </Form.Group>

                {/* Image Uploads */}
                <h5 className="mt-4 text-secondary">Images</h5>
                <Form.Group className="mb-3" controlId="profileImage">
                  <Form.Label>Business Logo / Profile Image</Form.Label>
                  {existingProfileImageUrl && (
                    <div className="mb-2">
                      Current: <img src={existingProfileImageUrl} alt="Current Logo" style={{ maxWidth: '100px', maxHeight: '100px' }} className="img-thumbnail" />
                    </div>
                  )}
                  <Form.Control type="file" accept="image/*" onChange={handleProfileImageChange} />
                  <Form.Text className="text-muted">
                    Upload a new logo to replace the current one.
                  </Form.Text>
                  {profileImage && <p className="mt-2">New selected: {profileImage.name}</p>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="additionalImages">
                  <Form.Label>Additional Photos (Max 3)</Form.Label>
                  {existingAdditionalImagesUrls && existingAdditionalImagesUrls.length > 0 && (
                    <div className="mb-2">
                      Current:
                      <div className="d-flex flex-wrap">
                        {existingAdditionalImagesUrls.map((url, index) => (
                          <img key={index} src={url} alt={`Additional ${index}`} style={{ maxWidth: '80px', maxHeight: '80px', margin: '5px' }} className="img-thumbnail" />
                        ))}
                      </div>
                    </div>
                  )}
                  <Form.Control type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
                  <Form.Text className="text-muted">
                    Upload new photos. These will be added to existing ones (max 3 total).
                  </Form.Text>
                  {additionalImages.length > 0 && (
                    <div className="mt-2">
                      New selected ({additionalImages.length}):
                      <ul>
                        {additionalImages.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Form.Group>

                {/* Open/Closed Toggle */}
                <h5 className="mt-4 text-secondary">Operational Status</h5>
                <Form.Group className="mb-3" controlId="isOpen">
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    label={isOpen ? "Business is Open" : "Business is Closed"}
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-4 rounded-pill" disabled={loading || geoLoading}>
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
            </Card>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <Card className="shadow-sm p-4 vendor-dashboard-card animate__animated animate__fadeIn"> {/* Added class and animation */}
              <h4 className="text-secondary mb-3">Your Customer Reviews ({vendorReviews.length})</h4>
              {vendorReviews.length === 0 ? (
                <Alert variant="info" className="text-center">No reviews yet for your business.</Alert>
              ) : (
                <div className="row g-3"> {/* Use Bootstrap grid for review items */}
                  {vendorReviews.map((review) => (
                    <Col xs={12} md={6} key={review.id}> {/* Responsive columns */}
                      <ReviewItem review={review} /> {/* Reuse ReviewItem */}
                    </Col>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <Card className="shadow-sm p-4 vendor-dashboard-card animate__animated animate__fadeIn"> {/* Added class and animation */}
              <h4 className="text-secondary mb-3">Business Analytics</h4>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Profile Views:</strong> {vendorData.profileViews || 0}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Search Impressions:</strong> {vendorData.searchImpressions || 0}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Average Rating:</strong> {vendorData.averageRating?.toFixed(1) || 'N/A'} ({vendorData.totalReviews || 0} reviews)
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Current Status:</strong>{' '}
                  <Badge bg={vendorData.status === 'approved' ? 'success' : 'warning'}>
                    {vendorData.status}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Operational Status:</strong>{' '}
                  <Badge bg={vendorData.isOpen ? 'success' : 'danger'}>
                    {vendorData.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          )}
        </>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmModal}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={confirmAction}
        onCancel={() => setShowConfirmModal(false)}
        confirmVariant={confirmVariant}
      />
    </Container>
  );
}

export default VendorDashboardPage;