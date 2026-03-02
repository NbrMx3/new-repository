import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    // Supplier-specific fields
    businessLicense: '',
    productCategories: [],
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const productCategoryOptions = [
    'Electronics',
    'Clothing & Apparel',
    'Home & Garden',
    'Industrial Equipment',
    'Food & Beverages',
    'Health & Beauty',
    'Automotive',
    'Office Supplies',
    'Sports & Outdoors',
    'Toys & Games'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.role) {
        newErrors.role = 'Please select an account type';
      }
    }

    if (stepNum === 2) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (stepNum === 3) {
      if (!formData.company.trim()) {
        newErrors.company = 'Company name is required';
      }
      if (formData.role === 'supplier' && formData.productCategories.length === 0) {
        newErrors.productCategories = 'Please select at least one product category';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const result = await register(formData);
    if (result.success) {
      navigate('/');
    }
  };

  const renderRoleSelection = () => (
    <div className="role-selection">
      <h2>Choose your account type</h2>
      <p className="role-subtitle">Select how you want to use the marketplace</p>
      
      <div className="role-options">
        <label 
          className={`role-card ${formData.role === 'buyer' ? 'selected' : ''}`}
        >
          <input
            type="radio"
            name="role"
            value="buyer"
            checked={formData.role === 'buyer'}
            onChange={handleChange}
          />
          <div className="role-icon buyer-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h3>Buyer</h3>
          <p>Source products from verified suppliers worldwide</p>
          <ul className="role-benefits">
            <li>Browse thousands of products</li>
            <li>Request quotes from suppliers</li>
            <li>Secure payment protection</li>
            <li>Track orders easily</li>
          </ul>
        </label>

        <label 
          className={`role-card ${formData.role === 'supplier' ? 'selected' : ''}`}
        >
          <input
            type="radio"
            name="role"
            value="supplier"
            checked={formData.role === 'supplier'}
            onChange={handleChange}
          />
          <div className="role-icon supplier-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <h3>Supplier</h3>
          <p>Sell your products to global buyers</p>
          <ul className="role-benefits">
            <li>Reach millions of buyers</li>
            <li>Manage product listings</li>
            <li>Receive RFQs directly</li>
            <li>Build your brand presence</li>
          </ul>
        </label>
      </div>
      
      {errors.role && <span className="field-error">{errors.role}</span>}
    </div>
  );

  const renderAccountDetails = () => (
    <div className="account-details">
      <h2>Create your account</h2>
      <p className="form-subtitle">
        {formData.role === 'buyer' ? 'Start sourcing products today' : 'Start selling to global buyers'}
      </p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className="password-requirements">
        <p>Password must contain:</p>
        <ul>
          <li className={formData.password.length >= 8 ? 'met' : ''}>
            At least 8 characters
          </li>
        </ul>
      </div>
    </div>
  );

  const renderBusinessDetails = () => (
    <div className="business-details">
      <h2>Business Information</h2>
      <p className="form-subtitle">Tell us about your business</p>

      <div className="form-group">
        <label htmlFor="company">Company Name *</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Enter your company name"
          className={errors.company ? 'error' : ''}
        />
        {errors.company && <span className="field-error">{errors.company}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />
      </div>

      {formData.role === 'supplier' && (
        <>
          <div className="form-group">
            <label htmlFor="businessLicense">Business License Number</label>
            <input
              type="text"
              id="businessLicense"
              name="businessLicense"
              value={formData.businessLicense}
              onChange={handleChange}
              placeholder="Enter your business license number"
            />
          </div>

          <div className="form-group">
            <label>Product Categories *</label>
            <p className="field-hint">Select the categories you plan to sell in</p>
            <div className="category-grid">
              {productCategoryOptions.map(category => (
                <label 
                  key={category}
                  className={`category-tag ${formData.productCategories.includes(category) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.productCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
            {errors.productCategories && <span className="field-error">{errors.productCategories}</span>}
          </div>
        </>
      )}

      <div className="form-group terms-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
          />
          <span>
            I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>
          </span>
        </label>
        {errors.agreeToTerms && <span className="field-error">{errors.agreeToTerms}</span>}
      </div>
    </div>
  );

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-to-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </Link>
          <h1>Join Our B2B Marketplace</h1>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Account Type</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Account Details</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Business Info</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {step === 1 && renderRoleSelection()}
          {step === 2 && renderAccountDetails()}
          {step === 3 && renderBusinessDetails()}

          <div className="form-actions">
            {step > 1 && (
              <button type="button" className="back-btn" onClick={handleBack}>
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" className="auth-submit-btn" onClick={handleNext}>
                Continue
              </button>
            ) : (
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'Create Account'
                )}
              </button>
            )}
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
