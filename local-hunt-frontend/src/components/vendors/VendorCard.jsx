// src/components/vendors/VendorCard.jsx
import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function VendorCard({ vendor }) {
  const {
    id,
    businessName,
    description,
    category,
    profileImageUrl,
    averageRating,
    totalReviews,
    isOpen,
    location,
  } = vendor;

  const imageUrl = profileImageUrl || 'https://placehold.co/400x200/cccccc/333333?text=No+Image';

  return (
    <Card className="h-100 shadow-sm vendor-card-item animate__animated animate__fadeInUp"> {/* Added class and animation */}
      <Card.Img
        variant="top"
        src={imageUrl}
        alt={`${businessName} logo`}
        style={{ height: '180px', objectFit: 'cover', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }} /* More rounded */
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/cccccc/333333?text=Image+Error'; }}
      />
      <Card.Body className="d-flex flex-column p-3"> {/* Adjusted padding */}
        <Card.Title className="mb-1 text-primary fw-bold fs-5">{businessName}</Card.Title> {/* Bolder, larger title */}
        <Card.Subtitle className="mb-2 text-muted small">
          <Badge bg="secondary" className="me-2 rounded-pill px-2 py-1">{category}</Badge> {/* Rounded badge */}
          {isOpen ? (
            <Badge bg="success" className="rounded-pill px-2 py-1">Open</Badge>
          ) : (
            <Badge bg="danger" className="rounded-pill px-2 py-1">Closed</Badge>
          )}
        </Card.Subtitle>
        <Card.Text className="text-muted small mb-1">
          {location?.colony && `${location.colony}, `}{location?.city}
        </Card.Text>
        <Card.Text className="text-muted small mb-2">
          Rating: {averageRating ? `${averageRating.toFixed(1)}/5` : 'N/A'} ({totalReviews} reviews)
        </Card.Text>
        <Card.Text className="flex-grow-1 text-truncate small" style={{ maxHeight: '3em' }}> {/* Smaller font */}
          {description}
        </Card.Text>
        <div className="mt-auto pt-2"> {/* Added padding top */}
          <Button as={Link} to={`/vendors/${id}`} variant="outline-primary" className="w-100 rounded-pill fs-6">
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default VendorCard;