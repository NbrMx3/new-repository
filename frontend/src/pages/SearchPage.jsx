import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim()) {
        try {
          const results = await productService.searchProducts(query);
          setProducts(results);
        } catch (error) {
          console.error('Error searching products:', error);
        }
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-container">
        <h1>Search Results</h1>
        <p className="search-query">Results for: <strong>{query}</strong></p>

        {loading ? (
          <div className="loading">Searching...</div>
        ) : products.length > 0 ? (
          <>
            <p className="results-count">Found {products.length} product(s)</p>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-results">
            <h2>No products found</h2>
            <p>We couldn't find any products matching "{query}"</p>
            <p>Try a different search term or browse our categories</p>
            <Link to="/products" className="browse-btn">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
