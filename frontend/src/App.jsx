import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SupplierDashboard from './pages/SupplierDashboard'
import SupplierProfile from './pages/SupplierProfile'
import CreateRFQPage from './pages/CreateRFQPage'
import MyRFQsPage from './pages/MyRFQsPage'
import MessagesPage from './pages/MessagesPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Supplier Routes */}
                <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
                <Route path="/supplier/:id" element={<SupplierProfile />} />
                {/* RFQ Routes */}
                <Route path="/rfq/create/:productId" element={<CreateRFQPage />} />
                <Route path="/rfq/create" element={<CreateRFQPage />} />
                <Route path="/my-rfqs" element={<MyRFQsPage />} />
                {/* Messaging */}
                <Route path="/messages" element={<MessagesPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
