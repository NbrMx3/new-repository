import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import './HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        setFeaturedProducts(products.slice(0, 6));
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
          <h1>Welcome to AlibabaShop</h1>
          <p>Find the best deals on millions of products</p>
          <Link to="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Promo Banners */}
      <div className="promo-section">
        <div className="promo-banner promo-1">
          <h3>Electronics</h3>
          <p>Up to 50% OFF</p>
        </div>
        <div className="promo-banner promo-2">
          <h3>Accessories</h3>
          <p>Flash Deals</p>
        </div>
        <div className="promo-banner promo-3">
          <h3>Best Sellers</h3>
          <p>Trending Now</p>
        </div>
      </div>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Products</h2>
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
