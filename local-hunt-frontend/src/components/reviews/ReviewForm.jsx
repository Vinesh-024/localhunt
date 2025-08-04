// src/components/reviews/ReviewForm.jsx
import React, { useState } from 'react';
import { Form, Button, Card, Spinner } from 'react-bootstrap'; // Removed Alert
import { submitReview } from '../../services/reviewApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext'; // <--- ADD THIS IMPORT

function ReviewForm({ vendorId, onReviewSubmitted }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast(); // Use useToast hook
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  // const [error, setError] = useState(''); // Removed
  // const [message, setMessage] = useState(''); // Removed
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError(''); // Removed
    // setMessage(''); // Removed
    setLoading(true);

    if (!currentUser) {
      addToast('info', 'You must be logged in to submit a review.'); // <--- USE TOAST
      setLoading(false);
      return;
    }
    if (rating === 0) {
      addToast('warning', 'Please select a rating.'); // <--- USE TOAST
      setLoading(false);
      return;
    }
    if (!comment.trim()) {
      addToast('warning', 'Please enter a comment for your review.'); // <--- USE TOAST
      setLoading(false);
      return;
    }

    try {
      await submitReview(vendorId, rating, comment);
      addToast('success', 'Review submitted successfully!'); // <--- USE TOAST
      setRating(0); // Reset form
      setComment('');
      if (onReviewSubmitted) {
        onReviewSubmitted(); // Callback to parent to re-fetch reviews
      }
    } catch (err) {
      addToast('danger', err || 'Failed to submit review.'); // <--- USE TOAST
      console.error('Review submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-3 mb-4 shadow-sm">
      <Card.Body>
        <h5 className="mb-3">Submit Your Review</h5>
        {!currentUser && (
          <Alert variant="info">Please log in to submit a review.</Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Rating <span className="text-danger">*</span></Form.Label>
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
                  onClick={() => handleRatingChange(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reviewComment">
            <Form.Label>Comment <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
            />
          </Form.Group>

          {/* Removed: {error && <Alert variant="danger">{error}</Alert>} */}
          {/* Removed: {message && <Alert variant="success">{message}</Alert>} */}

          <Button variant="primary" type="submit" disabled={loading || !currentUser} className="rounded-pill px-4"> {/* Rounded button */}
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Submitting...</span>
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ReviewForm;