const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('authToken');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  getCurrentUser: () => apiRequest('/auth/me'),

  updatePassword: (currentPassword, newPassword) => apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
};

// Users API
export const usersAPI = {
  updateProfile: (data) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  getAddresses: () => apiRequest('/users/addresses'),

  addAddress: (address) => apiRequest('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
  }),

  updateAddress: (id, address) => apiRequest(`/users/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(address),
  }),

  deleteAddress: (id) => apiRequest(`/users/addresses/${id}`, {
    method: 'DELETE',
  }),

  getSettings: () => apiRequest('/users/settings'),

  updateSettings: (settings) => apiRequest('/users/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/products/${id}`),

  getCategories: () => apiRequest('/products/meta/categories'),

  getDeals: () => apiRequest('/products/meta/deals'),
};

// Cart API
export const cartAPI = {
  getItems: () => apiRequest('/cart'),

  addItem: (productId, quantity = 1) => apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  }),

  updateQuantity: (productId, quantity) => apiRequest(`/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  }),

  removeItem: (productId) => apiRequest(`/cart/${productId}`, {
    method: 'DELETE',
  }),

  clear: () => apiRequest('/cart', {
    method: 'DELETE',
  }),
};

// Wishlist API
export const wishlistAPI = {
  getItems: () => apiRequest('/wishlist'),

  addItem: (productId) => apiRequest('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),

  removeItem: (productId) => apiRequest(`/wishlist/${productId}`, {
    method: 'DELETE',
  }),

  toggle: (productId) => apiRequest('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
};

// Orders API
export const ordersAPI = {
  getAll: () => apiRequest('/orders'),

  getById: (id) => apiRequest(`/orders/${id}`),

  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),

  updateStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => apiRequest('/notifications'),

  getUnreadCount: () => apiRequest('/notifications/unread-count'),

  create: (notification) => apiRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify(notification),
  }),

  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, {
    method: 'PUT',
  }),

  markAllAsRead: () => apiRequest('/notifications/read-all', {
    method: 'PUT',
  }),

  delete: (id) => apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  }),

  clearAll: () => apiRequest('/notifications', {
    method: 'DELETE',
  }),
};

export default {
  auth: authAPI,
  users: usersAPI,
  products: productsAPI,
  cart: cartAPI,
  wishlist: wishlistAPI,
  orders: ordersAPI,
  notifications: notificationsAPI,
};
