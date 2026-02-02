import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import './ProductReviews.css';

const ProductReviews = ({ productId, productRating, totalReviews }) => {
  const [reviews, setReviews] = useState([
    { id: 1, user: 'John D.', rating: 5, date: '2025-01-28', comment: 'Excellent product! Exactly as described and fast shipping.', helpful: 12 },
    { id: 2, user: 'Sarah M.', rating: 4, date: '2025-01-25', comment: 'Good quality for the price. Would recommend to others.', helpful: 8 },
    { id: 3, user: 'Mike R.', rating: 5, date: '2025-01-20', comment: 'Amazing value! Better than expected. Will buy again.', helpful: 15 },
  ]);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const toast = useToast();

  const ratingDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 10 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      toast.warning('Please write a review comment');
      return;
    }

    const review = {
      id: Date.now(),
      user: 'You',
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      comment: newReview.comment,
      helpful: 0,
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, comment: '' });
    setShowReviewForm(false);
    toast.success('Thank you for your review!');
  };

  const handleHelpful = (reviewId) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ));
    toast.info('Thanks for your feedback!');
  };

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <button 
          className="write-review-btn"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      <div className="reviews-summary">
        <div className="rating-overview">
          <div className="big-rating">
            <span className="rating-number">{productRating?.toFixed(1) || '4.5'}</span>
            <div className="rating-stars">
              {'★'.repeat(Math.floor(productRating || 4.5))}
              {'☆'.repeat(5 - Math.floor(productRating || 4.5))}
            </div>
            <span className="total-reviews">{totalReviews || reviews.length} reviews</span>
          </div>
        </div>

        <div className="rating-bars">
          {ratingDistribution.map(({ stars, percentage }) => (
            <div key={stars} className="rating-bar-row">
              <span className="bar-label">{stars} ★</span>
              <div className="bar-container">
                <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="bar-percentage">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {showReviewForm && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <h3>Write Your Review</h3>
          
          <div className="form-group">
            <label>Your Rating</label>
            <div className="star-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= newReview.rating ? 'active' : ''}`}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Your Review</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this product..."
              rows={4}
            />
          </div>

          <button type="submit" className="submit-review-btn">
            Submit Review
          </button>
        </form>
      )}

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.user.charAt(0)}
                </div>
                <div>
                  <span className="reviewer-name">{review.user}</span>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
              <div className="review-rating">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
            </div>
            
            <p className="review-comment">{review.comment}</p>
            
            <div className="review-actions">
              <button 
                className="helpful-btn"
                onClick={() => handleHelpful(review.id)}
              >
                👍 Helpful ({review.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
