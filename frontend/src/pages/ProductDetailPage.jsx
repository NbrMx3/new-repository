import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { messagingService } from '../services/messagingService';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [contactingSupplier, setContactingSupplier] = useState(false);
  const { addToCart } = useCart();
  const { user, isAuthenticated, isBuyer } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await productService.getProductById(parseInt(id));
        setProduct(prod);
        // Set initial quantity to MOQ if available
        if (prod?.moq) {
          setQuantity(prod.moq);
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
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleRequestQuote = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rfq/create/${product.id}` } });
    } else {
      navigate(`/rfq/create/${product.id}`);
    }
  };

  const handleContactSupplier = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${product.id}` } });
      return;
    }

    if (!product?.supplierId) return;

    setContactingSupplier(true);
    try {
      const conversation = await messagingService.getOrCreateConversation(
        { id: user.id, name: user.name, avatar: null, role: user.role },
        product.supplierId,
        product.supplierName,
        { id: product.id, name: product.name, image: product.image }
      );
      navigate(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setContactingSupplier(false);
    }
  };

  // Calculate current price based on quantity and bulk pricing
  const getCurrentPrice = () => {
    if (!product?.bulkPricing || product.bulkPricing.length === 0) {
      return product?.price || 0;
    }
    
    // Find the applicable bulk pricing tier
    const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
    const applicableTier = sortedTiers.find(tier => quantity >= tier.minQty);
    
    return applicableTier ? applicableTier.price : product.price;
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

  const currentPrice = getCurrentPrice();

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

          {/* Supplier Info */}
          {product.supplierName && (
            <div className="supplier-info-bar">
              <span className="supplier-label">Supplier:</span>
              <Link to={`/supplier/${product.supplierId}`} className="supplier-link">
                {product.supplierName}
              </Link>
              <span className="verified-supplier">✓ Verified</span>
            </div>
          )}

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

          {/* B2B Pricing Section */}
          <div className="b2b-pricing-section">
            <div className="price-header">
              <span className="current-price">¥{currentPrice.toFixed(2)}</span>
              <span className="price-unit">/{product.unit || 'piece'}</span>
              {product.originalPrice > currentPrice && (
                <span className="original-price">¥{product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            
            {/* Bulk Pricing Tiers */}
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <div className="bulk-pricing-tiers">
                <h4>Bulk Pricing:</h4>
                <div className="tiers-grid">
                  {product.bulkPricing.map((tier, index) => (
                    <div 
                      key={index} 
                      className={`tier ${quantity >= tier.minQty && (index === product.bulkPricing.length - 1 || quantity < product.bulkPricing[index + 1]?.minQty) ? 'active' : ''}`}
                    >
                      <span className="tier-qty">≥{tier.minQty} {product.unit || 'pcs'}</span>
                      <span className="tier-price">¥{tier.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MOQ Info */}
            {product.moq && (
              <div className="moq-notice">
                <span className="moq-icon">📦</span>
                <span>Minimum Order: <strong>{product.moq} {product.unit || 'pieces'}</strong></span>
              </div>
            )}
          </div>

          <div className="status-section">
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </div>
            {product.leadTime && (
              <div className="lead-time">
                <span className="lead-icon">⏱️</span>
                Lead Time: {product.leadTime}
              </div>
            )}
          </div>

          {/* Tabs for Description, Specifications, Packaging */}
          <div className="product-tabs">
            <div className="tabs-header">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              {product.specifications && (
                <button 
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
              )}
              {product.packagingDetails && (
                <button 
                  className={`tab-btn ${activeTab === 'packaging' ? 'active' : ''}`}
                  onClick={() => setActiveTab('packaging')}
                >
                  Packaging
                </button>
              )}
            </div>
            <div className="tab-content">
              {activeTab === 'description' && (
                <p>{product.description}</p>
              )}
              {activeTab === 'specs' && product.specifications && (
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="spec-label">{key}</td>
                        <td className="spec-value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'packaging' && product.packagingDetails && (
                <p>{product.packagingDetails}</p>
              )}
            </div>
          </div>

          <div className="action-section">
            <div className="quantity-selector">
              <label>Quantity ({product.unit || 'pieces'}):</label>
              <div className="quantity-control">
                <button 
                  onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                  className="qty-btn"
                >
                  −
                </button>
                <input 
                  type="number" 
                  min={product.moq || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                  className="qty-input"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
              {product.moq && quantity < product.moq && (
                <span className="moq-warning">Minimum order is {product.moq}</span>
              )}
            </div>

            <div className="action-buttons">
              <button 
                onClick={handleAddToCart}
                className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
                disabled={!product.inStock || (product.moq && quantity < product.moq)}
              >
                {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
              
              <button 
                onClick={handleRequestQuote}
                className="request-quote-btn"
              >
                📝 Request Quote
              </button>
            </div>

            <button 
              onClick={handleContactSupplier}
              className="contact-supplier-btn"
              disabled={contactingSupplier}
            >
              {contactingSupplier ? '⏳ Starting chat...' : '💬 Contact Supplier'}
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
    </div>
  );
};

export default ProductDetailPage;
