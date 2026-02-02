import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSettings } from './SettingsContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { settings } = useSettings()
  const [notifications, setNotifications] = useState([])
  const [permission, setPermission] = useState('default')
  const [unreadCount, setUnreadCount] = useState(0)

  // Check and request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Request push notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  // Send push notification (browser notification)
  const sendPushNotification = useCallback((title, options = {}) => {
    if (!settings.notifications.push) {
      console.log('Push notifications disabled in settings')
      return
    }

    if (permission !== 'granted') {
      console.log('Push notification permission not granted')
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
        if (options.onClick) options.onClick()
      }

      return notification
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }, [settings.notifications.push, permission])

  // Add in-app notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)

    // Send push notification if enabled and type matches settings
    if (settings.notifications.push && permission === 'granted') {
      const shouldPush = 
        (notification.type === 'order' && settings.notifications.orderUpdates) ||
        (notification.type === 'promotion' && settings.notifications.promotions) ||
        (notification.type === 'priceDrops' && settings.notifications.priceDrops) ||
        (notification.type === 'backInStock' && settings.notifications.backInStock) ||
        (notification.type === 'general')

      if (shouldPush) {
        sendPushNotification(notification.title, {
          body: notification.message,
          tag: notification.id?.toString()
        })
      }
    }

    return newNotification
  }, [settings.notifications, permission, sendPushNotification])

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1))
      }
      return prev.filter(n => n.id !== notificationId)
    })
  }, [])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Notification helpers for different types
  const notifyOrderUpdate = useCallback((orderId, status, message) => {
    if (!settings.notifications.orderUpdates) return

    addNotification({
      type: 'order',
      title: `Order ${orderId} - ${status}`,
      message: message || `Your order status has been updated to: ${status}`,
      icon: '📦'
    })
  }, [settings.notifications.orderUpdates, addNotification])

  const notifyPromotion = useCallback((title, message) => {
    if (!settings.notifications.promotions) return

    addNotification({
      type: 'promotion',
      title: title || '🎉 Special Offer!',
      message,
      icon: '🎁'
    })
  }, [settings.notifications.promotions, addNotification])

  const notifyPriceDrop = useCallback((productName, oldPrice, newPrice) => {
    if (!settings.notifications.priceDrops) return

    addNotification({
      type: 'priceDrops',
      title: '💰 Price Drop Alert!',
      message: `${productName} dropped from $${oldPrice} to $${newPrice}!`,
      icon: '💰'
    })
  }, [settings.notifications.priceDrops, addNotification])

  const notifyBackInStock = useCallback((productName) => {
    if (!settings.notifications.backInStock) return

    addNotification({
      type: 'backInStock',
      title: '✅ Back in Stock!',
      message: `${productName} is now available!`,
      icon: '✅'
    })
  }, [settings.notifications.backInStock, addNotification])

  // Activity notifications
  const notifyCartAdd = useCallback((productName) => {
    addNotification({
      type: 'cart',
      title: '🛒 Added to Cart',
      message: `${productName} has been added to your cart`,
      icon: '🛒'
    })
  }, [addNotification])

  const notifyCartRemove = useCallback((productName) => {
    addNotification({
      type: 'cart',
      title: '🗑️ Removed from Cart',
      message: `${productName} has been removed from your cart`,
      icon: '🗑️'
    })
  }, [addNotification])

  const notifyWishlistAdd = useCallback((productName) => {
    addNotification({
      type: 'wishlist',
      title: '❤️ Added to Wishlist',
      message: `${productName} has been saved to your wishlist`,
      icon: '❤️'
    })
  }, [addNotification])

  const notifyWishlistRemove = useCallback((productName) => {
    addNotification({
      type: 'wishlist',
      title: '💔 Removed from Wishlist',
      message: `${productName} has been removed from your wishlist`,
      icon: '💔'
    })
  }, [addNotification])

  const notifyCompareAdd = useCallback((productName) => {
    addNotification({
      type: 'compare',
      title: '⚖️ Added to Compare',
      message: `${productName} added to comparison list`,
      icon: '⚖️'
    })
  }, [addNotification])

  const notifyCheckout = useCallback((orderId, total) => {
    addNotification({
      type: 'order',
      title: '✅ Order Placed!',
      message: `Order #${orderId} for $${total.toFixed(2)} has been placed successfully`,
      icon: '✅'
    })
  }, [addNotification])

  const notifyLogin = useCallback((userName) => {
    addNotification({
      type: 'auth',
      title: '👋 Welcome Back!',
      message: `Successfully logged in as ${userName}`,
      icon: '👋'
    })
  }, [addNotification])

  const notifyRegister = useCallback((userName) => {
    addNotification({
      type: 'auth',
      title: '🎉 Account Created!',
      message: `Welcome to E-Com, ${userName}!`,
      icon: '🎉'
    })
  }, [addNotification])

  const notifyProfileUpdate = useCallback(() => {
    addNotification({
      type: 'profile',
      title: '✏️ Profile Updated',
      message: 'Your profile information has been updated',
      icon: '✏️'
    })
  }, [addNotification])

  const notifySearch = useCallback((query, resultsCount) => {
    addNotification({
      type: 'search',
      title: '🔍 Search Results',
      message: `Found ${resultsCount} results for "${query}"`,
      icon: '🔍'
    })
  }, [addNotification])

  // Load saved notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notifications')
    if (saved) {
      const parsed = JSON.parse(saved)
      setNotifications(parsed)
      setUnreadCount(parsed.filter(n => !n.read).length)
    }
  }, [])

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 50))) // Keep last 50
  }, [notifications])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      permission,
      requestPermission,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      sendPushNotification,
      // Original helpers
      notifyOrderUpdate,
      notifyPromotion,
      notifyPriceDrop,
      notifyBackInStock,
      // Activity helpers
      notifyCartAdd,
      notifyCartRemove,
      notifyWishlistAdd,
      notifyWishlistRemove,
      notifyCompareAdd,
      notifyCheckout,
      notifyLogin,
      notifyRegister,
      notifyProfileUpdate,
      notifySearch
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
