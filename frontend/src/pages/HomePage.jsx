import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';
import Testimonials from '../components/Testimonials';
import { productService } from '../services/productService';
import './HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        setFeaturedProducts(products.slice(0, 6));
        // Sort by reviews for best sellers
        const sorted = [...products].sort((a, b) => b.reviews - a.reviews);
        setBestSellers(sorted.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">🔥 Limited Time Offer</span>
          <h1>Welcome to E-com</h1>
          <p>Find the best deals on millions of products</p>
          <div className="hero-buttons">
            <Link to="/products" className="cta-button">
              Shop Now
            </Link>
            <Link to="/deals" className="cta-button secondary">
              View Deals
            </Link>
          </div>
        </div>
      </div>

      {/* Promo Banners */}
      <div className="promo-section">
        <Link to="/deals" className="promo-banner promo-1">
          <h3>Electronics</h3>
          <p>Up to 50% OFF</p>
        </Link>
        <Link to="/products" className="promo-banner promo-2">
          <h3>Accessories</h3>
          <p>Flash Deals</p>
        </Link>
        <Link to="/products" className="promo-banner promo-3">
          <h3>Best Sellers</h3>
          <p>Trending Now</p>
        </Link>
      </div>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>⭐ Featured Products</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="bestsellers-section">
        <div className="section-header">
          <h2>🏆 Best Sellers</h2>
          <Link to="/products" className="view-all">View All →</Link>
        </div>
        
        {!loading && (
          <div className="bestsellers-grid">
            {bestSellers.map((product, index) => (
              <Link key={product.id} to={`/product/${product.id}`} className="bestseller-card">
                <span className="rank">#{index + 1}</span>
                <img src={product.image} alt={product.name} />
                <div className="bestseller-info">
                  <h4>{product.name}</h4>
                  <div className="bestseller-stats">
                    <span className="price">${product.price.toFixed(2)}</span>
                    <span className="sold">{product.reviews}+ sold</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Customer Testimonials */}
      <Testimonials />

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefit-item">
          <div className="benefit-icon">🚚</div>
          <h3>Fast Shipping</h3>
          <p>Free delivery on orders over $50</p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🛡️</div>
          <h3>Secure Payment</h3>
          <p>Multiple payment options available</p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">↩️</div>
          <h3>Easy Returns</h3>
          <p>30-day money back guarantee</p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">⭐</div>
          <h3>Quality Guaranteed</h3>
          <p>100% authentic products</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
