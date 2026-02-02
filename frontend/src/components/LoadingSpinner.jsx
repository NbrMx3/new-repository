import React from 'react'
import './LoadingSpinner.css'

const LoadingSpinner = ({ 
  size = 'medium', 
  text = '', 
  fullPage = false,
  overlay = false 
}) => {
  const spinnerContent = (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-center"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="loading-fullpage">
        {spinnerContent}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

export default LoadingSpinner
