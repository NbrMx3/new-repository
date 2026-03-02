import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { supplierService } from '../services/supplierService';
import { rfqService } from '../services/rfqService';
import './RFQPage.css';

const CreateRFQPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer } = useAuth();
  
  const productId = searchParams.get('product');
  const supplierId = searchParams.get('supplier');

  const [product, setProduct] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    quantity: '',
    targetPrice: '',
    currency: 'USD',
    requirements: '',
    deliveryLocation: '',
    deliveryDate: '',
    attachments: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: window.location.pathname + window.location.search } } });
      return;
    }
    loadData();
  }, [productId, supplierId, isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (productId) {
        const productData = await productService.getProductById(parseInt(productId));
        setProduct(productData);
        
        if (productData?.supplierId) {
          const supplierData = await supplierService.getSupplierById(productData.supplierId);
          setSupplier(supplierData);
        }
      } else if (supplierId) {
        const supplierData = await supplierService.getSupplierById(supplierId);
        setSupplier(supplierData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    if (product && formData.quantity < product.moq) {
      newErrors.quantity = `Minimum order quantity is ${product.moq} ${product.unit}`;
    }
    if (!formData.deliveryLocation.trim()) {
      newErrors.deliveryLocation = 'Please enter delivery location';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Please select expected delivery date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      await rfqService.createRFQ({
        buyerId: user.id,
        buyerName: user.name,
        buyerCompany: user.company || '',
        supplierId: supplier?.id || '',
        supplierName: supplier?.companyName || '',
        productId: product?.id || null,
        productName: product?.name || formData.productName || 'Custom Product',
        quantity: parseInt(formData.quantity),
        unit: product?.unit || 'pieces',
        targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : null,
        currency: formData.currency,
        requirements: formData.requirements,
        deliveryLocation: formData.deliveryLocation,
        deliveryDate: formData.deliveryDate
      });

      setSuccess(true);
    } catch (error) {
      console.error('Error creating RFQ:', error);
      setErrors({ submit: 'Failed to submit quote request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getBulkPrice = (qty) => {
    if (!product?.bulkPricing) return product?.price;
    const tier = product.bulkPricing.find(t => 
      qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty)
    );
    return tier?.price || product.price;
  };

  if (loading) {
    return (
      <div className="rfq-page-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rfq-success">
        <div className="success-content">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Quote Request Submitted!</h2>
          <p>Your request has been sent to {supplier?.companyName || 'the supplier'}. You'll receive a response within {supplier?.responseTime || '24-48 hours'}.</p>
          <div className="success-actions">
            <Link to="/my-rfqs" className="btn-primary">View My Requests</Link>
            <Link to="/products" className="btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-rfq-page">
      <div className="rfq-container">
        <div className="rfq-header">
          <h1>Request for Quotation</h1>
          <p>Get competitive pricing from verified suppliers</p>
        </div>

        <div className="rfq-layout">
          {/* Main Form */}
          <div className="rfq-form-section">
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="form-error-banner">
                  {errors.submit}
                </div>
              )}

              {/* Product Info */}
              {product && (
                <div className="form-card product-summary">
                  <h3>Product Details</h3>
                  <div className="product-info-row">
                    <img src={product.image} alt={product.name} className="product-thumb" />
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p className="supplier-name">
                        By {product.supplierName}
                        {product.supplierVerified && (
                          <span className="verified-tag">✓ Verified</span>
                        )}
                      </p>
                      <p className="moq-info">MOQ: {product.moq} {product.unit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity & Pricing */}
              <div className="form-card">
                <h3>Order Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity *</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder={product ? `Min: ${product.moq}` : 'Enter quantity'}
                        min={product?.moq || 1}
                        className={errors.quantity ? 'error' : ''}
                      />
                      <span className="unit">{product?.unit || 'pieces'}</span>
                    </div>
                    {errors.quantity && <span className="field-error">{errors.quantity}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="targetPrice">Target Price (Optional)</label>
                    <div className="input-with-unit">
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="currency-select"
                      >
                        <option value="USD">$</option>
                        <option value="EUR">€</option>
                        <option value="GBP">£</option>
                      </select>
                      <input
                        type="number"
                        id="targetPrice"
                        name="targetPrice"
                        value={formData.targetPrice}
                        onChange={handleChange}
                        placeholder="Your target price per unit"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Bulk Pricing Preview */}
                {product?.bulkPricing && (
                  <div className="bulk-pricing-info">
                    <h4>Volume Pricing</h4>
                    <div className="pricing-tiers">
                      {product.bulkPricing.map((tier, index) => (
                        <div 
                          key={index} 
                          className={`tier ${formData.quantity >= tier.minQty && (tier.maxQty === null || formData.quantity <= tier.maxQty) ? 'active' : ''}`}
                        >
                          <span className="tier-qty">
                            {tier.minQty}{tier.maxQty ? `-${tier.maxQty}` : '+'}
                          </span>
                          <span className="tier-price">${tier.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Details */}
              <div className="form-card">
                <h3>Delivery Information</h3>
                
                <div className="form-group">
                  <label htmlFor="deliveryLocation">Delivery Location *</label>
                  <input
                    type="text"
                    id="deliveryLocation"
                    name="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    placeholder="City, State/Province, Country"
                    className={errors.deliveryLocation ? 'error' : ''}
                  />
                  {errors.deliveryLocation && <span className="field-error">{errors.deliveryLocation}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="deliveryDate">Expected Delivery Date *</label>
                  <input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.deliveryDate ? 'error' : ''}
                  />
                  {errors.deliveryDate && <span className="field-error">{errors.deliveryDate}</span>}
                  {product?.leadTime && (
                    <span className="field-hint">Typical lead time: {product.leadTime}</span>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="form-card">
                <h3>Additional Requirements</h3>
                
                <div className="form-group">
                  <label htmlFor="requirements">Detailed Requirements (Optional)</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Describe any specific requirements such as:
• Custom packaging or branding
• Color preferences
• Material specifications
• Quality certifications needed
• Other special requirements"
                    rows={6}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Quote Request'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="rfq-sidebar">
            {/* Supplier Info */}
            {supplier && (
              <div className="sidebar-card supplier-card">
                <div className="supplier-header">
                  <img src={supplier.logo} alt={supplier.companyName} className="supplier-logo" />
                  <div>
                    <h4>{supplier.companyName}</h4>
                    {supplier.verified && (
                      <span className={`verified-badge ${supplier.verificationLevel}`}>
                        ✓ {supplier.verificationLevel} Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="supplier-stats">
                  <div className="stat">
                    <span className="stat-value">{supplier.responseTime}</span>
                    <span className="stat-label">Response Time</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{supplier.onTimeDelivery}%</span>
                    <span className="stat-label">On-Time</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{supplier.qualityScore}</span>
                    <span className="stat-label">Quality</span>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Total */}
            {product && formData.quantity >= product.moq && (
              <div className="sidebar-card estimate-card">
                <h4>Estimated Total</h4>
                <div className="estimate-row">
                  <span>Unit Price</span>
                  <span>${getBulkPrice(formData.quantity)}</span>
                </div>
                <div className="estimate-row">
                  <span>Quantity</span>
                  <span>{formData.quantity} {product.unit}</span>
                </div>
                <div className="estimate-row total">
                  <span>Subtotal</span>
                  <span>${(getBulkPrice(formData.quantity) * formData.quantity).toLocaleString()}</span>
                </div>
                <p className="estimate-note">* Final price may vary based on supplier quote</p>
              </div>
            )}

            {/* Help */}
            <div className="sidebar-card help-card">
              <h4>Need Help?</h4>
              <p>Our sourcing specialists can help you find the right supplier.</p>
              <Link to="/help" className="help-link">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRFQPage;
