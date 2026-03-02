import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supplierService } from '../services/supplierService';
import { productService } from '../services/productService';
import './SupplierProfile.css';

const SupplierProfile = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSupplierData();
  }, [id]);

  const loadSupplierData = async () => {
    try {
      setLoading(true);
      const supplierData = await supplierService.getSupplierById(id);
      setSupplier(supplierData);
      
      // Load products (mock - in real app, filter by supplier)
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts.slice(0, 6));
    } catch (error) {
      console.error('Error loading supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="supplier-profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="supplier-not-found">
        <h2>Supplier Not Found</h2>
        <p>The supplier you're looking for doesn't exist.</p>
        <Link to="/suppliers" className="back-btn">Browse Suppliers</Link>
      </div>
    );
  }

  return (
    <div className="supplier-profile-page">
      {/* Cover Image */}
      <div className="profile-cover" style={{ backgroundImage: `url(${supplier.coverImage})` }}>
        <div className="cover-overlay"></div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="supplier-logo">
            <img src={supplier.logo} alt={supplier.companyName} />
          </div>
          <div className="supplier-info">
            <div className="supplier-name-row">
              <h1>{supplier.companyName}</h1>
              {supplier.verified && (
                <span className={`verified-badge ${supplier.verificationLevel}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {supplier.verificationLevel} Verified
                </span>
              )}
            </div>
            <p className="supplier-tagline">{supplier.shortDescription}</p>
            <div className="supplier-meta">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {supplier.location.city}, {supplier.location.country}
              </span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Est. {supplier.establishedYear}
              </span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {supplier.employeeCount} employees
              </span>
            </div>
          </div>
          <div className="supplier-actions">
            <Link to={`/rfq/create?supplier=${supplier.id}`} className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Request Quote
            </Link>
            <button className="btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-value">{supplier.stats.totalProducts}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{supplier.totalTransactions}+</span>
          <span className="stat-label">Transactions</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{supplier.onTimeDelivery}%</span>
          <span className="stat-label">On-Time Delivery</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{supplier.qualityScore}</span>
          <span className="stat-label">Quality Score</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{supplier.repeatBuyerRate}%</span>
          <span className="stat-label">Repeat Buyers</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          Certifications
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="content-grid">
              {/* Company Info */}
              <div className="info-card">
                <h3>About Company</h3>
                <p className="company-description">{supplier.description}</p>
                
                <div className="info-section">
                  <h4>Main Products</h4>
                  <div className="tags-list">
                    {supplier.mainProducts.map((product, index) => (
                      <span key={index} className="tag">{product}</span>
                    ))}
                  </div>
                </div>

                <div className="info-section">
                  <h4>Product Categories</h4>
                  <div className="tags-list">
                    {supplier.productCategories.map((category, index) => (
                      <span key={index} className="tag category">{category}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="info-card">
                <h3>Business Details</h3>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Annual Revenue</span>
                    <span className="detail-value">{supplier.annualRevenue}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">MOQ Range</span>
                    <span className="detail-value">{supplier.moqRange}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Response Time</span>
                    <span className="detail-value">{supplier.responseTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">{new Date(supplier.memberSince).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="contact-info">
                  <h4>Contact Information</h4>
                  <div className="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    {supplier.contact.email}
                  </div>
                  <div className="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"></path>
                    </svg>
                    {supplier.contact.phone}
                  </div>
                  <div className="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    {supplier.contact.website}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-tab">
            <div className="products-grid">
              {products.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-price">${product.price}</p>
                    <p className="product-moq">MOQ: 100 pieces</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="certifications-tab">
            <div className="certs-grid">
              {supplier.certifications.map((cert, index) => (
                <div key={index} className="cert-card">
                  <div className="cert-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="8" r="7"></circle>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                  </div>
                  <span className="cert-name">{cert}</span>
                  <span className="cert-status">Verified</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierProfile;
