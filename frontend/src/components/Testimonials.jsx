import React, { useState, useEffect } from 'react'
import './Testimonials.css'

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Verified Buyer',
      avatar: '👩',
      rating: 5,
      text: 'Amazing shopping experience! The product quality exceeded my expectations and shipping was super fast. Will definitely shop here again!',
      product: 'Wireless Bluetooth Headphones'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Verified Buyer',
      avatar: '👨',
      rating: 5,
      text: 'Best online store I\'ve ever used. Great prices, excellent customer service, and the website is so easy to navigate. Highly recommended!',
      product: 'Smart Watch Pro'
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'Verified Buyer',
      avatar: '👩‍💼',
      rating: 5,
      text: 'The flash deals are unbeatable! I saved so much money on quality products. The checkout process was smooth and secure.',
      product: 'Premium Leather Bag'
    },
    {
      id: 4,
      name: 'David Wilson',
      role: 'Verified Buyer',
      avatar: '👨‍💻',
      rating: 4,
      text: 'Fast delivery and great product packaging. The comparison feature helped me choose the right product. Very satisfied with my purchase!',
      product: 'Mechanical Keyboard'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length)
  }

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Trusted by thousands of happy shoppers</p>
        </div>

        <div className="testimonials-carousel">
          <button className="carousel-btn prev" onClick={goToPrev}>
            ‹
          </button>

          <div className="testimonials-track">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`testimonial-card ${index === currentIndex ? 'active' : ''}`}
                style={{
                  transform: `translateX(${(index - currentIndex) * 100}%)`,
                  opacity: index === currentIndex ? 1 : 0
                }}
              >
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? 'star filled' : 'star'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="testimonial-product">
                    Purchased: {testimonial.product}
                  </p>
                </div>
                <div className="testimonial-author">
                  <span className="author-avatar">{testimonial.avatar}</span>
                  <div className="author-info">
                    <strong className="author-name">{testimonial.name}</strong>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-btn next" onClick={goToNext}>
            ›
          </button>
        </div>

        <div className="carousel-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        <div className="trust-badges">
          <div className="trust-badge">
            <span className="badge-icon">🛡️</span>
            <span className="badge-text">Secure Payments</span>
          </div>
          <div className="trust-badge">
            <span className="badge-icon">🚚</span>
            <span className="badge-text">Fast Shipping</span>
          </div>
          <div className="trust-badge">
            <span className="badge-icon">↩️</span>
            <span className="badge-text">Easy Returns</span>
          </div>
          <div className="trust-badge">
            <span className="badge-icon">💬</span>
            <span className="badge-text">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
