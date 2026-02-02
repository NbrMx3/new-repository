import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    
    if (token) {
      loadWishlistFromDatabase();
    } else {
      // Load from localStorage if not authenticated
      const saved = localStorage.getItem('wishlist');
      setWishlistItems(saved ? JSON.parse(saved) : []);
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      const wasAuthenticated = isAuthenticated;
      setIsAuthenticated(!!token);
      
      if (token && !wasAuthenticated) {
        loadWishlistFromDatabase();
      } else if (!token) {
        const saved = localStorage.getItem('wishlist');
        setWishlistItems(saved ? JSON.parse(saved) : []);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for same-tab changes
    const interval = setInterval(() => {
      const token = localStorage.getItem('authToken');
      if (!!token !== isAuthenticated) {
        handleStorageChange();
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Save to localStorage when wishlist changes (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  const loadWishlistFromDatabase = async () => {
    try {
      const items = await api.wishlist.getItems();
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const addToWishlist = async (product) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await api.wishlist.addItem(product.id);
        loadWishlistFromDatabase();
        return true;
      } else {
        const exists = wishlistItems.find(item => item.id === product.id);
        if (!exists) {
          setWishlistItems([...wishlistItems, product]);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await api.wishlist.removeItem(productId);
        loadWishlistFromDatabase();
      } else {
        setWishlistItems(wishlistItems.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      return false;
    } else {
      const result = await addToWishlist(product);
      return result;
    }
  };

  const clearWishlist = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Clear each item from database
      for (const item of wishlistItems) {
        try {
          await api.wishlist.removeItem(item.id);
        } catch (error) {
          console.error('Failed to remove item:', error);
        }
      }
    }
    setWishlistItems([]);
  };

  const getTotalWishlistItems = () => {
    return wishlistItems.length;
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      getTotalWishlistItems,
      refreshWishlist: loadWishlistFromDatabase
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
