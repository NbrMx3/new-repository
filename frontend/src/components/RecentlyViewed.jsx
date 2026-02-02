import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
  const { recentItems, clearRecentlyViewed } = useRecentlyViewed();

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <section className="recently-viewed">
      <div className="recently-header">
        <h2>Recently Viewed</h2>
        <button className="clear-btn" onClick={clearRecentlyViewed}>
          Clear All
        </button>
      </div>

      <div className="recently-scroll">
        {recentItems.map(product => (
          <Link 
            key={product.id} 
            to={`/product/${product.id}`}
            className="recently-card"
          >
            <img src={product.image} alt={product.name} />
            <div className="recently-info">
              <span className="recently-name">{product.name}</span>
              <span className="recently-price">${product.price.toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
