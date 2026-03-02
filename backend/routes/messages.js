const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {
      'participants.userId': req.user._id,
      status: 'active'
    };

    const conversations = await Conversation.find(query)
      .populate('participants.userId', 'name email avatar role company')
      .populate('relatedProduct.productId', 'name images price')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ 'metadata.lastActivity': -1 });

    const total = await Conversation.countDocuments(query);

    // Calculate total unread
    let totalUnread = 0;
    conversations.forEach(conv => {
      const participant = conv.participants.find(
        p => p.userId._id.toString() === req.user._id.toString()
      );
      if (participant) {
        totalUnread += participant.unreadCount;
      }
    });

    res.json({
      success: true,
      data: {
        conversations,
        totalUnread,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get single conversation with messages
// @access  Private
router.get('/conversations/:id', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.userId', 'name email avatar role company')
      .populate('relatedProduct.productId', 'name images price');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      p => p.userId._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Mark as read
    conversation.markAsRead(req.user._id);
    await conversation.save();

    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/conversations/:id/messages
// @desc    Get messages for a conversation (paginated)
// @access  Private
router.get('/conversations/:id/messages', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check authorization
    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get paginated messages (newest first for loading more)
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalMessages = conversation.messages.length;

    // Reverse to get oldest first, then slice
    const messages = conversation.messages
      .slice(Math.max(0, totalMessages - endIndex), totalMessages - startIndex)
      .reverse();

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit),
          hasMore: startIndex + messages.length < totalMessages
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/conversations
// @desc    Start a new conversation
// @access  Private
router.post('/conversations', protect, [
  body('recipientId').notEmpty().withMessage('Recipient ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { recipientId, initialMessage, relatedProduct, relatedRFQ, relatedOrder } = req.body;

    // Get recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.userId': req.user._id },
        { 'participants.userId': recipientId }
      ],
      status: 'active'
    });

    if (conversation) {
      // Return existing conversation
      return res.json({
        success: true,
        message: 'Conversation already exists',
        data: { conversation, isNew: false }
      });
    }

    // Create new conversation
    const participants = [
      { userId: req.user._id, role: req.user.role, unreadCount: 0 },
      { userId: recipientId, role: recipient.role, unreadCount: initialMessage ? 1 : 0 }
    ];

    conversation = new Conversation({
      participants,
      relatedProduct,
      relatedRFQ,
      relatedOrder,
      messages: [],
      status: 'active'
    });

    // Add initial message if provided
    if (initialMessage) {
      conversation.addMessage({
        senderId: req.user._id,
        content: initialMessage,
        type: 'text'
      });
    }

    await conversation.save();

    // Populate for response
    await conversation.populate('participants.userId', 'name email avatar role company');

    // Emit socket event for real-time
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('newConversation', conversation);
    }

    res.status(201).json({
      success: true,
      message: 'Conversation started',
      data: { conversation, isNew: true }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', protect, [
  body('content').trim().notEmpty().withMessage('Message content is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check authorization
    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { content, type = 'text' } = req.body;

    const message = {
      senderId: req.user._id,
      content,
      type
    };

    conversation.addMessage(message);
    await conversation.save();

    const newMessage = conversation.messages[conversation.messages.length - 1];

    // Emit socket event for real-time
    const io = req.app.get('io');
    if (io) {
      // Emit to conversation room
      io.to(`conversation_${conversation._id}`).emit('newMessage', {
        conversationId: conversation._id,
        message: newMessage
      });

      // Emit to other participant's user room
      conversation.participants.forEach(p => {
        if (p.userId.toString() !== req.user._id.toString()) {
          io.to(`user_${p.userId}`).emit('newMessage', {
            conversationId: conversation._id,
            message: newMessage
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      data: { message: newMessage }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/conversations/:id/attachment
// @desc    Send attachment in a conversation
// @access  Private
router.post('/conversations/:id/attachment', protect, upload.attachment, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const fileUrl = req.file.mimetype.startsWith('image/')
      ? `/uploads/images/${req.file.filename}`
      : `/uploads/documents/${req.file.filename}`;

    const message = {
      senderId: req.user._id,
      content: req.file.originalname,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
      fileInfo: {
        name: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    };

    conversation.addMessage(message);
    await conversation.save();

    const newMessage = conversation.messages[conversation.messages.length - 1];

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversation._id}`).emit('newMessage', {
        conversationId: conversation._id,
        message: newMessage
      });
    }

    res.status(201).json({
      success: true,
      data: { message: newMessage }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/messages/conversations/:id/read
// @desc    Mark conversation as read
// @access  Private
router.put('/conversations/:id/read', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.markAsRead(req.user._id);
    await conversation.save();

    res.json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/messages/conversations/:id
// @desc    Archive/delete conversation
// @access  Private
router.delete('/conversations/:id', protect, async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Archive instead of delete
    conversation.status = 'archived';
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation archived'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count
// @access  Private
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user._id,
      status: 'active'
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      const participant = conv.participants.find(
        p => p.userId.toString() === req.user._id.toString()
      );
      if (participant) {
        totalUnread += participant.unreadCount;
      }
    });

    res.json({
      success: true,
      data: { unreadCount: totalUnread }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/contact-supplier
// @desc    Start conversation with a supplier (from product page)
// @access  Private
router.post('/contact-supplier', protect, [
  body('supplierId').notEmpty().withMessage('Supplier ID is required')
], async (req, res, next) => {
  try {
    const { supplierId, productId, initialMessage } = req.body;

    // Get supplier
    const supplier = await Supplier.findById(supplierId).populate('userId');
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Use the existing conversations endpoint logic
    const participant1 = { userId: req.user._id, role: req.user.role };
    const participant2 = { userId: supplier.userId._id, role: 'supplier' };

    let relatedProduct = null;
    if (productId) {
      const Product = require('../models/Product');
      const product = await Product.findById(productId);
      if (product) {
        relatedProduct = {
          productId: product._id,
          name: product.name,
          image: product.images?.[0]?.url
        };
      }
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(
      participant1,
      participant2,
      relatedProduct
    );

    // Add initial message if provided and conversation is new
    if (initialMessage && conversation.messages.length === 0) {
      conversation.addMessage({
        senderId: req.user._id,
        content: initialMessage,
        type: 'text'
      });
      await conversation.save();
    }

    await conversation.populate('participants.userId', 'name email avatar role company');

    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
