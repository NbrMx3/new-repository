// Mock messaging data and service

const mockConversations = [
  {
    id: 'conv-1',
    participants: [
      { id: 'user-1', name: 'John Buyer', avatar: null, role: 'buyer' },
      { id: 'supplier-1', name: 'TechGadgets Pro', avatar: 'https://ui-avatars.com/api/?name=TechGadgets&background=e53935&color=fff', role: 'supplier' }
    ],
    lastMessage: {
      id: 'msg-5',
      senderId: 'supplier-1',
      content: 'Yes, we can offer a 10% discount for orders over 500 units. Would you like me to prepare a formal quotation?',
      timestamp: '2026-01-25T10:30:00Z',
      read: false
    },
    relatedProduct: {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
    },
    unreadCount: 2,
    createdAt: '2026-01-20T08:00:00Z'
  },
  {
    id: 'conv-2',
    participants: [
      { id: 'user-1', name: 'John Buyer', avatar: null, role: 'buyer' },
      { id: 'supplier-2', name: 'SmartHome Solutions', avatar: 'https://ui-avatars.com/api/?name=SmartHome&background=3b82f6&color=fff', role: 'supplier' }
    ],
    lastMessage: {
      id: 'msg-10',
      senderId: 'user-1',
      content: 'Thank you for the samples. We will review and get back to you next week.',
      timestamp: '2026-01-24T16:45:00Z',
      read: true
    },
    relatedProduct: {
      id: 3,
      name: 'Smart Watch Pro',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
    },
    unreadCount: 0,
    createdAt: '2026-01-15T14:00:00Z'
  },
  {
    id: 'conv-3',
    participants: [
      { id: 'user-1', name: 'John Buyer', avatar: null, role: 'buyer' },
      { id: 'supplier-3', name: 'Premium Electronics Co.', avatar: 'https://ui-avatars.com/api/?name=Premium&background=059669&color=fff', role: 'supplier' }
    ],
    lastMessage: {
      id: 'msg-15',
      senderId: 'supplier-3',
      content: 'The shipment has been dispatched. Tracking number: TRK123456789. Expected delivery in 5-7 business days.',
      timestamp: '2026-01-23T09:15:00Z',
      read: true
    },
    relatedProduct: null,
    unreadCount: 0,
    createdAt: '2026-01-10T11:30:00Z'
  }
];

const mockMessages = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'user-1',
      senderName: 'John Buyer',
      content: 'Hi, I\'m interested in bulk ordering your Wireless Bluetooth Headphones. What\'s your best price for 500+ units?',
      timestamp: '2026-01-20T08:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-2',
      senderId: 'supplier-1',
      senderName: 'TechGadgets Pro',
      content: 'Hello! Thank you for your interest. For 500+ units, we can offer $42.50 per unit instead of the regular $49.99. This includes our standard packaging.',
      timestamp: '2026-01-20T09:30:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-3',
      senderId: 'user-1',
      senderName: 'John Buyer',
      content: 'That sounds reasonable. Can you also provide custom branding on the headphones and packaging?',
      timestamp: '2026-01-22T14:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-4',
      senderId: 'supplier-1',
      senderName: 'TechGadgets Pro',
      content: 'Absolutely! Custom branding is available. For logo printing on the headphones, there\'s an additional $2 per unit. Custom packaging design is $1.50 per unit. We\'ll need your artwork files in vector format.',
      timestamp: '2026-01-24T10:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-5',
      senderId: 'supplier-1',
      senderName: 'TechGadgets Pro',
      content: 'Yes, we can offer a 10% discount for orders over 500 units. Would you like me to prepare a formal quotation?',
      timestamp: '2026-01-25T10:30:00Z',
      read: false,
      type: 'text'
    }
  ],
  'conv-2': [
    {
      id: 'msg-6',
      senderId: 'user-1',
      senderName: 'John Buyer',
      content: 'Hello, I saw your Smart Watch Pro listing. Do you have samples available for testing?',
      timestamp: '2026-01-15T14:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-7',
      senderId: 'supplier-2',
      senderName: 'SmartHome Solutions',
      content: 'Hi there! Yes, we offer sample units at $35 each (regular wholesale is $28). Would you like to order some samples?',
      timestamp: '2026-01-15T15:30:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-8',
      senderId: 'user-1',
      senderName: 'John Buyer',
      content: 'Yes please, I\'d like 3 samples. Can you ship to our office address?',
      timestamp: '2026-01-18T09:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-9',
      senderId: 'supplier-2',
      senderName: 'SmartHome Solutions',
      content: 'Order confirmed! 3 samples will be shipped today. You should receive them within 3-5 business days. I\'ll send the tracking info shortly.',
      timestamp: '2026-01-18T11:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-10',
      senderId: 'user-1',
      senderName: 'John Buyer',
      content: 'Thank you for the samples. We will review and get back to you next week.',
      timestamp: '2026-01-24T16:45:00Z',
      read: true,
      type: 'text'
    }
  ],
  'conv-3': [
    {
      id: 'msg-11',
      senderId: 'user-1',
      senderName: 'John Buyer',
      content: 'Hi, I placed order #ORD-2024-001 last week. Any update on the shipment?',
      timestamp: '2026-01-10T11:30:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-12',
      senderId: 'supplier-3',
      senderName: 'Premium Electronics Co.',
      content: 'Hello! Let me check on that for you. One moment please.',
      timestamp: '2026-01-10T12:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-13',
      senderId: 'supplier-3',
      senderName: 'Premium Electronics Co.',
      content: 'Your order is currently being processed in our warehouse. It should ship within the next 48 hours.',
      timestamp: '2026-01-10T12:15:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-14',
      senderId: 'user-1',
      senderName: 'John Buyer',
      content: 'Great, please notify me when it ships.',
      timestamp: '2026-01-12T09:00:00Z',
      read: true,
      type: 'text'
    },
    {
      id: 'msg-15',
      senderId: 'supplier-3',
      senderName: 'Premium Electronics Co.',
      content: 'The shipment has been dispatched. Tracking number: TRK123456789. Expected delivery in 5-7 business days.',
      timestamp: '2026-01-23T09:15:00Z',
      read: true,
      type: 'text'
    }
  ]
};

// Simulate async API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const messagingService = {
  // Get all conversations for a user
  getConversations: async (userId) => {
    await delay(300);
    // In real app, filter by userId
    return [...mockConversations].sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    await delay(200);
    return mockMessages[conversationId] || [];
  },

  // Get a single conversation by ID
  getConversation: async (conversationId) => {
    await delay(100);
    return mockConversations.find(c => c.id === conversationId) || null;
  },

  // Send a new message
  sendMessage: async (conversationId, senderId, senderName, content, type = 'text') => {
    await delay(300);
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    // Add to mock messages
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);

    // Update last message in conversation
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage;
    }

    return newMessage;
  },

  // Start a new conversation
  startConversation: async (currentUser, otherParticipant, initialMessage, relatedProduct = null) => {
    await delay(400);

    const newConversationId = `conv-${Date.now()}`;
    
    const newConversation = {
      id: newConversationId,
      participants: [
        { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
        { id: otherParticipant.id, name: otherParticipant.name, avatar: otherParticipant.avatar, role: otherParticipant.role }
      ],
      lastMessage: null,
      relatedProduct,
      unreadCount: 0,
      createdAt: new Date().toISOString()
    };

    mockConversations.unshift(newConversation);
    mockMessages[newConversationId] = [];

    // Send the initial message
    if (initialMessage) {
      const message = await messagingService.sendMessage(
        newConversationId,
        currentUser.id,
        currentUser.name,
        initialMessage
      );
      newConversation.lastMessage = message;
    }

    return newConversation;
  },

  // Mark conversation as read
  markAsRead: async (conversationId, userId) => {
    await delay(100);
    
    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      if (conversation.lastMessage) {
        conversation.lastMessage.read = true;
      }
    }

    // Mark all messages as read
    if (mockMessages[conversationId]) {
      mockMessages[conversationId].forEach(msg => {
        if (msg.senderId !== userId) {
          msg.read = true;
        }
      });
    }

    return true;
  },

  // Get total unread count
  getUnreadCount: async (userId) => {
    await delay(100);
    return mockConversations.reduce((total, conv) => total + conv.unreadCount, 0);
  },

  // Search conversations
  searchConversations: async (userId, query) => {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    
    return mockConversations.filter(conv => {
      // Search in participant names
      const participantMatch = conv.participants.some(p => 
        p.name.toLowerCase().includes(lowerQuery)
      );
      
      // Search in related product
      const productMatch = conv.relatedProduct?.name.toLowerCase().includes(lowerQuery);
      
      // Search in last message
      const messageMatch = conv.lastMessage?.content.toLowerCase().includes(lowerQuery);
      
      return participantMatch || productMatch || messageMatch;
    });
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    await delay(200);
    const index = mockConversations.findIndex(c => c.id === conversationId);
    if (index > -1) {
      mockConversations.splice(index, 1);
      delete mockMessages[conversationId];
    }
    return true;
  },

  // Send attachment (mock)
  sendAttachment: async (conversationId, senderId, senderName, file) => {
    await delay(500);
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      content: file.name,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'file',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }
    };

    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);

    const conversation = mockConversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = { ...newMessage, content: `📎 ${file.name}` };
    }

    return newMessage;
  },

  // Get or create conversation with a supplier
  getOrCreateConversation: async (currentUser, supplierId, supplierName, product = null) => {
    await delay(200);
    
    // Check if conversation already exists
    const existingConv = mockConversations.find(conv => 
      conv.participants.some(p => p.id === supplierId) &&
      conv.participants.some(p => p.id === currentUser.id)
    );
    
    if (existingConv) {
      return existingConv;
    }
    
    // Create new conversation
    return messagingService.startConversation(
      currentUser,
      { id: supplierId, name: supplierName, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(supplierName)}&background=e53935&color=fff`, role: 'supplier' },
      null,
      product
    );
  }
};

export default messagingService;
