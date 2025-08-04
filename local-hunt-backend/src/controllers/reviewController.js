// src/controllers/reviewController.js
const ReviewModel = require('../models/ReviewModel');
const VendorModel = require('../models/VendorModel');
const UserModel = require('../models/UserModel');
const { db } = require('../config/firebaseAdmin'); // Ensure db is imported

exports.submitReview = async (req, res, next) => {
  try {
    const { vendorId, rating, comment } = req.body;
    const userId = req.user.uid;

    if (!vendorId || !rating || !comment) {
      return res.status(400).json({ message: 'Vendor ID, rating, and comment are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const newReview = await ReviewModel.createReview(vendorId, userId, rating, comment);

    await VendorModel.updateVendorRating(vendorId);

    // --- NEW: Add notification to vendor ---
    const vendor = await VendorModel.getVendorById(vendorId); // Get vendor details to find owner
    if (vendor && vendor.userId) {
      const reviewer = await UserModel.getUserProfile(userId); // Get reviewer's name
      const reviewerName = reviewer ? reviewer.name : 'Someone';
      await UserModel.addNotification(
        vendor.userId, // Vendor's UID is the recipient
        'new_review',
        `You received a new ${rating}-star review from ${reviewerName} for ${vendor.businessName}!`,
        newReview.id // Related ID is the review ID
      );
    }
    // --- END NEW ---

    res.status(201).json({ message: 'Review submitted successfully!', review: newReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    next(error);
  }
};

exports.getReviewsForVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor ID is required to fetch reviews.' });
    }

    let reviews = await ReviewModel.getReviewsByVendorId(vendorId);

    const reviewsWithUserNames = await Promise.all(reviews.map(async (review) => {
      const user = await UserModel.getUserProfile(review.userId);
      return {
        ...review,
        reviewerName: user ? user.name : 'Anonymous User',
      };
    }));

    res.status(200).json({ reviews: reviewsWithUserNames });
  } catch (error) {
    console.error('Error fetching reviews for vendor:', error);
    next(error);
  }
};

exports.getReviewsByUser = async (req, res, next) => {
  try {
    const userId = req.user.uid; // Get user ID from authenticated token
    let reviews = await db.collection('reviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviewsWithVendorNames = await Promise.all(reviews.docs.map(async (doc) => {
      const review = { id: doc.id, ...doc.data() };
      const vendor = await VendorModel.getVendorById(review.vendorId);
      return {
        ...review,
        vendorName: vendor ? vendor.businessName : 'Unknown Vendor',
      };
    }));

    res.status(200).json({ reviews: reviewsWithVendorNames });
  } catch (error) {
    console.error('Error fetching reviews by user:', error);
    next(error);
  }
};

/**
 * Update an existing review.
 * Only allowed by the review owner or an admin.
 * @route PUT /api/reviews/:id
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.uid; // User making the request
    const userRole = req.user.role; // Role of the user making the request

    const existingReview = await ReviewModel.getReviewById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Authorization: Only owner or admin can update
    if (existingReview.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own reviews.' });
    }

    const updates = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      }
      updates.rating = rating;
    }
    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({ message: 'Comment cannot be empty.' });
      }
      updates.comment = comment;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ message: 'No changes detected to update.' });
    }

    const updatedReview = await ReviewModel.updateReview(reviewId, updates);

    // If rating changed, re-calculate vendor's average rating
    if (rating !== undefined && rating !== existingReview.rating) {
      await VendorModel.updateVendorRating(existingReview.vendorId);
    }

    res.status(200).json({ message: 'Review updated successfully!', review: updatedReview });
  } catch (error) {
    console.error('Error updating review:', error);
    next(error);
  }
};

/**
 * Delete an existing review.
 * Only allowed by the review owner or an admin.
 * @route DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { id: reviewId } = req.params;
    const userId = req.user.uid;
    const userRole = req.user.role;

    console.log(`--- DEBUG: deleteReview ---`); // <--- NEW DEBUG LOG
    console.log(`DEBUG: Attempting to delete review with ID: "${reviewId}"`); // <--- NEW DEBUG LOG
    console.log(`DEBUG: User ID: "${userId}", Role: "${userRole}"`); // <--- NEW DEBUG LOG

    const existingReview = await ReviewModel.getReviewById(reviewId);

    console.log(`DEBUG: Review found by ID: ${!!existingReview}`); // <--- NEW DEBUG LOG
    if (existingReview) {
        console.log('DEBUG: Existing review owner:', existingReview.userId); // <--- NEW DEBUG LOG
    }

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Authorization: Only owner or admin can delete
    if (existingReview.userId !== userId && userRole !== 'admin') {
      console.warn(`DEBUG: Forbidden attempt to delete review ${reviewId} by user ${userId} (role: ${userRole}). Owner: ${existingReview.userId}`); // <--- NEW DEBUG LOG
      return res.status(403).json({ message: 'Forbidden: You can only delete your own reviews.' });
    }

    await ReviewModel.deleteReview(reviewId);
    console.log(`DEBUG: Review ${reviewId} successfully deleted from Firestore.`); // <--- NEW DEBUG LOG

    await VendorModel.updateVendorRating(existingReview.vendorId);
    console.log(`DEBUG: Vendor rating updated for vendor ${existingReview.vendorId}.`); // <--- NEW DEBUG LOG

    res.status(200).json({ message: 'Review deleted successfully!' });
  } catch (error) {
    console.error('Error deleting review (diagnostic):', error); // <--- Updated log
    next(error);
  } finally {
      console.log(`--- END DEBUG: deleteReview ---`); // <--- NEW DEBUG LOG
  }
};


/**
 * Get all reviews (publicly accessible, for homepage featured reviews).
 * @route GET /api/reviews
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    // Fetch all approved reviews, sorted by newest
    const snapshot = await db.collection('reviews')
      .where('status', '==', 'approved')
      .orderBy('createdAt', 'desc')
      .get();

    let reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch reviewer and vendor names for display
    const reviewsWithDetails = await Promise.all(reviews.map(async (review) => {
      const reviewer = await UserModel.getUserProfile(review.userId);
      const vendor = await VendorModel.getVendorById(review.vendorId);
      return {
        ...review,
        reviewerName: reviewer ? reviewer.name : 'Anonymous User',
        vendorName: vendor ? vendor.businessName : 'Unknown Business',
      };
    }));

    res.status(200).json({ reviews: reviewsWithDetails });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    next(error);
  }
};