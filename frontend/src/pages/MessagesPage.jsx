import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messagingService } from '../services/messagingService';
import './MessagesPage.css';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/messages' } });
    }
  }, [isAuthenticated, navigate]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const convs = await messagingService.getConversations(user.id);
        setConversations(convs);
        
        // Check if we need to open a specific conversation
        const convId = searchParams.get('conversation');
        if (convId) {
          const conv = convs.find(c => c.id === convId);
          if (conv) {
            handleSelectConversation(conv);
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user, searchParams]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
    
    try {
      const msgs = await messagingService.getMessages(conversation.id);
      setMessages(msgs);
      
      // Mark as read
      await messagingService.markAsRead(conversation.id, user.id);
      setConversations(prev => 
        prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
      );
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const sentMessage = await messagingService.sendMessage(
        selectedConversation.id,
        user.id,
        user.name,
        messageContent
      );
      
      setMessages(prev => [...prev, sentMessage]);
      
      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, lastMessage: sentMessage }
            : c
        );
        // Move to top
        return updated.sort((a, b) => 
          new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0)
        );
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    setSending(true);
    try {
      const sentMessage = await messagingService.sendAttachment(
        selectedConversation.id,
        user.id,
        user.name,
        file
      );
      
      setMessages(prev => [...prev, sentMessage]);
      
      setConversations(prev => {
        const updated = prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, lastMessage: { ...sentMessage, content: `📎 ${file.name}` } }
            : c
        );
        return updated.sort((a, b) => 
          new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0)
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      const convs = await messagingService.getConversations(user.id);
      setConversations(convs);
      return;
    }
    
    const results = await messagingService.searchConversations(user.id, query);
    setConversations(results);
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await messagingService.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConversation?.id === convId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.id !== user?.id) || conversation.participants[0];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="messages-page">
        <div className="messages-loading">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className={`messages-container ${showMobileChat ? 'show-chat' : ''}`}>
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h1>Messages</h1>
            <button className="new-message-btn" title="New Message">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <div className="search-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p>No conversations yet</p>
                <span>Start chatting with suppliers</span>
              </div>
            ) : (
              conversations.map(conversation => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                
                return (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${isSelected ? 'selected' : ''} ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      {otherParticipant.avatar ? (
                        <img src={otherParticipant.avatar} alt={otherParticipant.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {otherParticipant.name.charAt(0)}
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                    
                    <div className="conversation-content">
                      <div className="conversation-header">
                        <span className="participant-name">{otherParticipant.name}</span>
                        <span className="message-time">
                          {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                      
                      {conversation.relatedProduct && (
                        <div className="related-product">
                          <span>📦 {conversation.relatedProduct.name}</span>
                        </div>
                      )}
                      
                      <p className="last-message">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>

                    <button 
                      className="delete-conv-btn"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      title="Delete conversation"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button 
                  className="back-to-list"
                  onClick={() => setShowMobileChat(false)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="chat-participant">
                  {(() => {
                    const other = getOtherParticipant(selectedConversation);
                    return (
                      <>
                        {other.avatar ? (
                          <img src={other.avatar} alt={other.name} className="participant-avatar" />
                        ) : (
                          <div className="avatar-placeholder small">
                            {other.name.charAt(0)}
                          </div>
                        )}
                        <div className="participant-info">
                          <span className="participant-name">{other.name}</span>
                          <span className="participant-role">
                            {other.role === 'supplier' ? '🏢 Verified Supplier' : '👤 Buyer'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="chat-actions">
                  {selectedConversation.relatedProduct && (
                    <button 
                      className="view-product-btn"
                      onClick={() => navigate(`/product/${selectedConversation.relatedProduct.id}`)}
                      title="View Product"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  )}
                  <button className="more-options-btn" title="More Options">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Related Product Banner */}
              {selectedConversation.relatedProduct && (
                <div 
                  className="product-banner"
                  onClick={() => navigate(`/product/${selectedConversation.relatedProduct.id}`)}
                >
                  <img 
                    src={selectedConversation.relatedProduct.image} 
                    alt={selectedConversation.relatedProduct.name}
                    className="product-thumb"
                  />
                  <div className="product-info">
                    <span className="product-label">Discussing:</span>
                    <span className="product-name">{selectedConversation.relatedProduct.name}</span>
                  </div>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              )}

              {/* Messages List */}
              <div className="messages-list">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date} className="message-group">
                    <div className="date-divider">
                      <span>{formatMessageDate(dateMessages[0].timestamp)}</span>
                    </div>
                    
                    {dateMessages.map((message, index) => {
                      const isOwn = message.senderId === user?.id;
                      const showAvatar = !isOwn && (
                        index === 0 || 
                        dateMessages[index - 1]?.senderId !== message.senderId
                      );
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`message ${isOwn ? 'own' : 'other'}`}
                        >
                          {!isOwn && showAvatar && (
                            <div className="message-avatar">
                              {(() => {
                                const sender = selectedConversation.participants.find(
                                  p => p.id === message.senderId
                                );
                                return sender?.avatar ? (
                                  <img src={sender.avatar} alt={sender.name} />
                                ) : (
                                  <div className="avatar-placeholder tiny">
                                    {message.senderName.charAt(0)}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          
                          <div className={`message-bubble ${!isOwn && !showAvatar ? 'no-avatar' : ''}`}>
                            {message.type === 'file' ? (
                              <div className="file-message">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                  <polyline points="13 2 13 9 20 9" />
                                </svg>
                                <div className="file-info">
                                  <span className="file-name">{message.fileInfo?.name}</span>
                                  <span className="file-size">
                                    {message.fileInfo?.size 
                                      ? `${(message.fileInfo.size / 1024).toFixed(1)} KB`
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p>{message.content}</p>
                            )}
                            <span className="message-time">
                              {formatMessageTime(message.timestamp)}
                              {isOwn && (
                                <span className={`read-status ${message.read ? 'read' : ''}`}>
                                  {message.read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                
                <button 
                  type="button" 
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? (
                    <div className="sending-spinner"></div>
                  ) : (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-chat-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2>Select a conversation</h2>
              <p>Choose from your existing conversations or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
