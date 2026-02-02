import React, { useState } from 'react'
import './ImageGallery.css'

const ImageGallery = ({ images = [], productName = 'Product' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })

  // Ensure we have at least one image
  const galleryImages = images.length > 0 ? images : ['/images/placeholder.jpg']

  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handlePrev = () => {
    setSelectedIndex(prev => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setSelectedIndex(prev => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="image-gallery">
      {/* Main Image */}
      <div 
        className={`main-image-container ${isZoomed ? 'zoomed' : ''}`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img 
          src={galleryImages[selectedIndex]} 
          alt={`${productName} - Image ${selectedIndex + 1}`}
          className="main-image"
          style={isZoomed ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          } : {}}
        />
        
        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button className="gallery-nav prev" onClick={handlePrev}>
              ‹
            </button>
            <button className="gallery-nav next" onClick={handleNext}>
              ›
            </button>
          </>
        )}

        {/* Zoom Hint */}
        <div className="zoom-hint">
          <span>🔍</span> Hover to zoom
        </div>

        {/* Image Counter */}
        {galleryImages.length > 1 && (
          <div className="image-counter">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {galleryImages.length > 1 && (
        <div className="thumbnails-container">
          <div className="thumbnails">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                className={`thumbnail ${index === selectedIndex ? 'active' : ''}`}
                onClick={() => setSelectedIndex(index)}
              >
                <img 
                  src={image} 
                  alt={`${productName} thumbnail ${index + 1}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageGallery
