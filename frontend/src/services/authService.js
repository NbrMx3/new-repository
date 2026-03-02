// Mock authentication service
// In production, this would connect to a real backend API

// Simulated user database
let users = [
  {
    id: '1',
    email: 'buyer@example.com',
    password: 'password123',
    name: 'John Buyer',
    role: 'buyer',
    company: 'Retail Corp',
    phone: '+1-555-0101',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'supplier@example.com',
    password: 'password123',
    name: 'Jane Supplier',
    role: 'supplier',
    company: 'Manufacturing Ltd',
    phone: '+1-555-0102',
    verified: true,
    certifications: ['ISO 9001', 'CE'],
    createdAt: '2025-01-01T00:00:00Z'
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email, password) {
    await delay(500); // Simulate network delay

    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found. Please check your email.');
    }
    
    if (user.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    // Return user data without password
    const { password: _, ...userData } = user;
    return {
      ...userData,
      token: `mock-jwt-token-${user.id}-${Date.now()}`
    };
  },

  async register(userData) {
    await delay(500);

    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already registered. Please use a different email.');
    }

    // Validate required fields
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      throw new Error('Please fill in all required fields.');
    }

    // Validate role
    if (!['buyer', 'supplier'].includes(userData.role)) {
      throw new Error('Invalid role selected.');
    }

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      company: userData.company || '',
      phone: userData.phone || '',
      verified: false,
      createdAt: new Date().toISOString(),
      ...(userData.role === 'supplier' && {
        certifications: [],
        businessLicense: userData.businessLicense || '',
        productCategories: userData.productCategories || []
      })
    };

    users.push(newUser);

    // Return user data without password
    const { password: _, ...userResponse } = newUser;
    return {
      ...userResponse,
      token: `mock-jwt-token-${newUser.id}-${Date.now()}`
    };
  },

  async logout() {
    await delay(200);
    // In a real app, this would invalidate the token on the server
    return { success: true };
  },

  async updateProfile(userId, updates) {
    await delay(500);

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    // Update user data (excluding sensitive fields)
    const { password, id, email, role, ...allowedUpdates } = updates;
    users[userIndex] = {
      ...users[userIndex],
      ...allowedUpdates
    };

    const { password: _, ...userData } = users[userIndex];
    return userData;
  },

  async verifySupplier(userId, documents) {
    await delay(1000);

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    if (users[userIndex].role !== 'supplier') {
      throw new Error('Only suppliers can be verified.');
    }

    // In a real app, this would trigger a verification process
    users[userIndex].verificationStatus = 'pending';
    users[userIndex].verificationDocuments = documents;

    return { success: true, status: 'pending' };
  },

  async checkEmailExists(email) {
    await delay(200);
    return users.some(u => u.email === email);
  }
};

export default authService;
