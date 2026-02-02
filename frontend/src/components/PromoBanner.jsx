import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './PromoBanner.css'

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true)

  const promos = [
    { text: '🔥 Flash Sale! Up to 50% off on Electronics', link: '/deals', linkText: 'Shop Now' },
    { text: '🚚 Free shipping on orders over $50', link: '/products', linkText: 'Browse' },
    { text: '✨ New arrivals just dropped!', link: '/products', linkText: 'Explore' }
  ]

  const [currentPromo] = useState(() => 
    promos[Math.floor(Math.random() * promos.length)]
  )

  if (!isVisible) return null

  return (
    <div className="promo-banner">
      <div className="promo-content">
        <span className="promo-text">{currentPromo.text}</span>
        <Link to={currentPromo.link} className="promo-link">
          {currentPromo.linkText} →
        </Link>
      </div>
      <button className="promo-close" onClick={() => setIsVisible(false)}>
        ✕
      </button>
    </div>
  )
}

export default PromoBanner
