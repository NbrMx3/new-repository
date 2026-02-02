import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { productService } from '../services/productService';
import ProductReviews from '../components/ProductReviews';
import RecentlyViewed from '../components/RecentlyViewed';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const toast = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await productService.getProductById(parseInt(id));
        setProduct(prod);
        if (prod) {
          addToRecentlyViewed(prod);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`${product.name} added to wishlist!`);
    } else {
      toast.info(`${product.name} removed from wishlist`);
    }
  };

  const discount = product
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">← Back to Products</Link>

      <div className="product-detail-container">
        <div className="product-images">
          <img src={product.image} alt={product.name} className="main-image" />
          {discount > 0 && (
            <div className="discount-label">{discount}% OFF</div>
          )}
        </div>

        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>

          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.rating) ? 'star filled' : 'star'}>
                  ★
                </span>
              ))}
            </div>
            <span className="rating-value">{product.rating.toFixed(1)}</span>
            <span className="review-count">({product.reviews} reviews)</span>
          </div>

          <div className="price-section">
            <div className="price-container">
              <span className="current-price">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                  <span className="save-amount">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="status-section">
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="action-section">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-control">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                >
                  −
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="qty-input"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              disabled={!product.inStock}
            >
              Add to Cart
            </button>

            <button 
              onClick={handleToggleWishlist}
              className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
            >
              {isInWishlist(product.id) ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>

          <div className="benefits-section">
            <div className="benefit">
              <span>🚚</span> Free shipping on orders over $50
            </div>
            <div className="benefit">
              <span>↩️</span> 30-day return guarantee
            </div>
            <div className="benefit">
              <span>🛡️</span> Buyer protection guarantee
            </div>
          </div>
        </div>
      </div>

      <ProductReviews 
        productId={product.id} 
        productRating={product.rating}
        totalReviews={product.reviews}
      />

      <RecentlyViewed />
    </div>
  );
};

export default ProductDetailPage;
