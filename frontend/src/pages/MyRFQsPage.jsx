import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rfqService } from '../services/rfqService';
import './RFQPage.css';

const MyRFQsPage = () => {
  const { user, isAuthenticated, isSupplier } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRFQ, setSelectedRFQ] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadRFQs();
    }
  }, [isAuthenticated, user]);

  const loadRFQs = async () => {
    try {
      setLoading(true);
      const data = isSupplier
        ? await rfqService.getSupplierRFQs(user.supplierId || 'supplier-1')
        : await rfqService.getBuyerRFQs(user.id);
      setRfqs(data);
    } catch (error) {
      console.error('Error loading RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', label: 'Pending', icon: '⏳' },
      quoted: { class: 'status-quoted', label: 'Quoted', icon: '💬' },
      accepted: { class: 'status-accepted', label: 'Accepted', icon: '✓' },
      rejected: { class: 'status-rejected', label: 'Rejected', icon: '✗' },
      expired: { class: 'status-expired', label: 'Expired', icon: '⌛' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled', icon: '🚫' }
    };
    return badges[status] || badges.pending;
  };

  const filteredRFQs = filter === 'all' 
    ? rfqs 
    : rfqs.filter(rfq => rfq.status === filter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="rfq-page-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-rfqs-page">
      <div className="rfqs-container">
        <div className="rfqs-header">
          <div>
            <h1>{isSupplier ? 'Quote Requests' : 'My Quote Requests'}</h1>
            <p>{isSupplier ? 'Manage and respond to buyer inquiries' : 'Track your quotation requests'}</p>
          </div>
          {!isSupplier && (
            <Link to="/products" className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Request
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="rfqs-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({rfqs.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({rfqs.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'quoted' ? 'active' : ''}`}
            onClick={() => setFilter('quoted')}
          >
            Quoted ({rfqs.filter(r => r.status === 'quoted').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({rfqs.filter(r => r.status === 'accepted').length})
          </button>
        </div>

        {/* RFQ List */}
        {filteredRFQs.length > 0 ? (
          <div className="rfqs-list">
            {filteredRFQs.map(rfq => (
              <div key={rfq.id} className="rfq-card" onClick={() => setSelectedRFQ(rfq)}>
                <div className="rfq-card-header">
                  <span className="rfq-id">{rfq.id}</span>
                  <span className={`rfq-status ${getStatusBadge(rfq.status).class}`}>
                    {getStatusBadge(rfq.status).icon} {getStatusBadge(rfq.status).label}
                  </span>
                </div>
                
                <div className="rfq-card-body">
                  <h3 className="rfq-product">{rfq.productName}</h3>
                  <p className="rfq-party">
                    {isSupplier ? (
                      <>From: <strong>{rfq.buyerCompany || rfq.buyerName}</strong></>
                    ) : (
                      <>To: <strong>{rfq.supplierName}</strong></>
                    )}
                  </p>
                  
                  <div className="rfq-details-grid">
                    <div className="detail">
                      <span className="detail-label">Quantity</span>
                      <span className="detail-value">{rfq.quantity.toLocaleString()} {rfq.unit}</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Target Price</span>
                      <span className="detail-value">
                        {rfq.targetPrice ? `$${rfq.targetPrice}/unit` : 'Open'}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Delivery</span>
                      <span className="detail-value">{rfq.deliveryLocation}</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Due Date</span>
                      <span className="detail-value">{formatDate(rfq.deliveryDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="rfq-card-footer">
                  <span className="rfq-date">Created: {formatDate(rfq.createdAt)}</span>
                  {rfq.quotes?.length > 0 && (
                    <span className="rfq-quotes-count">
                      {rfq.quotes.length} quote{rfq.quotes.length > 1 ? 's' : ''} received
                    </span>
                  )}
                </div>

                {/* Quote Preview */}
                {rfq.quotes?.length > 0 && (
                  <div className="quote-preview">
                    <div className="quote-preview-header">Latest Quote</div>
                    <div className="quote-preview-body">
                      <div className="quote-price">
                        <span className="label">Unit Price</span>
                        <span className="value">${rfq.quotes[0].unitPrice}</span>
                      </div>
                      <div className="quote-total">
                        <span className="label">Total</span>
                        <span className="value">${rfq.quotes[0].totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="quote-lead">
                        <span className="label">Lead Time</span>
                        <span className="value">{rfq.quotes[0].leadTime}</span>
                      </div>
                    </div>
                    {!isSupplier && rfq.status === 'quoted' && (
                      <div className="quote-actions">
                        <button className="btn-accept">Accept Quote</button>
                        <button className="btn-negotiate">Negotiate</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3>No Quote Requests</h3>
            <p>
              {isSupplier 
                ? "You haven't received any quote requests yet."
                : "You haven't submitted any quote requests yet."}
            </p>
            {!isSupplier && (
              <Link to="/products" className="btn-primary">Browse Products</Link>
            )}
          </div>
        )}
      </div>

      {/* RFQ Detail Modal */}
      {selectedRFQ && (
        <div className="rfq-modal-overlay" onClick={() => setSelectedRFQ(null)}>
          <div className="rfq-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRFQ(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-header">
              <h2>{selectedRFQ.id}</h2>
              <span className={`rfq-status ${getStatusBadge(selectedRFQ.status).class}`}>
                {getStatusBadge(selectedRFQ.status).label}
              </span>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Product</h4>
                <p className="product-name">{selectedRFQ.productName}</p>
              </div>

              <div className="modal-section">
                <h4>{isSupplier ? 'Buyer' : 'Supplier'}</h4>
                <p>{isSupplier ? (selectedRFQ.buyerCompany || selectedRFQ.buyerName) : selectedRFQ.supplierName}</p>
              </div>

              <div className="modal-grid">
                <div className="modal-section">
                  <h4>Quantity</h4>
                  <p>{selectedRFQ.quantity.toLocaleString()} {selectedRFQ.unit}</p>
                </div>
                <div className="modal-section">
                  <h4>Target Price</h4>
                  <p>{selectedRFQ.targetPrice ? `$${selectedRFQ.targetPrice}/unit` : 'Open to offers'}</p>
                </div>
                <div className="modal-section">
                  <h4>Delivery Location</h4>
                  <p>{selectedRFQ.deliveryLocation}</p>
                </div>
                <div className="modal-section">
                  <h4>Expected Delivery</h4>
                  <p>{formatDate(selectedRFQ.deliveryDate)}</p>
                </div>
              </div>

              {selectedRFQ.requirements && (
                <div className="modal-section">
                  <h4>Requirements</h4>
                  <p className="requirements-text">{selectedRFQ.requirements}</p>
                </div>
              )}

              {selectedRFQ.quotes?.length > 0 && (
                <div className="modal-section quotes-section">
                  <h4>Quotes Received</h4>
                  {selectedRFQ.quotes.map(quote => (
                    <div key={quote.id} className="quote-detail-card">
                      <div className="quote-header">
                        <span className="quote-id">{quote.id}</span>
                        <span className="quote-date">{formatDate(quote.createdAt)}</span>
                      </div>
                      <div className="quote-body">
                        <div className="quote-stat">
                          <span className="label">Unit Price</span>
                          <span className="value price">${quote.unitPrice}</span>
                        </div>
                        <div className="quote-stat">
                          <span className="label">Total</span>
                          <span className="value">${quote.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="quote-stat">
                          <span className="label">MOQ</span>
                          <span className="value">{quote.moq}</span>
                        </div>
                        <div className="quote-stat">
                          <span className="label">Lead Time</span>
                          <span className="value">{quote.leadTime}</span>
                        </div>
                      </div>
                      {quote.notes && (
                        <div className="quote-notes">
                          <strong>Notes:</strong> {quote.notes}
                        </div>
                      )}
                      {quote.acceptedAt && (
                        <div className="quote-accepted-badge">
                          ✓ Accepted on {formatDate(quote.acceptedAt)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {isSupplier && selectedRFQ.status === 'pending' && (
                <button className="btn-primary">Submit Quote</button>
              )}
              {!isSupplier && selectedRFQ.status === 'quoted' && (
                <>
                  <button className="btn-secondary">Negotiate</button>
                  <button className="btn-primary">Accept Quote</button>
                </>
              )}
              <button className="btn-secondary" onClick={() => setSelectedRFQ(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRFQsPage;
