import React from 'react';
import './SkeletonLoader.css';

export const ProductCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-image shimmer"></div>
    <div className="skeleton-content">
      <div className="skeleton-title shimmer"></div>
      <div className="skeleton-rating shimmer"></div>
      <div className="skeleton-price shimmer"></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="skeleton-grid">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="skeleton-detail">
    <div className="skeleton-detail-image shimmer"></div>
    <div className="skeleton-detail-info">
      <div className="skeleton-title-lg shimmer"></div>
      <div className="skeleton-rating shimmer"></div>
      <div className="skeleton-price-lg shimmer"></div>
      <div className="skeleton-text shimmer"></div>
      <div className="skeleton-text shimmer"></div>
      <div className="skeleton-button shimmer"></div>
    </div>
  </div>
);

export const CartItemSkeleton = () => (
  <div className="skeleton-cart-item">
    <div className="skeleton-cart-image shimmer"></div>
    <div className="skeleton-cart-info">
      <div className="skeleton-title shimmer"></div>
      <div className="skeleton-price shimmer"></div>
    </div>
  </div>
);
