const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  fileInfo: {
    name: String,
    url: String,
    size: Number,
    mimeType: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['buyer', 'supplier'],
      required: true
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    lastRead: Date
  }],
  // Related entities
  relatedProduct: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    image: String
  },
  relatedRFQ: {
    rfqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ'
    },
    rfqNumber: String
  },
  relatedOrder: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderNumber: String
  },
  // Messages
  messages: [messageSchema],
  lastMessage: {
    content: String,
    senderId: mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    type: String
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  // Metadata
  metadata: {
    totalMessages: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Indexes
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ 'metadata.lastActivity': -1 });
conversationSchema.index({ status: 1 });

// Update metadata on message add
conversationSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  this.lastMessage = {
    content: message.type === 'file' ? `📎 ${message.fileInfo?.name || 'File'}` : message.content,
    senderId: message.senderId,
    timestamp: new Date(),
    type: message.type
  };
  this.metadata.totalMessages += 1;
  this.metadata.lastActivity = new Date();
  
  // Update unread count for other participants
  this.participants.forEach(p => {
    if (p.userId.toString() !== message.senderId.toString()) {
      p.unreadCount += 1;
    }
  });
};

// Mark messages as read for a user
conversationSchema.methods.markAsRead = function(userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );
  
  if (participant) {
    participant.unreadCount = 0;
    participant.lastRead = new Date();
  }
  
  // Mark individual messages as read
  this.messages.forEach(msg => {
    if (msg.senderId.toString() !== userId.toString() && !msg.read) {
      msg.read = true;
      msg.readAt = new Date();
    }
  });
};

// Get other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(
    p => p.userId.toString() !== userId.toString()
  );
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(participant1, participant2, relatedProduct = null) {
  // Find existing conversation between these two users
  let conversation = await this.findOne({
    $and: [
      { 'participants.userId': participant1.userId },
      { 'participants.userId': participant2.userId }
    ]
  });

  if (!conversation) {
    conversation = new this({
      participants: [participant1, participant2],
      relatedProduct,
      messages: [],
      lastMessage: null
    });
    await conversation.save();
  }

  return conversation;
};

module.exports = mongoose.model('Conversation', conversationSchema);
