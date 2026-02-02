import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Breadcrumb.css'

const Breadcrumb = ({ items = [], currentPage }) => {
  const location = useLocation()

  // Auto-generate breadcrumbs from path if items not provided
  const generateBreadcrumbs = () => {
    if (items.length > 0) return items

    const paths = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Home', path: '/' }]

    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Format the label
      let label = path.charAt(0).toUpperCase() + path.slice(1)
      label = label.replace(/-/g, ' ')
      
      // Handle special cases
      if (path === 'product' && paths[index + 1]) {
        label = 'Products'
        currentPath = '/products'
      }

      // Skip product IDs
      if (!isNaN(path)) return

      breadcrumbs.push({
        label,
        path: index === paths.length - 1 ? null : currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Add current page if provided
  if (currentPage) {
    breadcrumbs.push({ label: currentPage, path: null })
  }

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="breadcrumb-item">
            {crumb.path ? (
              <Link to={crumb.path} className="breadcrumb-link">
                {index === 0 ? (
                  <span className="home-icon">🏠</span>
                ) : null}
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <span className="breadcrumb-current">
                {crumb.label}
              </span>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="breadcrumb-separator">›</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
