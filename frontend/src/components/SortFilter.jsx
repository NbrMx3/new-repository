import React, { useState } from 'react'
import './SortFilter.css'

const SortFilter = ({ 
  onSortChange, 
  onFilterChange, 
  totalProducts = 0,
  currentSort = 'featured',
  priceRange = { min: 0, max: 1000 },
  selectedPriceRange = { min: 0, max: 1000 },
  categories = [],
  selectedCategory = ''
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState(selectedPriceRange)

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ]

  const handlePriceChange = (type, value) => {
    const newRange = { ...localPriceRange, [type]: Number(value) }
    setLocalPriceRange(newRange)
  }

  const applyPriceFilter = () => {
    onFilterChange({ priceRange: localPriceRange })
  }

  return (
    <div className="sort-filter">
      <div className="sort-filter-top">
        <div className="results-count">
          <span className="count">{totalProducts}</span> products found
        </div>

        <div className="sort-filter-actions">
          <button 
            className={`filter-toggle ${isFilterOpen ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            Filters
          </button>

          <div className="sort-dropdown">
            <label>Sort by:</label>
            <select 
              value={currentSort} 
              onChange={(e) => onSortChange(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      <div className={`filter-panel ${isFilterOpen ? 'open' : ''}`}>
        <div className="filter-section">
          <h4>Category</h4>
          <div className="category-options">
            <button 
              className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => onFilterChange({ category: '' })}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => onFilterChange({ category: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Price Range</h4>
          <div className="price-inputs">
            <div className="price-input">
              <label>Min</label>
              <input 
                type="number" 
                value={localPriceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                min={priceRange.min}
                max={priceRange.max}
              />
            </div>
            <span className="price-separator">—</span>
            <div className="price-input">
              <label>Max</label>
              <input 
                type="number" 
                value={localPriceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                min={priceRange.min}
                max={priceRange.max}
              />
            </div>
            <button className="apply-price-btn" onClick={applyPriceFilter}>
              Apply
            </button>
          </div>
          <div className="price-range-slider">
            <input 
              type="range" 
              min={priceRange.min}
              max={priceRange.max}
              value={localPriceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="range-min"
            />
            <input 
              type="range" 
              min={priceRange.min}
              max={priceRange.max}
              value={localPriceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="range-max"
            />
          </div>
        </div>

        <div className="filter-section">
          <h4>Rating</h4>
          <div className="rating-options">
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className="rating-option">
                <input 
                  type="radio" 
                  name="rating" 
                  onChange={() => onFilterChange({ minRating: rating })}
                />
                <span className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rating ? 'star filled' : 'star'}>★</span>
                  ))}
                </span>
                <span className="rating-text">& up</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-actions">
          <button 
            className="clear-filters-btn"
            onClick={() => onFilterChange({ reset: true })}
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default SortFilter
