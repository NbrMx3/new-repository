import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  // Load settings from localStorage or use defaults
  const getInitialSettings = () => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      // Appearance
      theme: 'light', // 'light', 'dark', 'system'
      accentColor: '#007bff', // Primary color
      fontSize: 'medium', // 'small', 'medium', 'large'
      
      // Currency & Language
      currency: 'USD', // 'USD', 'EUR', 'GBP', 'KSH'
      language: 'en', // 'en', 'es', 'fr', 'de'
      
      // Notifications
      notifications: {
        email: true,
        push: true,
        sms: false,
        orderUpdates: true,
        promotions: true,
        newsletter: false,
        priceDrops: true,
        backInStock: true
      },
      
      // Privacy
      privacy: {
        showOnlineStatus: true,
        shareWishlist: false,
        personalizedAds: true,
        dataCollection: true,
        twoFactorAuth: false
      },
      
      // Shopping Preferences
      shopping: {
        defaultShippingMethod: 'standard', // 'standard', 'express', 'overnight'
        savePaymentInfo: true,
        autoApplyCoupons: true,
        showOutOfStock: true,
        itemsPerPage: 12 // 12, 24, 36, 48
      },
      
      // Accessibility
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        screenReaderOptimized: false,
        keyboardNavigation: true
      }
    }
  }

  const [settings, setSettings] = useState(getInitialSettings)

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', settings.theme)
    
    // Apply font size
    document.documentElement.setAttribute('data-font-size', settings.fontSize)
    
    // Apply accent color
    document.documentElement.style.setProperty('--accent-color', settings.accentColor)
    
    // Apply accessibility settings
    if (settings.accessibility.reduceMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
    
    if (settings.accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [settings])

  // Currency formatting
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KSH: 'KSh'
  }

  const formatPrice = (price) => {
    const symbol = currencySymbols[settings.currency] || '$'
    const rates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      KSH: 153.50
    }
    const convertedPrice = price * (rates[settings.currency] || 1)
    
    if (settings.currency === 'KSH') {
      return `${symbol}${convertedPrice.toFixed(0)}`
    }
    return `${symbol}${convertedPrice.toFixed(2)}`
  }

  // Update individual setting
  const updateSetting = (category, key, value) => {
    setSettings(prev => {
      if (category) {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value
          }
        }
      }
      return {
        ...prev,
        [key]: value
      }
    })
  }

  // Update entire category
  const updateCategory = (category, values) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...values
      }
    }))
  }

  // Reset to defaults
  const resetSettings = () => {
    localStorage.removeItem('appSettings')
    setSettings(getInitialSettings())
  }

  // Export settings
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'settings.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Import settings
  const importSettings = (settingsJson) => {
    try {
      const imported = JSON.parse(settingsJson)
      setSettings(prev => ({
        ...prev,
        ...imported
      }))
      return true
    } catch (e) {
      return false
    }
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      updateCategory,
      resetSettings,
      exportSettings,
      importSettings,
      formatPrice,
      currencySymbols
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsContext
