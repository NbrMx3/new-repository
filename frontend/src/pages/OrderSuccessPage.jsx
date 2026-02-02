import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const [orderNumber] = useState(() => 
    'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  );
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="order-success-page">
      {/* CSS Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#e82e04', '#ff6b4a', '#ffd700', '#28a745', '#17a2b8'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      <div className="success-container">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1>Order Confirmed!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="order-info">
          <div className="order-info-item">
            <span className="label">Order Number</span>
            <span className="value">{orderNumber}</span>
          </div>
          <div className="order-info-item">
            <span className="label">Estimated Delivery</span>
            <span className="value">3-5 Business Days</span>
          </div>
        </div>

        <div className="confirmation-email">
          <span className="email-icon">📧</span>
          <p>A confirmation email has been sent to your email address with order details.</p>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-icon">📦</span>
              <div>
                <strong>Order Processing</strong>
                <p>We're preparing your items for shipment</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-icon">🚚</span>
              <div>
                <strong>Shipping</strong>
                <p>You'll receive tracking info via email</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-icon">🏠</span>
              <div>
                <strong>Delivery</strong>
                <p>Your package will arrive at your doorstep</p>
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
          <Link to="/" className="home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
