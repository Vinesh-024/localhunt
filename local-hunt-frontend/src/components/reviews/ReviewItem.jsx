// src/components/reviews/ReviewItem.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

function ReviewItem({ review }) {
  const { reviewerName, rating, comment, createdAt } = review;

  // Format timestamp
  const reviewDate = createdAt ? new Date(createdAt._seconds * 1000).toLocaleDateString() : 'N/A';

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 text-primary">{reviewerName || 'Anonymous User'}</h6>
          <small className="text-muted">{reviewDate}</small>
        </div>
        <div className="mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{ color: star <= rating ? '#ffc107' : '#e4e5e9', fontSize: '1.2rem' }}
            >
              ★
            </span>
          ))}
        </div>
        <Card.Text>{comment}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ReviewItem;