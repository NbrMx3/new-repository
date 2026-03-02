import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supplierService } from '../services/supplierService';
import { rfqService } from '../services/rfqService';
import './SupplierDashboard.css';

const SupplierDashboard = () => {
  const { user, isSupplier } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [supplierProfile, setSupplierProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [rfqStats, setRfqStats] = useState(null);
  const [recentRFQs, setRecentRFQs] = useState([]);

  useEffect(() => {
    if (!isSupplier) {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, [isSupplier, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load supplier profile
      const profile = await supplierService.getSupplierByUserId(user.id);
      setSupplierProfile(profile);

      if (profile) {
        // Load supplier stats
        const supplierStats = await supplierService.getSupplierStats(profile.id);
        setStats(supplierStats);

        // Load RFQ stats
        const rfqData = await rfqService.getSupplierRFQs(profile.id);
        setRecentRFQs(rfqData.slice(0, 5));
        
        const rfqStatsData = await rfqService.getRFQStats(profile.id, 'supplier');
        setRfqStats(rfqStatsData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', label: 'Pending' },
      quoted: { class: 'status-quoted', label: 'Quoted' },
      accepted: { class: 'status-accepted', label: 'Accepted' },
      rejected: { class: 'status-rejected', label: 'Rejected' },
      expired: { class: 'status-expired', label: 'Expired' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!supplierProfile) {
    return (
      <div className="dashboard-setup">
        <div className="setup-content">
          <div className="setup-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <h2>Complete Your Supplier Profile</h2>
          <p>Set up your supplier profile to start receiving inquiries and selling on our marketplace.</p>
          <Link to="/supplier/setup" className="setup-btn">
            Set Up Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        <div className="header-actions">
          <Link to="/my-products/add" className="btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Product
          </Link>
          <Link to="/supplier/profile" className="btn-secondary">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalProducts || 0}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalOrders || 0}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon buyers">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalBuyers || 0}</span>
            <span className="stat-label">Total Buyers</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rating">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats?.avgRating || 0}</span>
            <span className="stat-label">Avg Rating</span>
          </div>
        </div>
      </div>

      {/* RFQ Stats */}
      <div className="rfq-stats-bar">
        <h3>Quote Requests Overview</h3>
        <div className="rfq-stats">
          <div className="rfq-stat">
            <span className="rfq-count pending">{rfqStats?.pending || 0}</span>
            <span className="rfq-label">Pending</span>
          </div>
          <div className="rfq-stat">
            <span className="rfq-count quoted">{rfqStats?.quoted || 0}</span>
            <span className="rfq-label">Quoted</span>
          </div>
          <div className="rfq-stat">
            <span className="rfq-count accepted">{rfqStats?.accepted || 0}</span>
            <span className="rfq-label">Accepted</span>
          </div>
          <div className="rfq-stat">
            <span className="rfq-count total">{rfqStats?.total || 0}</span>
            <span className="rfq-label">Total</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent RFQs */}
        <div className="dashboard-card rfqs-card">
          <div className="card-header">
            <h3>Recent Quote Requests</h3>
            <Link to="/supplier/rfqs" className="view-all">View All</Link>
          </div>
          <div className="card-content">
            {recentRFQs.length > 0 ? (
              <div className="rfq-list">
                {recentRFQs.map(rfq => (
                  <div key={rfq.id} className="rfq-item">
                    <div className="rfq-info">
                      <span className="rfq-id">{rfq.id}</span>
                      <span className="rfq-product">{rfq.productName}</span>
                      <span className="rfq-buyer">{rfq.buyerCompany}</span>
                    </div>
                    <div className="rfq-details">
                      <span className="rfq-quantity">{rfq.quantity} {rfq.unit}</span>
                      <span className={`rfq-status ${getStatusBadge(rfq.status).class}`}>
                        {getStatusBadge(rfq.status).label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No quote requests yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to="/supplier/orders" className="view-all">View All</Link>
          </div>
          <div className="card-content">
            {stats?.recentOrders?.length > 0 ? (
              <div className="order-list">
                {stats.recentOrders.map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <span className="order-id">{order.id}</span>
                      <span className="order-date">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <div className="order-details">
                      <span className="order-amount">${order.amount.toLocaleString()}</span>
                      <span className={`order-status status-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="dashboard-card products-card">
          <div className="card-header">
            <h3>Top Products</h3>
            <Link to="/my-products" className="view-all">View All</Link>
          </div>
          <div className="card-content">
            {stats?.topProducts?.length > 0 ? (
              <div className="top-products-list">
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="top-product-item">
                    <span className="product-rank">#{index + 1}</span>
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-sales">{product.sales} sales</span>
                    </div>
                    <span className="product-revenue">${product.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No product data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <h3>Profile Status</h3>
          </div>
          <div className="card-content">
            <div className="verification-status">
              <div className={`verification-badge ${supplierProfile.verificationLevel}`}>
                {supplierProfile.verified ? (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>{supplierProfile.verificationLevel.toUpperCase()} Verified</span>
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Not Verified</span>
                  </>
                )}
              </div>
            </div>
            <div className="profile-metrics">
              <div className="metric">
                <span className="metric-label">Response Time</span>
                <span className="metric-value">{supplierProfile.responseTime}</span>
              </div>
              <div className="metric">
                <span className="metric-label">On-Time Delivery</span>
                <span className="metric-value">{supplierProfile.onTimeDelivery}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Quality Score</span>
                <span className="metric-value">{supplierProfile.qualityScore}/5</span>
              </div>
            </div>
            {!supplierProfile.verified && (
              <Link to="/supplier/verification" className="verify-btn">
                Get Verified
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/my-products/add" className="action-item">
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span>Add Product</span>
          </Link>
          <Link to="/supplier/rfqs" className="action-item">
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <span>View RFQs</span>
          </Link>
          <Link to="/messages" className="action-item">
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span>Messages</span>
          </Link>
          <Link to="/supplier/profile" className="action-item">
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
