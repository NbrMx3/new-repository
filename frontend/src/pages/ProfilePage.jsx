import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import './ProfilePage.css'

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading, login, logout, register, updateProfile } = useAuth()
  const { wishlistItems } = useWishlist()
  const toast = useToast()
  const { notifyLogin, notifyRegister, notifyProfileUpdate } = useNotifications()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  
  // Profile edit state
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  // Profile picture state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = React.useRef(null)
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1) // 1: email, 2: code, 3: new password
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  // Mock orders data
  const orders = [
    {
      id: 'ORD-2024-001',
      date: 'Mar 15, 2024',
      total: 299.99,
      status: 'Delivered',
      items: 3
    },
    {
      id: 'ORD-2024-002',
      date: 'Mar 10, 2024',
      total: 149.50,
      status: 'Shipped',
      items: 2
    },
    {
      id: 'ORD-2024-003',
      date: 'Mar 5, 2024',
      total: 89.99,
      status: 'Processing',
      items: 1
    }
  ]

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields')
      return
    }
    
    setIsSubmitting(true)
    try {
      const loggedInUser = await login(loginForm.email, loginForm.password)
      toast.success('Welcome back!')
      notifyLogin(loggedInUser?.name || loginForm.email)
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setIsSubmitting(true)
    try {
      await register(registerForm)
      toast.success('Account created successfully!')
      notifyRegister(registerForm.name)
      setRegisterForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    toast.success('You have been logged out')
  }

  // Quick demo login
  const handleDemoLogin = async () => {
    setIsSubmitting(true)
    try {
      // Create demo account if it doesn't exist
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const demoExists = existingUsers.some(u => u.email === 'demo@example.com')
      
      if (!demoExists) {
        await register({
          name: 'Demo User',
          email: 'demo@example.com',
          phone: '+1234567890',
          password: 'demo123'
        })
      } else {
        await login('demo@example.com', 'demo123')
      }
      toast.success('Welcome! You are now logged in.')
    } catch (error) {
      // If registration fails (user exists), try login
      try {
        await login('demo@example.com', 'demo123')
        toast.success('Welcome back!')
      } catch (loginError) {
        toast.error('Quick login failed. Please try manual login.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle profile update
  const handleSaveProfile = () => {
    updateProfile(formData)
    setEditMode(false)
    toast.success('Profile updated successfully!')
    notifyProfileUpdate()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle profile picture upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      // Convert to base64 for localStorage storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        updateProfile({ avatar: base64String })
        toast.success('Profile picture updated!')
        setIsUploadingAvatar(false)
      }
      reader.onerror = () => {
        toast.error('Failed to upload image')
        setIsUploadingAvatar(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to upload image')
      setIsUploadingAvatar(false)
    }

    // Reset input
    e.target.value = ''
  }

  const handleRemoveAvatar = () => {
    updateProfile({ avatar: null })
    toast.success('Profile picture removed')
  }

  // Handle forgot password flow
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (forgotPasswordStep === 1) {
      // Step 1: Submit email
      if (!forgotPasswordEmail) {
        toast.error('Please enter your email address')
        return
      }
      
      // Check if email exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const userExists = existingUsers.find(u => u.email === forgotPasswordEmail)
      
      if (!userExists) {
        toast.error('No account found with this email')
        return
      }
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedCode(code)
      
      // In a real app, this would send an email
      toast.success(`Reset code sent to ${forgotPasswordEmail}`)
      console.log('Reset code (for demo):', code) // For testing
      
      // Show the code in an alert for demo purposes
      setTimeout(() => {
        alert(`Demo Mode: Your reset code is ${code}`)
      }, 500)
      
      setForgotPasswordStep(2)
    } else if (forgotPasswordStep === 2) {
      // Step 2: Verify code
      if (!resetCode) {
        toast.error('Please enter the reset code')
        return
      }
      
      if (resetCode !== generatedCode) {
        toast.error('Invalid reset code')
        return
      }
      
      toast.success('Code verified!')
      setForgotPasswordStep(3)
    } else if (forgotPasswordStep === 3) {
      // Step 3: Set new password
      if (!newPassword || !confirmNewPassword) {
        toast.error('Please fill in all fields')
        return
      }
      
      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      
      if (newPassword !== confirmNewPassword) {
        toast.error('Passwords do not match')
        return
      }
      
      // Update password in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const updatedUsers = existingUsers.map(u => {
        if (u.email === forgotPasswordEmail) {
          return { ...u, password: newPassword }
        }
        return u
      })
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
      
      toast.success('Password reset successfully! You can now login.')
      
      // Reset and close modal
      setShowForgotPassword(false)
      setForgotPasswordStep(1)
      setForgotPasswordEmail('')
      setResetCode('')
      setNewPassword('')
      setConfirmNewPassword('')
      setGeneratedCode('')
    }
  }

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep(1)
    setForgotPasswordEmail('')
    setResetCode('')
    setNewPassword('')
    setConfirmNewPassword('')
    setGeneratedCode('')
  }

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'delivered'
      case 'Shipped': return 'shipped'
      case 'Processing': return 'processing'
      case 'Cancelled': return 'cancelled'
      default: return ''
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login/register
  if (!isAuthenticated) {
    return (
      <>
      <div className="profile-page">
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-header">
              <h1>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
              <p>{authMode === 'login' 
                ? 'Sign in to access your account' 
                : 'Join us and start shopping'
              }</p>
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            {authMode === 'login' ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="forgot-password"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
                
                <button 
                  type="button"
                  className="quick-login-btn"
                  onClick={handleDemoLogin}
                  disabled={isSubmitting}
                >
                  ⚡ Quick Demo Login
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="form-options">
                  <label className="terms-agree">
                    <input type="checkbox" required />
                    <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
                  </label>
                </div>
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-login">
              <button className="social-btn google">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="social-btn facebook">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPasswordModal}>
          <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeForgotPasswordModal}>×</button>
            
            <div className="forgot-password-header">
              <h2>🔐 Reset Password</h2>
              <div className="step-indicator">
                <div className={`step ${forgotPasswordStep >= 1 ? 'active' : ''} ${forgotPasswordStep > 1 ? 'completed' : ''}`}>
                  <span className="step-number">1</span>
                  <span className="step-label">Email</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${forgotPasswordStep >= 2 ? 'active' : ''} ${forgotPasswordStep > 2 ? 'completed' : ''}`}>
                  <span className="step-number">2</span>
                  <span className="step-label">Verify</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${forgotPasswordStep >= 3 ? 'active' : ''}`}>
                  <span className="step-number">3</span>
                  <span className="step-label">Reset</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="forgot-password-form">
              {forgotPasswordStep === 1 && (
                <div className="forgot-step-content">
                  <p className="step-description">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>
                  <div className="forgot-actions">
                    <button type="button" className="cancel-btn" onClick={closeForgotPasswordModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Send Code
                    </button>
                  </div>
                </div>
              )}

              {forgotPasswordStep === 2 && (
                <div className="forgot-step-content">
                  <p className="step-description">
                    Enter the 6-digit verification code sent to <strong>{forgotPasswordEmail}</strong>
                  </p>
                  <div className="code-sent-notice">
                    <span className="notice-icon">📧</span>
                    <span>Check your email (and spam folder)</span>
                  </div>
                  <div className="input-group">
                    <label>Verification Code</label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                      className="code-input"
                    />
                  </div>
                  <div className="forgot-actions">
                    <button type="button" className="cancel-btn" onClick={() => setForgotPasswordStep(1)}>
                      Back
                    </button>
                    <button type="submit" className="submit-btn" disabled={resetCode.length !== 6}>
                      Verify Code
                    </button>
                  </div>
                </div>
              )}

              {forgotPasswordStep === 3 && (
                <div className="forgot-step-content">
                  <p className="step-description">
                    Create a new password for your account.
                  </p>
                  <div className="verified-notice">
                    <span className="notice-icon">✅</span>
                    <span>Email verified successfully!</span>
                  </div>
                  <div className="input-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      minLength={6}
                      required
                    />
                  </div>
                  {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="password-mismatch">Passwords do not match</p>
                  )}
                  <div className="forgot-actions">
                    <button type="button" className="cancel-btn" onClick={closeForgotPasswordModal}>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      </>
    )
  }

  // Authenticated - show profile
  const renderOverview = () => (
    <div className="profile-overview">
      <div className="welcome-banner">
        <h2>Welcome back, {user.name}! 👋</h2>
        <p>Here's what's happening with your account</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-info">
            <span className="stat-value">{wishlistItems.length}</span>
            <span className="stat-label">Wishlist Items</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-info">
            <span className="stat-value">{user.addresses?.length || 0}</span>
            <span className="stat-label">Saved Addresses</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-value">Gold</span>
            <span className="stat-label">Member Status</span>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h3>Recent Orders</h3>
        {orders.length > 0 ? (
          <>
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <span className="order-id">{order.id}</span>
                  <span className="order-date">{order.date}</span>
                </div>
                <div className="order-details">
                  <span className="order-items">{order.items} item(s)</span>
                  <span className="order-total">${order.total.toFixed(2)}</span>
                </div>
                <span className={`order-status ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            ))}
            <button className="view-all-btn" onClick={() => setActiveTab('orders')}>
              View All Orders
            </button>
          </>
        ) : (
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <Link to="/products" className="shop-now-btn">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="orders-section">
      <h3>Order History</h3>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">{order.id}</span>
                <span className="order-date">{order.date}</span>
              </div>
              <span className={`order-status ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="order-card-body">
              <div className="order-summary">
                <span>{order.items} item(s)</span>
                <span className="order-total">${order.total.toFixed(2)}</span>
              </div>
              <div className="order-actions">
                <button className="order-action-btn">Track Order</button>
                <button className="order-action-btn secondary">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="settings-section">
      <h3>Profile Settings</h3>
      <div className="settings-form">
        <div className="form-group">
          <label>Full Name</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          ) : (
            <p>{user.name}</p>
          )}
        </div>
        <div className="form-group">
          <label>Email Address</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          {editMode ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          ) : (
            <p>{user.phone || 'Not set'}</p>
          )}
        </div>
        <div className="form-actions">
          {editMode ? (
            <>
              <button className="save-btn" onClick={handleSaveProfile}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="password-section">
        <h4>Change Password</h4>
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" placeholder="Enter current password" />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" placeholder="Enter new password" />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" />
        </div>
        <button className="update-password-btn">Update Password</button>
      </div>
    </div>
  )

  const renderAddresses = () => (
    <div className="addresses-section">
      <div className="addresses-header">
        <h3>Saved Addresses</h3>
        <button className="add-address-btn">+ Add New Address</button>
      </div>
      <div className="addresses-grid">
        {(user.addresses || []).length > 0 ? (
          user.addresses.map(address => (
            <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              {address.isDefault && <span className="default-badge">Default</span>}
              <div className="address-type">{address.type}</div>
              <div className="address-details">
                <p className="address-name">{address.name}</p>
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>{address.country}</p>
              </div>
              <div className="address-actions">
                <button className="address-action-btn">Edit</button>
                <button className="address-action-btn delete">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-addresses">
            <p>You don't have any saved addresses yet</p>
            <button className="add-address-btn">+ Add Your First Address</button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar-container">
                <div className="avatar" onClick={handleAvatarClick}>
                  {isUploadingAvatar ? (
                    <div className="avatar-loading">
                      <span className="spinner"></span>
                    </div>
                  ) : user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span className="avatar-placeholder">
                      {user.name?.charAt(0) || 'U'}
                    </span>
                  )}
                  <div className="avatar-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span>Change</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                {user.avatar && (
                  <button className="remove-avatar-btn" onClick={handleRemoveAvatar} title="Remove photo">
                    ✕
                  </button>
                )}
              </div>
              <h2 className="user-name">{user.name}</h2>
              <p className="user-email">{user.email}</p>
              <p className="member-since">Member since {user.joinDate}</p>
            </div>

            <nav className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span className="nav-icon">📊</span>
                Overview
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span className="nav-icon">📦</span>
                My Orders
              </button>
              <button 
                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <span className="nav-icon">📍</span>
                Addresses
              </button>
              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="nav-icon">⚙️</span>
                Settings
              </button>
              <Link to="/wishlist" className="nav-item">
                <span className="nav-icon">❤️</span>
                Wishlist
              </Link>
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
              <span>🚪</span> Logout
            </button>
          </aside>

          {/* Main Content */}
          <main className="profile-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'addresses' && renderAddresses()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
