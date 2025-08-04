// src/pages/VendorRegistrationPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // For redirection
import { useAuth } from '../contexts/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import * as vendorApi from '../services/vendorApi'; // New API service for vendors

function VendorRegistrationPage() {
  const { userProfile, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // Could be a dropdown
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
  const [displayAddress, setDisplayAddress] = useState(''); // For user-friendly display/manual input
  const [services, setServices] = useState([{ name: '', price: '', description: '' }]);
  const [operatingHours, setOperatingHours] = useState({
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
  });
  const [establishmentDate, setEstablishmentDate] = useState('');
  const [awards, setAwards] = useState(['']); // Array of strings
  const [profileImage, setProfileImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]); // Array of files

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { location: geoLoc, error: geoError, loading: geoLoading, getPosition } = useGeolocation();

  // Redirect if user is already a vendor or admin
  useEffect(() => {
    if (!loadingAuth && userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin')) {
      setMessage('You are already registered as a vendor or admin. Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000); // Redirect after a delay
    }
  }, [userProfile, loadingAuth, navigate]);

  // Update location fields from geolocation hook
  useEffect(() => {
    if (geoLoc.latitude !== null && geoLoc.longitude !== null) {
      setLatitude(geoLoc.latitude);
      setLongitude(geoLoc.longitude);
      setMessage('Location fetched successfully! Review and submit.');
    }
  }, [geoLoc]);

  const handleAddService = () => {
    setServices([...services, { name: '', price: '', description: '' }]);
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const handleRemoveService = (index) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleAddAward = () => {
    setAwards([...awards, '']);
  };

  const handleAwardChange = (index, value) => {
    const newAwards = [...awards];
    newAwards[index] = value;
    setAwards(newAwards);
  };

  const handleRemoveAward = (index) => {
    const newAwards = awards.filter((_, i) => i !== index);
    setAwards(newAwards);
  };

  const handleProfileImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleAdditionalImagesChange = (e) => {
    // Limit to max 3 additional images
    const files = Array.from(e.target.files).slice(0, 3);
    setAdditionalImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!profileImage) {
      setError('A profile image (logo) is required.');
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
      formData.append('services', JSON.stringify(services.filter(s => s.name))); // Filter empty services
      formData.append('operatingHours', JSON.stringify(operatingHours));
      formData.append('establishmentDate', establishmentDate);
      formData.append('awards', JSON.stringify(awards.filter(a => a))); // Filter empty awards

      // Append files
      formData.append('profileImage', profileImage);
      additionalImages.forEach((file) => {
        formData.append('additionalImages', file);
      });

      const response = await vendorApi.registerVendor(formData);
      setMessage(response.message || 'Vendor registered successfully!');
      // Optionally, redirect to vendor dashboard or show success page
      navigate('/dashboard'); // Redirect to dashboard after successful registration
    } catch (err) {
      setError(err);
      console.error('Vendor registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth || (userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin'))) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">
          {userProfile && (userProfile.role === 'vendor' || userProfile.role === 'admin')
            ? 'Redirecting...'
            : 'Loading user data...'}
        </p>
      </Container>
    );
  }

  // Ensure only 'user' role can see this form
  if (!userProfile || userProfile.role !== 'user') {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">You must be a regular user to register as a vendor.</Alert>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={10} lg={9}>
          <Card className="shadow-lg p-4">
            <Card.Body>
              <h2 className="text-center mb-4 text-primary">Register Your Business</h2>

              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              {geoError && <Alert variant="warning">Geolocation Error: {geoError}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Business Details */}
                <h4 className="mb-3 text-secondary">Business Information</h4>
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
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Retail">Retail</option>
                    <option value="Services">Services</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
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

                {/* Address Details */}
                <h4 className="mb-3 mt-4 text-secondary">Address Information</h4>
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
                <h4 className="mb-3 mt-4 text-secondary">Location Coordinates</h4>
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
                  className="w-100 mb-3"
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
                <h4 className="mb-3 mt-4 text-secondary">Services Offered</h4>
                {services.map((service, index) => (
                  <Card key={index} className="mb-3 p-3">
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3" controlId={`serviceName${index}`}>
                          <Form.Label>Service Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={service.name}
                            onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
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
                      <Col md={4}>
                        <Form.Group className="mb-3" controlId={`serviceDescription${index}`}>
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            type="text"
                            value={service.description}
                            onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={1} className="d-flex align-items-end mb-3">
                        <Button variant="danger" onClick={() => handleRemoveService(index)} className="w-100">
                          -
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button variant="outline-primary" onClick={handleAddService} className="mb-4">
                  Add Service
                </Button>

                {/* Operating Hours */}
                <h4 className="mb-3 mt-4 text-secondary">Operating Hours</h4>
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
                <h4 className="mb-3 mt-4 text-secondary">Optional Details</h4>
                <Form.Group className="mb-3" controlId="establishmentDate">
                  <Form.Label>Establishment Date</Form.Label>
                  <Form.Control type="date" value={establishmentDate} onChange={(e) => setEstablishmentDate(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="awards">
                  <Form.Label>Awards (e.g., "Best Cafe 2023")</Form.Label>
                  {awards.map((award, index) => (
                    <Row key={index} className="mb-2">
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
                  <Button variant="outline-secondary" onClick={handleAddAward} className="mt-2">
                    Add Award
                  </Button>
                </Form.Group>

                {/* Image Uploads */}
                <h4 className="mb-3 mt-4 text-secondary">Images</h4>
                <Form.Group className="mb-3" controlId="profileImage">
                  <Form.Label>Business Logo / Profile Image <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleProfileImageChange} required />
                  <Form.Text className="text-muted">
                    Upload your primary business logo. (Max 1 file)
                  </Form.Text>
                  {profileImage && <p className="mt-2">Selected: {profileImage.name}</p>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="additionalImages">
                  <Form.Label>Additional Photos</Form.Label>
                  <Form.Control type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
                  <Form.Text className="text-muted">
                    Upload up to 3 additional photos (e.g., menu, store interior).
                  </Form.Text>
                  {additionalImages.length > 0 && (
                    <div className="mt-2">
                      Selected ({additionalImages.length}):
                      <ul>
                        {additionalImages.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 mt-4" disabled={loading || geoLoading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Registering Business...</span>
                    </>
                  ) : (
                    'Register Business'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default VendorRegistrationPage;