import React from 'react'
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Oops! Page Not Found</h1>
        <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        <div className="not-found-illustration">
          <span className="lost-icon">🔍</span>
          <span className="lost-icon">📦</span>
          <span className="lost-icon">❓</span>
        </div>
        <div className="not-found-actions">
          <Link to="/" className="home-btn">
            Go to Homepage
          </Link>
          <Link to="/products" className="browse-btn">
            Browse Products
          </Link>
        </div>
        <div className="helpful-links">
          <p>You might want to check out:</p>
          <div className="link-grid">
            <Link to="/deals" className="helpful-link">
              <span>🔥</span> Flash Deals
            </Link>
            <Link to="/search" className="helpful-link">
              <span>🔎</span> Search Products
            </Link>
            <Link to="/cart" className="helpful-link">
              <span>🛒</span> Your Cart
            </Link>
            <Link to="/profile" className="helpful-link">
              <span>👤</span> Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
