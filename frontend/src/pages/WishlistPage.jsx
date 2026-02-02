import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemove = (product) => {
    removeFromWishlist(product.id);
    toast.info(`${product.name} removed from wishlist`);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => addToCart(item));
    clearWishlist();
    toast.success('All items moved to cart!');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="empty-wishlist">
          <div className="empty-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by clicking the heart icon</p>
          <Link to="/products" className="browse-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist ({wishlistItems.length} items)</h1>
          <div className="wishlist-actions">
            <button onClick={handleMoveAllToCart} className="move-all-btn">
              Move All to Cart
            </button>
            <button onClick={clearWishlist} className="clear-btn">
              Clear Wishlist
            </button>
          </div>
        </div>

        <div className="wishlist-grid">
          {wishlistItems.map((item) => {
            const discount = Math.round(
              ((item.originalPrice - item.price) / item.originalPrice) * 100
            );
            
            return (
              <div key={item.id} className="wishlist-card">
                <button 
                  className="remove-btn"
                  onClick={() => handleRemove(item)}
                >
                  ✕
                </button>
                
                <Link to={`/product/${item.id}`} className="wishlist-image-link">
                  <img src={item.image} alt={item.name} className="wishlist-image" />
                  {discount > 0 && (
                    <span className="discount-badge">{discount}% OFF</span>
                  )}
                </Link>

                <div className="wishlist-info">
                  <Link to={`/product/${item.id}`} className="wishlist-name">
                    {item.name}
                  </Link>
                  
                  <div className="wishlist-rating">
                    <span className="stars">{'★'.repeat(Math.floor(item.rating))}</span>
                    <span className="rating-value">({item.reviews})</span>
                  </div>

                  <div className="wishlist-price">
                    <span className="current-price">${item.price.toFixed(2)}</span>
                    {item.originalPrice > item.price && (
                      <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="add-to-cart-btn"
                    disabled={!item.inStock}
                  >
                    {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
