import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import './DealsPage.css';

const DealsPage = () => {
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const products = await productService.getAllProducts();
        // Get products with highest discounts
        const deals = products
          .filter(p => p.originalPrice > p.price)
          .sort((a, b) => {
            const discountA = (a.originalPrice - a.price) / a.originalPrice;
            const discountB = (b.originalPrice - b.price) / b.originalPrice;
            return discountB - discountA;
          })
          .slice(0, 12);
        setDealProducts(deals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching deals:', error);
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset timer for demo
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num) => String(num).padStart(2, '0');

  return (
    <div className="deals-page">
      {/* Flash Sale Banner */}
      <div className="flash-banner">
        <div className="flash-content">
          <div className="flash-icon">⚡</div>
          <div className="flash-info">
            <h1>Flash Sale!</h1>
            <p>Incredible deals on top products. Don't miss out!</p>
          </div>
          <div className="countdown-timer">
            <span className="timer-label">Ends in:</span>
            <div className="timer-boxes">
              <div className="timer-box">
                <span className="timer-value">{formatTime(timeLeft.hours)}</span>
                <span className="timer-unit">Hours</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-box">
                <span className="timer-value">{formatTime(timeLeft.minutes)}</span>
                <span className="timer-unit">Mins</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-box">
                <span className="timer-value">{formatTime(timeLeft.seconds)}</span>
                <span className="timer-unit">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Categories */}
      <div className="deal-categories">
        <button className="deal-category active">🔥 All Deals</button>
        <button className="deal-category">📱 Electronics</button>
        <button className="deal-category">💻 Computer</button>
        <button className="deal-category">🎧 Audio</button>
        <button className="deal-category">📷 Cameras</button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">500+</span>
          <span className="stat-label">Products on Sale</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">Up to 70%</span>
          <span className="stat-label">Discount</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">Free</span>
          <span className="stat-label">Shipping on $50+</span>
        </div>
      </div>

      {/* Deal Products */}
      <div className="deals-container">
        <div className="deals-header">
          <h2>🔥 Today's Hot Deals</h2>
          <span className="deals-count">{dealProducts.length} items</span>
        </div>

        {loading ? (
          <div className="loading">Loading amazing deals...</div>
        ) : (
          <div className="deals-grid">
            {dealProducts.map((product, index) => (
              <div key={product.id} className="deal-card-wrapper">
                {index < 3 && <div className="hot-badge">🔥 HOT</div>}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promo Section */}
      <div className="promo-section">
        <div className="promo-card promo-electronics">
          <h3>Electronics</h3>
          <p>Up to 50% OFF</p>
          <span className="promo-tag">Limited Time</span>
        </div>
        <div className="promo-card promo-accessories">
          <h3>Accessories</h3>
          <p>Buy 2 Get 1 Free</p>
          <span className="promo-tag">Special Offer</span>
        </div>
        <div className="promo-card promo-gadgets">
          <h3>Smart Gadgets</h3>
          <p>Extra 10% OFF</p>
          <span className="promo-tag">Member Exclusive</span>
        </div>
      </div>
    </div>
  );
};

export default DealsPage;
