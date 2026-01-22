import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <aside className="category-filter">
      <h3>Categories</h3>
      <ul className="category-list">
        <li key="all">
          <label className="category-item">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ''}
              onChange={(e) => onCategoryChange(e.target.value)}
            />
            <span>All Products</span>
          </label>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <label className="category-item">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
              />
              <span>{category}</span>
            </label>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategoryFilter;
