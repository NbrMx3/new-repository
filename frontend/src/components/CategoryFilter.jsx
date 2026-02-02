import React, { useState, useMemo } from 'react';
import './CategoryFilter.css';

// Define which categories belong under "Clothes"
const clothingCategories = [
  "Men's Clothing",
  "Women's Clothing",
  "Kids' Clothing",
  "Activewear",
  "Loungewear",
  "Swimwear",
  "Formal Wear",
  "Underwear & Basics",
  "Clothing Accessories",
  "Plus Size",
  "Maternity"
];

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const [clothesExpanded, setClothesExpanded] = useState(false);

  // Separate clothing categories from other categories
  const { clothingCats, otherCats } = useMemo(() => {
    const clothing = categories.filter(cat => clothingCategories.includes(cat));
    const others = categories.filter(cat => !clothingCategories.includes(cat));
    return { clothingCats: clothing, otherCats: others };
  }, [categories]);

  // Check if any clothing category is selected
  const isClothingSelected = clothingCategories.includes(selectedCategory);

  // Auto-expand if a clothing category is selected
  React.useEffect(() => {
    if (isClothingSelected) {
      setClothesExpanded(true);
    }
  }, [isClothingSelected]);

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

        {/* Other (non-clothing) categories */}
        {otherCats.map((category) => (
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

        {/* Clothes parent category with expandable subcategories */}
        {clothingCats.length > 0 && (
          <li key="clothes-group" className="category-group">
            <div 
              className={`category-group-header ${clothesExpanded ? 'expanded' : ''} ${isClothingSelected ? 'has-selected' : ''}`}
              onClick={() => setClothesExpanded(!clothesExpanded)}
            >
              <span className="group-icon">👕</span>
              <span className="group-title">Clothes</span>
              <span className="group-count">({clothingCats.length})</span>
              <span className={`expand-arrow ${clothesExpanded ? 'expanded' : ''}`}>▼</span>
            </div>
            
            {clothesExpanded && (
              <ul className="subcategory-list">
                {clothingCats.map((category) => (
                  <li key={category}>
                    <label className="category-item subcategory-item">
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
            )}
          </li>
        )}
      </ul>
    </aside>
  );
};

export default CategoryFilter;
