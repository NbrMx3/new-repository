import React from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import './ComparePage.css'

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  const handleAddToCart = (product) => {
    addToCart(product)
    showToast(`${product.name} added to cart!`, 'success')
  }

  if (compareItems.length === 0) {
    return (
      <div className="compare-page">
        <div className="container">
          <div className="empty-compare">
            <div className="empty-icon">⚖️</div>
            <h2>No Products to Compare</h2>
            <p>Add products to compare their features and specifications</p>
            <Link to="/products" className="browse-btn">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const allSpecs = [...new Set(compareItems.flatMap(item => 
    item.specifications ? Object.keys(item.specifications) : []
  ))]

  return (
    <div className="compare-page">
      <div className="container">
        <div className="compare-header">
          <h1>Compare Products</h1>
          <button className="clear-all-btn" onClick={clearCompare}>
            Clear All
          </button>
        </div>

        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="feature-column">Feature</th>
                {compareItems.map(item => (
                  <th key={item.id} className="product-column">
                    <button 
                      className="remove-compare-btn"
                      onClick={() => removeFromCompare(item.id)}
                    >
                      ✕
                    </button>
                    <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name} className="compare-product-img" />
                    </Link>
                    <h3 className="compare-product-name">{item.name}</h3>
                  </th>
                ))}
                {[...Array(4 - compareItems.length)].map((_, i) => (
                  <th key={`empty-${i}`} className="product-column empty-slot">
                    <Link to="/products" className="add-product-slot">
                      <span className="plus-icon">+</span>
                      <span>Add Product</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="price-row">
                <td className="feature-name">Price</td>
                {compareItems.map(item => (
                  <td key={item.id} className="feature-value price">
                    <span className="current-price">${item.price?.toFixed(2)}</span>
                    {item.originalPrice && (
                      <span className="original-price">${item.originalPrice?.toFixed(2)}</span>
                    )}
                  </td>
                ))}
                {[...Array(4 - compareItems.length)].map((_, i) => (
                  <td key={`empty-price-${i}`} className="feature-value empty"></td>
                ))}
              </tr>

              <tr>
                <td className="feature-name">Rating</td>
                {compareItems.map(item => (
                  <td key={item.id} className="feature-value rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(item.rating || 0) ? 'star filled' : 'star'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="rating-value">{item.rating?.toFixed(1) || 'N/A'}</span>
                  </td>
                ))}
                {[...Array(4 - compareItems.length)].map((_, i) => (
                  <td key={`empty-rating-${i}`} className="feature-value empty"></td>
                ))}
              </tr>

              <tr>
                <td className="feature-name">Category</td>
                {compareItems.map(item => (
                  <td key={item.id} className="feature-value">
                    {item.category || 'N/A'}
                  </td>
                ))}
                {[...Array(4 - compareItems.length)].map((_, i) => (
                  <td key={`empty-cat-${i}`} className="feature-value empty"></td>
                ))}
              </tr>

              <tr>
                <td className="feature-name">Availability</td>
                {compareItems.map(item => (
                  <td key={item.id} className="feature-value">
                    <span className={`stock-badge ${item.inStock !== false ? 'in-stock' : 'out-stock'}`}>
                      {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                ))}
                {[...Array(4 - compareItems.length)].map((_, i) => (
                  <td key={`empty-stock-${i}`} className="feature-value empty"></td>
                ))}
              </tr>

              {allSpecs.map(spec => (
                <tr key={spec}>
                  <td className="feature-name">{spec}</td>
                  {compareItems.map(item => (
                    <td key={item.id} className="feature-value">
                      {item.specifications?.[spec] || '—'}
                    </td>
                  ))}
                  {[...Array(4 - compareItems.length)].map((_, i) => (
                    <td key={`empty-${spec}-${i}`} className="feature-value empty"></td>
                  ))}
                </tr>
              ))}

              <tr className="action-row">
                <td className="feature-name"></td>
                {compareItems.map(item => (
                  <td key={item.id} className="feature-value">
                    <button 
                      className="compare-add-cart-btn"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.inStock === false}
                    >
                      Add to Cart
                    </button>
                  </td>
                ))}
                {[...Array(4 - compareItems.length)].map((_, i) => (
                  <td key={`empty-action-${i}`} className="feature-value empty"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ComparePage
