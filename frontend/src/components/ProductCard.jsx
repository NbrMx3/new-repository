import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        {discount > 0 && (
          <div className="discount-badge">{discount}% OFF</div>
        )}
        <div className="product-overlay">
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
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
          <span className="current-price">¥{product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="original-price">¥{product.originalPrice.toFixed(2)}</span>
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
  );
};

export default ProductCard;
