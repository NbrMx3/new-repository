import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
import { ThemeProvider } from './context/ThemeContext'
import { CompareProvider } from './context/CompareContext'
import { SettingsProvider } from './context/SettingsContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Header from './components/Header'
import Footer from './components/Footer'
import PromoBanner from './components/PromoBanner'
import ChatBot from './components/ChatBot'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import SearchPage from './pages/SearchPage'
import WishlistPage from './pages/WishlistPage'
import DealsPage from './pages/DealsPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ComparePage from './pages/ComparePage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <ThemeProvider>
            <ToastProvider>
              <CartProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    <CompareProvider>
                      <Router>
                        <div className="app">
                          <PromoBanner />
                          <Header />
                          <main className="main-content">
                            <Routes>
                              {/* Public routes - accessible without login */}
                              <Route path="/" element={<HomePage />} />
                              <Route path="/profile" element={<ProfilePage />} />
                              <Route path="/cart" element={<CartPage />} />
                              
                              {/* Protected routes - require login */}
                              <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                              <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
                            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                            <Route path="/deals" element={<ProtectedRoute><DealsPage /></ProtectedRoute>} />
                            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                            <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                            <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                            <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </main>
                          <Footer />
                          <ChatBot />
                        </div>
                      </Router>
                    </CompareProvider>
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </CartProvider>
            </ToastProvider>
          </ThemeProvider>
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
