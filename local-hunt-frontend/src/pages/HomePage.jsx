// // src/pages/HomePage.jsx
// import React, { useState } from 'react';
// import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // To check user role for CTA

// function HomePage() {
//   const navigate = useNavigate();
//   const { userProfile } = useAuth();
//   const [searchTerm, setSearchTerm] = useState('');

//   // Example categories (can be dynamic later)
//   const categories = [
//     { name: 'Restaurants', icon: '🍽️', query: 'Food & Beverage' },
//     { name: 'Salons', icon: '💇‍♀️', query: 'Services' },
//     { name: 'Repair', icon: '🔧', query: 'Services' },
//     { name: 'Doctors', icon: '🩺', query: 'Healthcare' },
//     { name: 'Retail Stores', icon: '🛍️', query: 'Retail' },
//     { name: 'Education', icon: '📚', query: 'Education' },
//     { name: 'Automotive', icon: '🚗', query: 'Automotive' },
//     { name: 'Other Services', icon: '💡', query: 'Other' },
//   ];

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       // Navigate to vendor discovery page with search term
//       navigate(`/vendors?search=${encodeURIComponent(searchTerm.trim())}`);
//     } else {
//       navigate('/vendors'); // Navigate to general vendor list
//     }
//   };

//   const handleCategoryClick = (categoryQuery) => {
//     // Navigate to vendor discovery page with category pre-selected
//     navigate(`/vendors?category=${encodeURIComponent(categoryQuery)}`);
//   };

//   return (
//     <div className="homepage-container"> {/* Custom class for background */}
//       {/* Hero Section */}
//       <Container className="hero-section text-center text-white d-flex flex-column justify-content-center align-items-center">
//         <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown">Local Hunt</h1>
//         <p className="lead mb-4 animate__animated animate__fadeInUp animate__delay-1s">Discover local businesses and services near you!</p>

//         <Form onSubmit={handleSearchSubmit} className="w-75 animate__animated animate__zoomIn animate__delay-2s">
//           <InputGroup size="lg" className="shadow-lg rounded-pill overflow-hidden">
//             <Form.Control
//               type="text"
//               placeholder="Search for businesses, services, or products..."
//               className="border-0 ps-4 rounded-pill"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{ paddingRight: '3rem' }} // Space for button inside input group
//             />
//             <Button variant="primary" type="submit" className="px-4 rounded-pill-end">
//               <i className="bi bi-search"></i> Search {/* Using Bootstrap Icons */}
//             </Button>
//           </InputGroup>
//         </Form>
//       </Container>

//       {/* Popular Categories Section */}
//       <Container className="categories-section py-5">
//         <h2 className="text-center mb-5 text-primary animate__animated animate__fadeInUp">Popular Categories</h2>
//         <Row xs={2} md={3} lg={4} className="g-4 justify-content-center">
//           {categories.map((cat, index) => (
//             <Col key={index}>
//               <Card
//                 className="category-card text-center h-100 shadow-sm animate__animated animate__zoomIn"
//                 style={{ animationDelay: `${0.1 * index}s`, cursor: 'pointer' }}
//                 onClick={() => handleCategoryClick(cat.query)}
//               >
//                 <Card.Body className="d-flex flex-column justify-content-center align-items-center p-3">
//                   <span className="category-icon mb-3" style={{ fontSize: '3rem' }}>{cat.icon}</span>
//                   <Card.Title className="mb-0">{cat.name}</Card.Title>
//                 </Card.Body>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       </Container>

//       {/* Call to Action for Vendors */}
//       <Container className="vendor-cta-section py-5 text-center bg-light rounded shadow-sm mb-5 animate__animated animate__fadeInUp">
//         <h2 className="mb-3 text-secondary">Are you a Local Business?</h2>
//         <p className="lead mb-4 text-muted">Join Local Hunt and connect with customers in your neighborhood!</p>
//         {userProfile?.role === 'user' ? (
//           <Button variant="success" size="lg" onClick={() => navigate('/register-vendor')} className="animate__animated animate__pulse animate__infinite">
//             Register Your Business Today!
//           </Button>
//         ) : (
//           <Button variant="success" size="lg" onClick={() => navigate('/dashboard')} className="animate__animated animate__pulse animate__infinite">
//             Go to Dashboard
//           </Button>
//         )}
//       </Container>

//       {/* Custom CSS for animations and styling */}
//       <style>{`
//         @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
//         @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

//         .homepage-container {
//           background: linear-gradient(to bottom right, #007bff, #0056b3); /* Blue gradient */
//           min-height: 100vh;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           align-items: center;
//           padding-top: 56px; /* Adjust for fixed navbar */
//         }

//         .hero-section {
//           min-height: 60vh;
//           padding-top: 2rem;
//           padding-bottom: 2rem;
//         }

//         .hero-section h1 {
//           font-size: 4.5rem;
//           text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
//         }

//         .hero-section .lead {
//           font-size: 1.5rem;
//         }

//         .rounded-pill-end {
//           border-top-left-radius: 0 !important;
//           border-bottom-left-radius: 0 !important;
//           border-top-right-radius: 2rem !important;
//           border-bottom-right-radius: 2rem !important;
//         }

//         .category-card {
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//           border-radius: 1rem;
//           min-height: 180px;
//         }

//         .category-card:hover {
//           transform: translateY(-10px) scale(1.03);
//           box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
//         }

//         .category-icon {
//           filter: grayscale(100%); /* Make icons grayscale by default */
//           transition: filter 0.3s ease;
//         }

//         .category-card:hover .category-icon {
//           filter: grayscale(0%); /* Color on hover */
//         }

//         .vendor-cta-section {
//           border-radius: 1.5rem;
//           padding: 3rem;
//           margin-top: 3rem;
//           margin-bottom: 3rem;
//           background-color: #f8f9fa !important;
//         }

//         /* Adjustments for smaller screens */
//         @media (max-width: 768px) {
//           .hero-section h1 {
//             font-size: 3rem;
//           }
//           .hero-section .lead {
//             font-size: 1.2rem;
//           }
//           .hero-section .w-75 {
//             width: 90% !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default HomePage;

// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Container, Row, Col, Form, Button, Card, InputGroup, Carousel, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as reviewApi from '../services/reviewApi';
import * as vendorApi from '../services/vendorApi'; // Import vendorApi
import VendorCard from '../components/vendors/VendorCard'; // Import VendorCard

import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // New state for category filter
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  // States for integrated vendor search results
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false); // Initially false, only loads on search
  const [vendorsError, setVendorsError] = useState('');
  const [showResults, setShowResults] = useState(false); // To conditionally show results section

  const categories = [
    { name: 'Restaurants', icon: '🍽️', query: 'Food & Beverage' },
    { name: 'Salons', icon: '💇‍♀️', query: 'Services' },
    { name: 'Repair', icon: '🔧', query: 'Services' },
    { name: 'Doctors', icon: '🩺', query: 'Healthcare' },
    { name: 'Retail Stores', icon: '🛍️', query: 'Retail' },
    { name: 'Education', icon: '📚', query: 'Education' },
    { name: 'Automotive', icon: '🚗', query: 'Automotive' },
    { name: 'Other Services', icon: '💡', query: 'Other' },
  ];

  // Fetch featured reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      setReviewsError('');
      try {
        const allReviews = await reviewApi.getAllReviews(); // Use getAllReviews from reviewApi
        const recentReviews = allReviews.slice(0, 6); // Take up to 6 recent reviews
        setFeaturedReviews(recentReviews);
      } catch (err) {
        setReviewsError(err || 'Failed to load featured reviews.');
        console.error('Error fetching featured reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  // Fetch vendors based on search/category (useCallback for stability)
  const fetchVendors = useCallback(async (search, category) => {
    setLoadingVendors(true);
    setVendorsError('');
    setShowResults(true); // Always show results section when a search is initiated
    try {
      const params = {
        search: search,
        category: category,
        isOpen: true, // Only show open vendors on homepage search
        sortBy: 'averageRating', // Default sort for homepage results
        sortOrder: 'desc',
      };
      const fetchedVendors = await vendorApi.getAllVendors(params);
      setVendors(fetchedVendors);
    } catch (err) {
      setVendorsError(err || 'Failed to fetch vendors.');
      console.error('Error fetching vendors for homepage:', err);
    } finally {
      setLoadingVendors(false);
    }
  }, []); // No dependencies here, as params are passed directly

  // Effect to trigger vendor fetch when search/category states change
  useEffect(() => {
    // Only trigger fetch if search term or category is set, or if results were previously shown
    if (searchTerm.trim() || selectedCategory.trim() || showResults) {
      fetchVendors(searchTerm, selectedCategory);
    } else {
      setVendors([]); // Clear vendors if no search/category and no results shown
      setShowResults(false); // Hide results section
    }
  }, [searchTerm, selectedCategory, fetchVendors, showResults]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedCategory(''); // Clear category filter when using search bar
    fetchVendors(searchTerm, ''); // Trigger fetch with current search term
  };

  const handleCategoryClick = (categoryQuery) => {
    setSearchTerm(''); // Clear search term when using category filter
    setSelectedCategory(categoryQuery); // Set category filter
    fetchVendors('', categoryQuery); // Trigger fetch with selected category
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="review-stars" style={{ color: i <= rating ? '#ffc107' : '#e4e5e9' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <Container fluid className="hero-section text-white d-flex flex-column justify-content-center align-items-center">
        <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown">Local Hunt</h1>
        <p className="lead mb-4 animate__animated animate__fadeInUp animate__delay-1s">Discover local businesses and services near you!</p>

        <Form onSubmit={handleSearchSubmit} className="w-75 animate__animated animate__zoomIn animate__delay-2s">
          <InputGroup size="lg" className="shadow-lg rounded-pill overflow-hidden">
            <Form.Control
              type="text"
              placeholder="Search for businesses, services, or products..."
              className="border-0 ps-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="primary" type="submit" className="px-4">
              <i className="bi bi-search"></i> <span className="d-none d-md-inline">Search</span>
            </Button>
          </InputGroup>
        </Form>
      </Container>

      {/* Popular Categories Section */}
      <Container fluid className="categories-section">
        <h2 className="text-center mb-5 text-primary animate__animated animate__fadeInUp">Popular Categories</h2>
        <Row xs={2} sm={3} md={4} lg={6} xl={8} className="g-4 justify-content-center">
          {categories.map((cat, index) => (
            <Col key={index}>
              <Card
                className="category-card text-center h-100 shadow-sm animate__animated animate__zoomIn"
                style={{ animationDelay: `${0.1 * index}s` }}
                onClick={() => handleCategoryClick(cat.query)}
              >
                <Card.Body className="d-flex flex-column justify-content-center align-items-center p-3">
                  <span className="category-icon mb-3">{cat.icon}</span>
                  <Card.Title className="mb-0 fw-bold">{cat.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Integrated Vendor Search Results Section */}
      {showResults && (
        <Container fluid className="vendor-results-section py-5 animate__animated animate__fadeIn"> {/* Added class and animation */}
          <h2 className="text-center mb-5 text-primary">Search Results</h2>
          {loadingVendors ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="ms-2 text-primary">Loading vendors...</p>
            </div>
          ) : vendorsError ? (
            <Alert variant="danger" className="my-4">{vendorsError}</Alert>
          ) : vendors.length === 0 ? (
            <Alert variant="info" className="text-center my-4">
              No vendors found matching your criteria. Try adjusting your search or filters.
            </Alert>
          ) : (
            <>
              <Row xs={1} md={2} lg={3} className="g-4">
                {vendors.map((vendor) => (
                  <Col key={vendor.id}>
                    <VendorCard vendor={vendor} />
                  </Col>
                ))}
              </Row>
              <div className="text-center mt-5">
                <Button variant="outline-primary" size="lg" onClick={() => navigate('/vendors')} className="rounded-pill px-4">
                  View All Vendors & More Filters
                </Button>
              </div>
            </>
          )}
        </Container>
      )}


      {/* Featured Reviews Section */}
      <Container fluid className="featured-reviews-section">
        <h2 className="text-center mb-5 animate__animated animate__fadeInUp">What Our Users Say</h2>
        {loadingReviews ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="ms-2 text-primary">Loading reviews...</p>
          </div>
        ) : reviewsError ? (
          <Alert variant="danger" className="text-center">{reviewsError}</Alert>
        ) : featuredReviews.length === 0 ? (
          <Alert variant="info" className="text-center">No reviews to display yet.</Alert>
        ) : (
          <Carousel indicators={false} controls={true} interval={5000} className="review-carousel animate__animated animate__fadeIn">
            {featuredReviews.map((review, index) => (
              <Carousel.Item key={review.id || index}>
                <Row className="justify-content-center">
                  <Col xs={12} md={8} lg={6}>
                    <Card className="review-card mx-auto text-center">
                      <Card.Body>
                        <div className="mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <Card.Text className="review-comment">"{review.comment}"</Card.Text>
                        <Card.Title className="mt-3 mb-1">{review.reviewerName || 'Anonymous User'}</Card.Title>
                        <Card.Subtitle className="text-muted">{review.vendorName || 'Unknown Business'}</Card.Subtitle>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Container>

      {/* Call to Action for Vendors */}
      <Container fluid className="vendor-cta-section rounded animate__animated animate__fadeInUp">
        <h2 className="mb-3">Are you a Local Business?</h2>
        <p className="lead mb-4">Join Local Hunt and connect with customers in your neighborhood!</p>
        {userProfile?.role === 'user' ? (
          <Button variant="light" size="lg" onClick={() => navigate('/register-vendor')} className="animate__animated animate__pulse animate__infinite">
            Register Your Business Today!
          </Button>
        ) : (
          <Button variant="light" size="lg" onClick={() => navigate('/dashboard')} className="animate__animated animate__pulse animate__infinite">
            Go to Dashboard
          </Button>
        )}
      </Container>
    </div>
  );
}

export default HomePage;