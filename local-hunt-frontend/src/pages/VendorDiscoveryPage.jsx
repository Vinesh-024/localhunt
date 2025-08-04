// src/pages/VendorDiscoveryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, InputGroup, Card } from 'react-bootstrap';
import VendorCard from '../components/vendors/VendorCard';
import MapDisplay from '../components/maps/MapDisplay';
import * as vendorApi from '../services/vendorApi';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import '../styles/VendorDiscoveryPage.css'; // <--- ADD THIS IMPORT

function VendorDiscoveryPage() {
  const { userProfile, loadingAuth } = useAuth();
  const location = useLocation();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColony, setSelectedColony] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [showMapView, setShowMapView] = useState(false);

  // Categories for dropdown (can be fetched from backend later)
  const categories = [
    'Food & Beverage', 'Retail', 'Services', 'Automotive', 'Healthcare', 'Education', 'Other'
  ];

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: searchTerm,
        category: selectedCategory,
        colony: selectedColony,
        isOpen: showOpenOnly ? true : undefined,
        sortBy,
        sortOrder,
      };

      const fetchedVendors = await vendorApi.getAllVendors(params);
      setVendors(fetchedVendors);
    } catch (err) {
      setError(err || 'Failed to fetch vendors.');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedColony, showOpenOnly, sortBy, sortOrder]);

  useEffect(() => {
    if (!loadingAuth) {
      fetchVendors();
    }
  }, [fetchVendors, loadingAuth]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedColony('');
    setShowOpenOnly(false);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const handleGeocoderResult = ({ latitude, longitude, address }) => {
    console.log('Geocoder Result:', { latitude, longitude, address });
    setSearchTerm(address);
  };

  if (loadingAuth) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <p className="ms-2 text-primary">Loading user session...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-5 mb-5 animate__animated animate__fadeIn"> {/* Added animation */}
      <h1 className="text-center mb-4 text-primary display-5 fw-bold">Discover Local Vendors</h1>

      {/* Search and Filter Section */}
      <Card className="shadow-sm p-4 mb-4 vendor-search-card"> {/* Added class */}
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-3 align-items-end"> {/* Use g-3 for consistent gutter, align-items-end for button alignment */}
            <Col xs={12} md={8}> {/* Full width on small, 8 cols on medium+ */}
              <Form.Label className="visually-hidden">Search</Form.Label> {/* Hidden label for accessibility */}
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by business name, description, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-start-pill" // Rounded left side
                />
                <Button variant="primary" type="submit" className="rounded-end-pill px-4"> {/* Rounded right side */}
                  <i className="bi bi-search"></i> <span className="d-none d-md-inline">Search</span> {/* Hide text on small */}
                </Button>
              </InputGroup>
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="visually-hidden">Category</Form.Label>
              <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-pill"> {/* Rounded select */}
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Row className="g-3 mt-3"> {/* Margin top for separation */}
            <Col xs={12} md={4}>
              <Form.Label className="visually-hidden">Colony</Form.Label>
              <Form.Control
                type="text"
                placeholder="Filter by Colony/Neighborhood"
                value={selectedColony}
                onChange={(e) => setSelectedColony(e.target.value)}
                className="rounded-pill"
              />
            </Col>
            <Col xs={6} md={3}> {/* Half width on small, 3 cols on medium+ */}
              <Form.Check
                type="checkbox"
                label="Show Open Only"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
                className="mt-2"
              />
            </Col>
            <Col xs={6} md={3}> {/* Half width on small, 3 cols on medium+ */}
              <Form.Label className="visually-hidden">Sort By</Form.Label>
              <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-pill">
                <option value="createdAt">Newest</option>
                <option value="averageRating">Rating</option>
                <option value="businessName">Name (A-Z)</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={2} className="d-flex align-items-end"> {/* Align to bottom, full width on small */}
              <Form.Label className="visually-hidden">Sort Order</Form.Label>
              <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="rounded-pill w-100">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Form.Select>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col className="text-end">
              <Button variant="outline-secondary" onClick={handleClearFilters} className="rounded-pill px-4">Clear Filters</Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Map/List View Toggle */}
      <div className="text-center mb-4 animate__animated animate__fadeInUp"> {/* Added animation */}
        <Button variant={showMapView ? 'primary' : 'outline-primary'} onClick={() => setShowMapView(true)} className="me-2 rounded-pill px-4">
          Map View
        </Button>
        <Button variant={!showMapView ? 'primary' : 'outline-primary'} onClick={() => setShowMapView(false)} className="rounded-pill px-4">
          List View
        </Button>
      </div>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="ms-2 text-primary">Loading vendors...</p>
        </div>
      )}

      {error && <Alert variant="danger" className="my-4">{error}</Alert>}

      {!loading && vendors.length === 0 && !error && (
        <Alert variant="info" className="text-center my-4">
          No vendors found matching your criteria. Try adjusting your search or filters.
        </Alert>
      )}

      {/* Conditional rendering for Map View or List View */}
      {!loading && !error && (
        showMapView ? (
          <div className="map-view-container animate__animated animate__fadeIn"> {/* Added class and animation */}
            <MapDisplay
              center={userProfile?.location ? [userProfile.location.longitude, userProfile.location.latitude] : [78.486671, 17.385044]}
              zoom={userProfile?.location ? 12 : 10}
              vendors={vendors}
              showGeocoder={true}
              onGeocoderResult={handleGeocoderResult}
              isInteractive={true}
            />
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4 animate__animated animate__fadeIn"> {/* Added animation */}
            {vendors.map((vendor) => (
              <Col key={vendor.id}>
                <VendorCard vendor={vendor} />
              </Col>
            ))}
          </Row>
        )
      )}
    </Container>
  );
}

export default VendorDiscoveryPage;

// // src/pages/VendorDiscoveryPage.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { Container, Row, Col, Form, Button, Spinner, Alert, InputGroup, Card } from 'react-bootstrap';
// import VendorCard from '../components/vendors/VendorCard';
// import MapDisplay from '../components/maps/MapDisplay';
// import * as vendorApi from '../services/vendorApi';
// import { useAuth } from '../contexts/AuthContext';
// import { useLocation } from 'react-router-dom';
// import '../styles/VendorDiscoveryPage.css';
// // Removed useGeolocation import as it's not directly used here anymore for map interaction

// function VendorDiscoveryPage() {
//   const { userProfile, loadingAuth } = useAuth();
//   const location = useLocation();

//   const [vendors, setVendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedColony, setSelectedColony] = useState('');
//   const [showOpenOnly, setShowOpenOnly] = useState(false);
//   const [sortBy, setSortBy] = useState('createdAt');
//   const [sortOrder, setSortOrder] = useState('desc');

//   const [showMapView, setShowMapView] = useState(false);

//   // Removed useGeolocation hook and related states/functions from here

//   const categories = [
//     'Food & Beverage', 'Retail', 'Services', 'Automotive', 'Healthcare', 'Education', 'Other'
//   ];

//   const fetchVendors = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const params = {
//         search: searchTerm,
//         category: selectedCategory,
//         colony: selectedColony,
//         isOpen: showOpenOnly ? true : undefined,
//         sortBy,
//         sortOrder,
//       };

//       const fetchedVendors = await vendorApi.getAllVendors(params);
//       setVendors(fetchedVendors);
//     } catch (err) {
//       setError(err || 'Failed to fetch vendors.');
//       console.error('Error fetching vendors:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [searchTerm, selectedCategory, selectedColony, showOpenOnly, sortBy, sortOrder]);

//   useEffect(() => {
//     if (!loadingAuth) {
//       fetchVendors();
//     }
//   }, [fetchVendors, loadingAuth]);

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     fetchVendors();
//   };

//   const handleClearFilters = () => {
//     setSearchTerm('');
//     setSelectedCategory('');
//     setSelectedColony('');
//     setShowOpenOnly(false);
//     setSortBy('createdAt');
//     setSortOrder('desc');
//   };

//   // Removed handleGeocoderResult as Geocoder is removed from MapDisplay
//   // const handleGeocoderResult = useCallback(({ latitude, longitude, address }) => {
//   //   console.log('Geocoder Result (Discovery Page):', { latitude, longitude, address, userGeoLoc });
//   //   setSearchTerm(address);
//   // }, [userGeoLoc]);


//   if (loadingAuth) {
//     return (
//       <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
//         <Spinner animation="border" variant="primary" />
//         <p className="ms-2 text-primary">Loading user session...</p>
//       </Container>
//     );
//   }

//   return (
//     <Container className="mt-5 pt-5 mb-5 animate__animated animate__fadeIn">
//       <h1 className="text-center mb-4 text-primary display-5 fw-bold">Discover Local Vendors</h1>

//       {/* Search and Filter Section */}
//       <Card className="shadow-sm p-4 mb-4 vendor-search-card">
//         <Form onSubmit={handleSearchSubmit}>
//           <Row className="g-3 align-items-end">
//             <Col xs={12} md={8}>
//               <Form.Label className="visually-hidden">Search</Form.Label>
//               <InputGroup>
//                 <Form.Control
//                   type="text"
//                   placeholder="Search by business name, description, or service..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="rounded-start-pill"
//                 />
//                 <Button variant="primary" type="submit" className="rounded-end-pill px-4">
//                   <i className="bi bi-search"></i> <span className="d-none d-md-inline">Search</span>
//                 </Button>
//               </InputGroup>
//             </Col>
//             <Col xs={12} md={4}>
//               <Form.Label className="visually-hidden">Category</Form.Label>
//               <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-pill">
//                 <option value="">All Categories</option>
//                 {categories.map(cat => (
//                   <option key={cat} value={cat}>{cat}</option>
//                 ))}
//               </Form.Select>
//             </Col>
//           </Row>
//           <Row className="g-3 mt-3">
//             <Col xs={12} md={4}>
//               <Form.Label className="visually-hidden">Colony</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Filter by Colony/Neighborhood"
//                 value={selectedColony}
//                 onChange={(e) => setSelectedColony(e.target.value)}
//                 className="rounded-pill"
//               />
//             </Col>
//             <Col xs={6} md={3}>
//               <Form.Check
//                 type="checkbox"
//                 label="Show Open Only"
//                 checked={showOpenOnly}
//                 onChange={(e) => setShowOpenOnly(e.target.checked)}
//                 className="mt-2"
//               />
//             </Col>
//             <Col xs={6} md={3}>
//               <Form.Label className="visually-hidden">Sort By</Form.Label>
//               <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-pill">
//                 <option value="createdAt">Newest</option>
//                 <option value="averageRating">Rating</option>
//                 <option value="businessName">Name (A-Z)</option>
//               </Form.Select>
//             </Col>
//             <Col xs={12} md={2} className="d-flex align-items-end">
//               <Form.Label className="visually-hidden">Sort Order</Form.Label>
//               <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="rounded-pill w-100">
//                 <option value="desc">Descending</option>
//                 <option value="asc">Ascending</option>
//               </Form.Select>
//             </Col>
//           </Row>
//           <Row className="mt-3">
//             <Col className="text-end">
//               <Button variant="outline-secondary" onClick={handleClearFilters} className="rounded-pill px-4">Clear Filters</Button>
//             </Col>
//           </Row>
//         </Form>
//       </Card>

//       {/* Map/List View Toggle */}
//       <div className="text-center mb-4 animate__animated animate__fadeInUp">
//         <Button variant={showMapView ? 'primary' : 'outline-primary'} onClick={() => setShowMapView(true)} className="me-2 rounded-pill px-4">
//           Map View
//         </Button>
//         <Button variant={!showMapView ? 'primary' : 'outline-primary'} onClick={() => setShowMapView(false)} className="rounded-pill px-4">
//           List View
//         </Button>
//       </div>

//       {loading && (
//         <div className="text-center my-5">
//           <Spinner animation="border" variant="primary" />
//           <p className="ms-2 text-primary">Loading vendors...</p>
//         </div>
//       )}

//       {error && <Alert variant="danger" className="my-4">{error}</Alert>}

//       {!loading && vendors.length === 0 && !error && (
//         <Alert variant="info" className="text-center my-4">
//           No vendors found matching your criteria. Try adjusting your search or filters.
//         </Alert>
//       )}

//       {/* Conditional rendering for Map View or List View */}
//       {!loading && !error && (
//         showMapView ? (
//           <div className="map-view-container animate__animated animate__fadeIn">
//             <MapDisplay
//               center={userProfile?.location ? [userProfile.location.longitude, userProfile.location.latitude] : [78.486671, 17.486671]} // Default Hyderabad
//               zoom={userProfile?.location ? 12 : 10}
//               markers={vendors.filter(v => v.location?.longitude && v.location?.latitude).map(v => ({
//                 id: v.id,
//                 lng: v.location.longitude,
//                 lat: v.location.latitude,
//                 businessName: v.businessName,
//                 description: v.description,
//                 profileImageUrl: v.profileImageUrl,
//                 averageRating: v.averageRating,
//                 totalReviews: v.totalReviews,
//                 distanceKm: null
//               }))}
//               showGeocoder={false} // Geocoder is removed from MapDisplay
//               isInteractive={true}
//               // showDirectionsControls is false for general discovery map
//             />
//           </div>
//         ) : (
//           <Row xs={1} md={2} lg={3} className="g-4 animate__animated animate__fadeIn">
//             {vendors.map((vendor) => (
//               <Col key={vendor.id}>
//                 <VendorCard vendor={vendor} />
//               </Col>
//             ))}
//           </Row>
//         )
//       )}
//     </Container>
//   );
// }

// export default VendorDiscoveryPage;