import React, { useState, useRef, useEffect } from 'react'
import { productService } from '../services/productService'
import './ChatBot.css'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi there! 👋 I'm your shopping assistant. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const quickReplies = [
    "Show me products",
    "What are your best deals?",
    "How do I track my order?",
    "Return policy"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const generateBotResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Product search
    if (lowerMessage.includes('product') || lowerMessage.includes('show me') || lowerMessage.includes('looking for') || lowerMessage.includes('find')) {
      const products = await productService.getAllProducts()
      const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 3)
      
      return {
        text: "Here are some products you might like:",
        products: randomProducts
      }
    }
    
    // Price/deals related
    if (lowerMessage.includes('deal') || lowerMessage.includes('discount') || lowerMessage.includes('sale') || lowerMessage.includes('cheap') || lowerMessage.includes('best price')) {
      return {
        text: "🔥 We have amazing deals right now! Check out our Flash Deals page for up to 50% off on selected items. You can also use code SAVE10 for an extra 10% off your first order!"
      }
    }
    
    // Shipping related
    if (lowerMessage.includes('ship') || lowerMessage.includes('delivery') || lowerMessage.includes('arrive')) {
      return {
        text: "🚚 We offer fast shipping!\n\n• Standard Shipping: 5-7 business days (Free over $50)\n• Express Shipping: 2-3 business days ($9.99)\n• Next Day Delivery: Available in select areas ($19.99)\n\nAll orders are processed within 24 hours!"
      }
    }
    
    // Order tracking
    if (lowerMessage.includes('track') || lowerMessage.includes('order status') || lowerMessage.includes('where is my order')) {
      return {
        text: "📦 To track your order:\n\n1. Go to 'My Account' → 'My Orders'\n2. Click on the order you want to track\n3. You'll see real-time tracking information\n\nYou'll also receive email updates with tracking links!"
      }
    }
    
    // Returns
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
      return {
        text: "↩️ Our Return Policy:\n\n• 30-day return window for most items\n• Items must be unused and in original packaging\n• Free returns on defective products\n• Refunds processed within 5-7 business days\n\nStart a return from 'My Account' → 'My Orders'"
      }
    }
    
    // Payment
    if (lowerMessage.includes('pay') || lowerMessage.includes('card') || lowerMessage.includes('payment method')) {
      return {
        text: "💳 We accept multiple payment methods:\n\n• Credit/Debit Cards (Visa, MasterCard, Amex)\n• PayPal\n• Apple Pay & Google Pay\n• Buy Now, Pay Later options\n\nAll transactions are 100% secure!"
      }
    }
    
    // Category search
    if (lowerMessage.includes('electronic') || lowerMessage.includes('phone') || lowerMessage.includes('laptop') || lowerMessage.includes('headphone')) {
      const products = await productService.getAllProducts()
      const electronics = products.filter(p => 
        p.category?.toLowerCase().includes('electronic') || 
        p.name?.toLowerCase().includes('headphone') ||
        p.name?.toLowerCase().includes('watch')
      ).slice(0, 3)
      
      return {
        text: "Here are some electronics you might be interested in:",
        products: electronics.length > 0 ? electronics : products.slice(0, 3)
      }
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        text: "Hello! 😊 Great to chat with you! I can help you with:\n\n• Finding products\n• Checking deals & discounts\n• Order tracking\n• Shipping information\n• Returns & refunds\n\nWhat would you like to know?"
      }
    }
    
    // Thanks
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return {
        text: "You're welcome! 😊 Is there anything else I can help you with? Feel free to ask anytime!"
      }
    }
    
    // Contact/Support
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('speak to') || lowerMessage.includes('human')) {
      return {
        text: "📞 Need more help? Here's how to reach us:\n\n• Email: support@e-com.com\n• Phone: 1-800-123-4567 (9AM-6PM EST)\n• Live Chat: Available 24/7\n\nOur support team typically responds within 2 hours!"
      }
    }
    
    // Default response
    return {
      text: "I'm not sure I understood that. Here are some things I can help you with:\n\n• Browse products\n• Check deals & discounts\n• Shipping information\n• Order tracking\n• Returns & refunds\n\nTry asking about any of these topics!"
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const response = await generateBotResponse(inputValue)
    
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: response.text,
      products: response.products,
      timestamp: new Date()
    }

    setIsTyping(false)
    setMessages(prev => [...prev, botMessage])
  }

  const handleQuickReply = (reply) => {
    setInputValue(reply)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="bot-avatar">
              <span>🤖</span>
              <span className="online-indicator"></span>
            </div>
            <div className="bot-info">
              <h4>Shopping Assistant</h4>
              <span className="status">Online</span>
            </div>
          </div>
          <button className="close-chat" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              {msg.type === 'bot' && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.products && (
                  <div className="product-suggestions">
                    {msg.products.map(product => (
                      <a 
                        key={product.id} 
                        href={`/product/${product.id}`}
                        className="suggested-product"
                      >
                        <img src={product.image} alt={product.name} />
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          <span className="product-price">${product.price?.toFixed(2)}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="message-content typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button 
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <span className="chat-icon">💬</span>
        <span className="chat-label">Chat with us</span>
        <span className="notification-dot"></span>
      </button>
    </div>
  )
}

export default ChatBot
