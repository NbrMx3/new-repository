import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();

  if (!product) return null;

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${product.name} added to cart!`);
    onClose();
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`Added to wishlist!`);
    } else {
      toast.info(`Removed from wishlist`);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('quick-view-overlay')) {
      onClose();
    }
  };

  return (
    <div className="quick-view-overlay" onClick={handleOverlayClick}>
      <div className="quick-view-modal">
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="quick-view-content">
          <div className="quick-view-image">
            <img src={product.image} alt={product.name} />
            {discount > 0 && (
              <span className="discount-badge">{discount}% OFF</span>
            )}
          </div>

          <div className="quick-view-details">
            <span className="category-tag">{product.category}</span>
            <h2>{product.name}</h2>
            
            <div className="rating">
              <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
              <span className="rating-text">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="price-section">
              <span className="current-price">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="original-price">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="description">{product.description}</p>

            <div className="stock-info">
              {product.inStock ? (
                <span className="in-stock">✓ In Stock</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                🛒 Add to Cart
              </button>
              <button 
                className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={handleToggleWishlist}
              >
                {isInWishlist(product.id) ? '❤️' : '🤍'}
              </button>
            </div>

            <Link to={`/product/${product.id}`} className="view-details-link" onClick={onClose}>
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
