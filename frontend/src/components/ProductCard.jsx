import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import QuickViewModal from './QuickViewModal';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const toast = useToast();
  const { notifyWishlistAdd, notifyWishlistRemove, notifyCompareAdd } = useNotifications();
  const navigate = useNavigate();
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
    // Removed notifyCartAdd - cart icon badge shows count instead
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`${product.name} added to wishlist!`);
      notifyWishlistAdd(product.name);
    } else {
      toast.info(`${product.name} removed from wishlist`);
      notifyWishlistRemove(product.name);
    }
  };

  const handleToggleCompare = (e) => {
    e.stopPropagation();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      toast.info(`${product.name} removed from comparison`);
    } else {
      const result = addToCompare(product);
      if (result.success) {
        toast.success(result.message);
        notifyCompareAdd(product.name);
      } else {
        toast.warning(result.message);
      }
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  return (
    <>
      <div className="product-card" onClick={handleCardClick}>
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" />
          {discount > 0 && (
            <div className="discount-badge">{discount}% OFF</div>
          )}
          <button 
            className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
            onClick={handleToggleWishlist}
          >
            {inWishlist ? '❤️' : '🤍'}
          </button>
          <button 
            className={`compare-btn ${inCompare ? 'active' : ''}`}
            onClick={handleToggleCompare}
            title={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            ⚖️
          </button>
          <div className="product-overlay">
            <button 
              className="quick-view-btn"
              onClick={handleQuickView}
            >
              👁️ Quick View
            </button>
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              🛒 Add to Cart
            </button>
          </div>
        </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.rating) ? 'star filled' : 'star'}>
                ★
              </span>
            ))}
          </div>
          <span className="review-count">({product.reviews})</span>
        </div>

        <div className="product-price">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="product-status">
          {product.inStock ? (
            <span className="in-stock">In Stock</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
      </div>
    </div>

    {showQuickView && (
      <QuickViewModal 
        product={product} 
        onClose={() => setShowQuickView(false)} 
      />
    )}
    </>
  );
};

export default ProductCard;
