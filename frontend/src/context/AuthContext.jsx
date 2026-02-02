import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage and API on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('user')
      
      if (token && savedUser) {
        try {
          // Verify token is still valid by getting current user from API
          const currentUser = await api.auth.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }
    
    loadUser()
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  // Register new user
  const register = async (userData) => {
    try {
      const response = await api.auth.register({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password
      })
      
      // Save token
      localStorage.setItem('authToken', response.token)
      
      // Set user
      setUser(response.user)
      return response.user
    } catch (error) {
      throw error
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const response = await api.auth.login(email, password)
      
      // Save token
      localStorage.setItem('authToken', response.token)
      
      // Set user
      setUser(response.user)
      return response.user
    } catch (error) {
      throw error
    }
  }

  // Logout user
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await api.users.updateProfile(updates)
      setUser(response)
      return response
    } catch (error) {
      throw error
    }
  }

  // Add address
  const addAddress = async (address) => {
    try {
      const response = await api.users.addAddress(address)
      // Refresh user data
      const currentUser = await api.auth.getCurrentUser()
      setUser(currentUser)
      return response
    } catch (error) {
      throw error
    }
  }

  // Update address
  const updateAddress = async (addressId, updates) => {
    try {
      const response = await api.users.updateAddress(addressId, updates)
      // Refresh user data
      const currentUser = await api.auth.getCurrentUser()
      setUser(currentUser)
      return response
    } catch (error) {
      throw error
    }
  }

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      await api.users.deleteAddress(addressId)
      // Refresh user data
      const currentUser = await api.auth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      throw error
    }
  }

  // Set default address
  const setDefaultAddress = async (addressId) => {
    try {
      await api.users.updateAddress(addressId, { isDefault: true })
      // Refresh user data
      const currentUser = await api.auth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      throw error
    }
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      register,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
