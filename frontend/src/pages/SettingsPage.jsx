import React, { useState, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import './SettingsPage.css'

const SettingsPage = () => {
  const { settings, updateSetting, updateCategory, resetSettings, exportSettings, importSettings } = useSettings()
  const { addToast } = useToast()
  const { user, isAuthenticated, updateProfile } = useAuth()
  const { 
    permission, 
    requestPermission, 
    addNotification, 
    notifications, 
    unreadCount,
    markAllAsRead,
    clearAllNotifications,
    notifyPromotion,
    notifyPriceDrop
  } = useNotifications()
  const [activeSection, setActiveSection] = useState('appearance')
  const fileInputRef = useRef(null)
  
  // Privacy & Security modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Mock session data
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Nairobi, Kenya', lastActive: 'Now', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Nairobi, Kenya', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Firefox on MacOS', location: 'Mombasa, Kenya', lastActive: '1 day ago', current: false }
  ])
  
  // Mock login history
  const [loginHistory] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Nairobi, Kenya', time: 'Today at 10:30 AM', status: 'success' },
    { id: 2, device: 'Safari on iPhone', location: 'Nairobi, Kenya', time: 'Yesterday at 8:15 PM', status: 'success' },
    { id: 3, device: 'Unknown Device', location: 'Lagos, Nigeria', time: 'Jan 28, 2026 at 3:45 AM', status: 'blocked' },
    { id: 4, device: 'Chrome on Windows', location: 'Nairobi, Kenya', time: 'Jan 27, 2026 at 9:00 AM', status: 'success' }
  ])

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'shopping', label: 'Shopping Preferences', icon: '🛒' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'data', label: 'Data & Export', icon: '📁' }
  ]

  const handleToggle = (category, key) => {
    updateSetting(category, key, !settings[category][key])
    addToast('Settings updated', 'success')
  }

  const handleSelect = (category, key, value) => {
    if (category) {
      updateSetting(category, key, value)
    } else {
      updateSetting(null, key, value)
    }
    addToast('Settings updated', 'success')
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings()
      addToast('Settings reset to defaults', 'success')
    }
  }

  const handleExport = () => {
    exportSettings()
    addToast('Settings exported successfully', 'success')
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const success = importSettings(event.target.result)
        if (success) {
          addToast('Settings imported successfully', 'success')
        } else {
          addToast('Failed to import settings', 'error')
        }
      }
      reader.readAsText(file)
    }
  }

  const renderAppearance = () => (
    <div className="settings-section">
      <h3>Appearance Settings</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <div className="setting-info">
            <label>Theme</label>
            <p>Choose your preferred color theme</p>
          </div>
          <div className="theme-options">
            {['light', 'dark', 'system'].map(theme => (
              <button
                key={theme}
                className={`theme-btn ${settings.theme === theme ? 'active' : ''}`}
                onClick={() => handleSelect(null, 'theme', theme)}
              >
                {theme === 'light' && '☀️'}
                {theme === 'dark' && '🌙'}
                {theme === 'system' && '💻'}
                <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Accent Color</label>
            <p>Choose your preferred accent color</p>
          </div>
          <div className="color-options">
            {[
              { value: '#007bff', name: 'Blue' },
              { value: '#28a745', name: 'Green' },
              { value: '#dc3545', name: 'Red' },
              { value: '#fd7e14', name: 'Orange' },
              { value: '#6f42c1', name: 'Purple' },
              { value: '#e83e8c', name: 'Pink' }
            ].map(color => (
              <button
                key={color.value}
                className={`color-btn ${settings.accentColor === color.value ? 'active' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleSelect(null, 'accentColor', color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Font Size</label>
            <p>Adjust the text size</p>
          </div>
          <select
            value={settings.fontSize}
            onChange={(e) => handleSelect(null, 'fontSize', e.target.value)}
            className="setting-select"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Currency</label>
            <p>Display prices in your preferred currency</p>
          </div>
          <select
            value={settings.currency}
            onChange={(e) => handleSelect(null, 'currency', e.target.value)}
            className="setting-select"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="KSH">KSH (KSh)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Language</label>
            <p>Select your preferred language</p>
          </div>
          <select
            value={settings.language}
            onChange={(e) => handleSelect(null, 'language', e.target.value)}
            className="setting-select"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      
      {/* Push Notification Permission */}
      <div className="setting-group">
        <h4>Push Notification Permission</h4>
        <div className="permission-status">
          <div className="permission-info">
            <span className={`permission-badge ${permission}`}>
              {permission === 'granted' ? '✅ Enabled' : permission === 'denied' ? '❌ Blocked' : '⚠️ Not Set'}
            </span>
            <p>
              {permission === 'granted' 
                ? 'You will receive browser notifications'
                : permission === 'denied'
                ? 'Notifications are blocked. Please enable in browser settings.'
                : 'Allow notifications to receive updates'}
            </p>
          </div>
          {permission !== 'granted' && permission !== 'denied' && (
            <button 
              className="enable-notifications-btn"
              onClick={async () => {
                const granted = await requestPermission()
                if (granted) {
                  addToast('Push notifications enabled!', 'success')
                } else {
                  addToast('Push notifications were not enabled', 'warning')
                }
              }}
            >
              🔔 Enable Notifications
            </button>
          )}
        </div>
        
        {/* Test Notification Button */}
        {permission === 'granted' && settings.notifications.push && (
          <div className="test-notification">
            <button 
              className="test-notification-btn"
              onClick={() => {
                notifyPromotion('🎉 Test Notification', 'This is a test notification from E-Com!')
                addToast('Test notification sent!', 'success')
              }}
            >
              📤 Send Test Notification
            </button>
          </div>
        )}
      </div>

      {/* Notification Stats */}
      <div className="setting-group">
        <h4>Notification Center</h4>
        <div className="notification-stats">
          <div className="stat-item">
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button className="action-btn" onClick={() => {
                markAllAsRead()
                addToast('All notifications marked as read', 'success')
              }}>
                ✓ Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="action-btn danger" onClick={() => {
                if (window.confirm('Clear all notifications?')) {
                  clearAllNotifications()
                  addToast('All notifications cleared', 'success')
                }
              }}>
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="setting-group">
        <h4>Notification Channels</h4>
        
        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Email Notifications</label>
            <p>Receive updates via email</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={() => handleToggle('notifications', 'email')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Push Notifications</label>
            <p>Receive browser push notifications</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={() => handleToggle('notifications', 'push')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>SMS Notifications</label>
            <p>Receive important updates via SMS</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.sms}
              onChange={() => handleToggle('notifications', 'sms')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-group">
        <h4>Notification Types</h4>
        
        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Order Updates</label>
            <p>Updates about your orders and deliveries</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.orderUpdates}
              onChange={() => handleToggle('notifications', 'orderUpdates')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Promotions & Deals</label>
            <p>Special offers and discounts</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.promotions}
              onChange={() => handleToggle('notifications', 'promotions')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Newsletter</label>
            <p>Weekly newsletter with curated products</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.newsletter}
              onChange={() => handleToggle('notifications', 'newsletter')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Price Drop Alerts</label>
            <p>Notify when wishlist items go on sale</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.priceDrops}
              onChange={() => handleToggle('notifications', 'priceDrops')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Back in Stock Alerts</label>
            <p>Notify when out-of-stock items are available</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notifications.backInStock}
              onChange={() => handleToggle('notifications', 'backInStock')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderPrivacy = () => (
    <div className="settings-section">
      <h3>Privacy & Security</h3>
      
      <div className="setting-group">
        <h4>Privacy Settings</h4>
        
        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Show Online Status</label>
            <p>Let others see when you're online</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.privacy.showOnlineStatus}
              onChange={() => handleToggle('privacy', 'showOnlineStatus')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Public Wishlist</label>
            <p>Allow others to view your wishlist</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.privacy.shareWishlist}
              onChange={() => handleToggle('privacy', 'shareWishlist')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Personalized Ads</label>
            <p>Show ads based on your interests</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.privacy.personalizedAds}
              onChange={() => handleToggle('privacy', 'personalizedAds')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Data Collection</label>
            <p>Allow collection of usage data to improve services</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.privacy.dataCollection}
              onChange={() => handleToggle('privacy', 'dataCollection')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-group">
        <h4>Security Settings</h4>
        
        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Two-Factor Authentication</label>
            <p>Add an extra layer of security to your account</p>
            {settings.privacy.twoFactorAuth && (
              <span className="security-badge enabled">✓ Enabled</span>
            )}
          </div>
          <button 
            className={`setting-btn ${settings.privacy.twoFactorAuth ? 'secondary' : 'primary'}`}
            onClick={() => setShow2FAModal(true)}
          >
            {settings.privacy.twoFactorAuth ? 'Manage 2FA' : 'Enable 2FA'}
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Change Password</label>
            <p>Update your account password</p>
          </div>
          <button className="setting-btn" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Active Sessions</label>
            <p>View and manage your active sessions ({sessions.length} active)</p>
          </div>
          <button className="setting-btn" onClick={() => setShowSessionsModal(true)}>
            View Sessions
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Login History</label>
            <p>View your recent login activity</p>
          </div>
          <button className="setting-btn" onClick={() => setShowHistoryModal(true)}>
            View History
          </button>
        </div>
      </div>

      <div className="setting-group danger-zone">
        <h4>⚠️ Danger Zone</h4>
        
        <div className="setting-item">
          <div className="setting-info">
            <label>Download Your Data</label>
            <p>Get a copy of all your personal data</p>
          </div>
          <button 
            className="setting-btn"
            onClick={() => {
              const data = {
                user: user,
                settings: settings,
                exportDate: new Date().toISOString()
              }
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'my-data-export.json'
              a.click()
              addToast('Your data has been downloaded', 'success')
            }}
          >
            Download Data
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Delete Account</label>
            <p>Permanently delete your account and all data</p>
          </div>
          <button className="setting-btn danger" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔐 Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button 
                className="btn-primary"
                onClick={() => {
                  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
                    addToast('Please fill in all fields', 'error')
                    return
                  }
                  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                    addToast('Passwords do not match', 'error')
                    return
                  }
                  if (passwordForm.newPassword.length < 6) {
                    addToast('Password must be at least 6 characters', 'error')
                    return
                  }
                  // Mock password change
                  addToast('Password changed successfully!', 'success')
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setShowPasswordModal(false)
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div className="modal-overlay" onClick={() => setShowSessionsModal(false)}>
          <div className="modal-content wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📱 Active Sessions</h3>
              <button className="modal-close" onClick={() => setShowSessionsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="sessions-list">
                {sessions.map(session => (
                  <div key={session.id} className={`session-item ${session.current ? 'current' : ''}`}>
                    <div className="session-icon">
                      {session.device.includes('Chrome') ? '🌐' : 
                       session.device.includes('Safari') ? '🍎' : 
                       session.device.includes('Firefox') ? '🦊' : '💻'}
                    </div>
                    <div className="session-info">
                      <strong>{session.device}</strong>
                      <span>{session.location} • {session.lastActive}</span>
                      {session.current && <span className="current-badge">This device</span>}
                    </div>
                    {!session.current && (
                      <button 
                        className="revoke-btn"
                        onClick={() => addToast(`Session on ${session.device} revoked`, 'success')}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-danger"
                onClick={() => {
                  addToast('All other sessions have been revoked', 'success')
                  setShowSessionsModal(false)
                }}
              >
                Revoke All Other Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Login History</h3>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="history-list">
                {loginHistory.map(entry => (
                  <div key={entry.id} className={`history-item ${entry.status}`}>
                    <div className="history-status">
                      {entry.status === 'success' ? '✅' : '🚫'}
                    </div>
                    <div className="history-info">
                      <strong>{entry.device}</strong>
                      <span>{entry.location}</span>
                      <span className="history-time">{entry.time}</span>
                    </div>
                    <span className={`status-badge ${entry.status}`}>
                      {entry.status === 'success' ? 'Successful' : 'Blocked'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔒 Two-Factor Authentication</h3>
              <button className="modal-close" onClick={() => setShow2FAModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {settings.privacy.twoFactorAuth ? (
                <div className="twofa-enabled">
                  <div className="twofa-status">
                    <span className="status-icon">✅</span>
                    <h4>2FA is Enabled</h4>
                    <p>Your account is protected with two-factor authentication</p>
                  </div>
                  <div className="twofa-options">
                    <button className="btn-secondary" onClick={() => {
                      addToast('Recovery codes downloaded', 'success')
                    }}>
                      📥 Download Recovery Codes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="twofa-setup">
                  <div className="twofa-step">
                    <span className="step-number">1</span>
                    <div>
                      <h4>Download an Authenticator App</h4>
                      <p>We recommend Google Authenticator or Authy</p>
                    </div>
                  </div>
                  <div className="twofa-step">
                    <span className="step-number">2</span>
                    <div>
                      <h4>Scan the QR Code</h4>
                      <div className="qr-placeholder">
                        <div className="qr-code">📱 QR Code</div>
                        <p className="manual-code">Or enter manually: <code>ABCD-EFGH-IJKL-MNOP</code></p>
                      </div>
                    </div>
                  </div>
                  <div className="twofa-step">
                    <span className="step-number">3</span>
                    <div>
                      <h4>Enter Verification Code</h4>
                      <input type="text" placeholder="000000" maxLength={6} className="verification-input" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShow2FAModal(false)}>Cancel</button>
              {settings.privacy.twoFactorAuth ? (
                <button 
                  className="btn-danger"
                  onClick={() => {
                    handleToggle('privacy', 'twoFactorAuth')
                    addToast('2FA has been disabled', 'warning')
                    setShow2FAModal(false)
                  }}
                >
                  Disable 2FA
                </button>
              ) : (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    handleToggle('privacy', 'twoFactorAuth')
                    addToast('2FA has been enabled!', 'success')
                    setShow2FAModal(false)
                  }}
                >
                  Enable 2FA
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header danger">
              <h3>⚠️ Delete Account</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <p><strong>This action cannot be undone.</strong></p>
                <p>Deleting your account will permanently remove:</p>
                <ul>
                  <li>Your profile and personal information</li>
                  <li>Order history and invoices</li>
                  <li>Wishlist and saved items</li>
                  <li>All settings and preferences</li>
                </ul>
                <div className="form-group">
                  <label>Type "DELETE" to confirm</label>
                  <input type="text" placeholder="DELETE" id="delete-confirm" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button 
                className="btn-danger"
                onClick={() => {
                  const input = document.getElementById('delete-confirm')
                  if (input.value === 'DELETE') {
                    addToast('Account deletion request submitted', 'success')
                    setShowDeleteModal(false)
                  } else {
                    addToast('Please type DELETE to confirm', 'error')
                  }
                }}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderShopping = () => (
    <div className="settings-section">
      <h3>Shopping Preferences</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <div className="setting-info">
            <label>Default Shipping Method</label>
            <p>Your preferred shipping option</p>
          </div>
          <select
            value={settings.shopping.defaultShippingMethod}
            onChange={(e) => handleSelect('shopping', 'defaultShippingMethod', e.target.value)}
            className="setting-select"
          >
            <option value="standard">Standard (5-7 days)</option>
            <option value="express">Express (2-3 days)</option>
            <option value="overnight">Overnight</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Items Per Page</label>
            <p>Number of products to show per page</p>
          </div>
          <select
            value={settings.shopping.itemsPerPage}
            onChange={(e) => handleSelect('shopping', 'itemsPerPage', parseInt(e.target.value))}
            className="setting-select"
          >
            <option value="12">12 items</option>
            <option value="24">24 items</option>
            <option value="36">36 items</option>
            <option value="48">48 items</option>
          </select>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Save Payment Information</label>
            <p>Securely save payment methods for faster checkout</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.shopping.savePaymentInfo}
              onChange={() => handleToggle('shopping', 'savePaymentInfo')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Auto-Apply Coupons</label>
            <p>Automatically apply available coupons at checkout</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.shopping.autoApplyCoupons}
              onChange={() => handleToggle('shopping', 'autoApplyCoupons')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Show Out of Stock Items</label>
            <p>Display products that are currently unavailable</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.shopping.showOutOfStock}
              onChange={() => handleToggle('shopping', 'showOutOfStock')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderAccessibility = () => (
    <div className="settings-section">
      <h3>Accessibility</h3>
      
      <div className="setting-group">
        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Reduce Motion</label>
            <p>Minimize animations and transitions</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.accessibility.reduceMotion}
              onChange={() => handleToggle('accessibility', 'reduceMotion')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>High Contrast</label>
            <p>Increase contrast for better visibility</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.accessibility.highContrast}
              onChange={() => handleToggle('accessibility', 'highContrast')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Screen Reader Optimized</label>
            <p>Optimize content for screen readers</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.accessibility.screenReaderOptimized}
              onChange={() => handleToggle('accessibility', 'screenReaderOptimized')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item toggle-item">
          <div className="setting-info">
            <label>Keyboard Navigation</label>
            <p>Enhanced keyboard navigation support</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.accessibility.keyboardNavigation}
              onChange={() => handleToggle('accessibility', 'keyboardNavigation')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderData = () => (
    <div className="settings-section">
      <h3>Data & Export</h3>
      
      <div className="setting-group">
        <div className="setting-item">
          <div className="setting-info">
            <label>Export Settings</label>
            <p>Download your settings as a JSON file</p>
          </div>
          <button className="setting-btn" onClick={handleExport}>
            Export Settings
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Import Settings</label>
            <p>Load settings from a JSON file</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button className="setting-btn" onClick={() => fileInputRef.current.click()}>
            Import Settings
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Reset All Settings</label>
            <p>Restore all settings to their default values</p>
          </div>
          <button className="setting-btn danger" onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Download My Data</label>
            <p>Request a copy of all your personal data</p>
          </div>
          <button className="setting-btn" onClick={() => addToast('Data request submitted. You will receive an email shortly.', 'success')}>
            Request Data
          </button>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Delete Account</label>
            <p>Permanently delete your account and all data</p>
          </div>
          <button className="setting-btn danger" onClick={() => addToast('Please contact support to delete your account.', 'info')}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearance()
      case 'notifications':
        return renderNotifications()
      case 'privacy':
        return renderPrivacy()
      case 'shopping':
        return renderShopping()
      case 'accessibility':
        return renderAccessibility()
      case 'data':
        return renderData()
      default:
        return renderAppearance()
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your preferences and account settings</p>
        </div>

        <div className="settings-layout">
          <nav className="settings-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </nav>

          <main className="settings-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
