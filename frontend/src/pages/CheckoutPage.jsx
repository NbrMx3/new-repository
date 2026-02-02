import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  PAYMENT_METHODS, 
  paymentMethodsConfig,
  initiateMpesaPayment,
  checkMpesaStatus,
  processCardPayment,
  validateMpesaPhone,
  formatMpesaPhone,
  initiateBankTransfer,
  getCryptoAddresses
} from '../services/paymentService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const toast = useToast();
  const { notifyCheckout } = useNotifications();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS.CREDIT_CARD);
  const [mpesaStatus, setMpesaStatus] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [cryptoAddresses, setCryptoAddresses] = useState(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Kenya'
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }
    
    setPaymentInfo({ ...paymentInfo, [name]: value });
  };

  const validateShipping = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    return required.every(field => shippingInfo[field].trim());
  };

  const validatePayment = () => {
    switch (selectedPayment) {
      case PAYMENT_METHODS.CREDIT_CARD:
        return paymentInfo.cardNumber.replace(/\s/g, '').length >= 16 && 
               paymentInfo.cardName && 
               paymentInfo.expiry.length === 5 && 
               paymentInfo.cvv.length >= 3;
      case PAYMENT_METHODS.MPESA:
        return validateMpesaPhone(mpesaPhone);
      case PAYMENT_METHODS.PAYPAL:
        return paypalEmail && paypalEmail.includes('@');
      case PAYMENT_METHODS.APPLE_PAY:
      case PAYMENT_METHODS.GOOGLE_PAY:
        return true;
      case PAYMENT_METHODS.BANK_TRANSFER:
      case PAYMENT_METHODS.CASH_ON_DELIVERY:
      case PAYMENT_METHODS.CRYPTO:
        return true;
      default:
        return false;
    }
  };

  const handleMpesaPayment = async () => {
    if (!validateMpesaPhone(mpesaPhone)) {
      toast.error('Please enter a valid M-Pesa phone number');
      return;
    }

    setIsProcessing(true);
    setMpesaStatus('pending');

    try {
      const formattedPhone = formatMpesaPhone(mpesaPhone);
      const result = await initiateMpesaPayment(formattedPhone, total, Date.now());
      
      if (result.success) {
        toast.success(result.message);
        setMpesaStatus('checking');
        
        const statusResult = await checkMpesaStatus(result.checkoutRequestId);
        
        if (statusResult.success && statusResult.resultCode === 0) {
          setMpesaStatus('success');
          toast.success('M-Pesa payment successful!');
          const orderId = `ORD-${Date.now()}`;
          notifyCheckout(orderId, total);
          setTimeout(() => {
            clearCart();
            navigate('/order-success');
          }, 1500);
        } else {
          setMpesaStatus('failed');
          toast.error('M-Pesa payment failed. Please try again.');
          setIsProcessing(false);
        }
      }
    } catch (error) {
      setMpesaStatus('failed');
      toast.error('Failed to initiate M-Pesa payment');
      setIsProcessing(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!validatePayment()) {
      toast.error('Please fill in all payment details');
      return;
    }

    if (selectedPayment === PAYMENT_METHODS.MPESA) {
      handleMpesaPayment();
      return;
    }

    if (selectedPayment === PAYMENT_METHODS.BANK_TRANSFER) {
      const details = await initiateBankTransfer(total, Date.now());
      setBankDetails(details);
      toast.info('Bank transfer details generated. Please complete the transfer.');
      return;
    }

    if (selectedPayment === PAYMENT_METHODS.CRYPTO) {
      setCryptoAddresses(getCryptoAddresses());
      toast.info('Crypto payment address generated. Please send the exact amount.');
      return;
    }

    if (selectedPayment === PAYMENT_METHODS.CASH_ON_DELIVERY) {
      setIsProcessing(true);
      const orderId = `ORD-${Date.now()}`;
      notifyCheckout(orderId, total);
      setTimeout(() => {
        clearCart();
        navigate('/order-success');
      }, 1500);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let result;
      
      switch (selectedPayment) {
        case PAYMENT_METHODS.CREDIT_CARD:
          result = await processCardPayment(paymentInfo, total, Date.now());
          break;
        case PAYMENT_METHODS.PAYPAL:
        case PAYMENT_METHODS.APPLE_PAY:
        case PAYMENT_METHODS.GOOGLE_PAY:
          await new Promise(resolve => setTimeout(resolve, 2000));
          result = { success: true };
          break;
        default:
          result = { success: true };
      }

      if (result.success) {
        toast.success('Payment successful!');
        const orderId = `ORD-${Date.now()}`;
        notifyCheckout(orderId, total);
        clearCart();
        navigate('/order-success');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const getPaymentMethodName = () => {
    const method = paymentMethodsConfig.find(m => m.id === selectedPayment);
    return method ? method.name : 'Unknown';
  };

  const renderPaymentForm = () => {
    switch (selectedPayment) {
      case PAYMENT_METHODS.CREDIT_CARD:
        return (
          <div className="card-form">
            <div className="card-brands">
              <span className="card-brand visa">VISA</span>
              <span className="card-brand mastercard">MC</span>
              <span className="card-brand amex">AMEX</span>
            </div>
            <div className="form-group full">
              <label>Card Number</label>
              <input 
                type="text" 
                name="cardNumber" 
                value={paymentInfo.cardNumber}
                onChange={handlePaymentChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>
            <div className="form-group full">
              <label>Name on Card</label>
              <input 
                type="text" 
                name="cardName" 
                value={paymentInfo.cardName}
                onChange={handlePaymentChange}
                placeholder="JOHN DOE"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input 
                  type="text" 
                  name="expiry" 
                  value={paymentInfo.expiry}
                  onChange={handlePaymentChange}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input 
                  type="text" 
                  name="cvv" 
                  value={paymentInfo.cvv}
                  onChange={handlePaymentChange}
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        );

      case PAYMENT_METHODS.MPESA:
        return (
          <div className="mpesa-form">
            <div className="mpesa-logo">
              <span className="mpesa-brand">M-PESA</span>
              <span className="mpesa-tagline">Express</span>
            </div>
            <p className="mpesa-info">
              Enter your M-Pesa registered phone number. You will receive a prompt on your phone to complete the payment.
            </p>
            <div className="form-group full">
              <label>M-Pesa Phone Number</label>
              <div className="phone-input-group">
                <span className="country-code">+254</span>
                <input 
                  type="tel" 
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="7XX XXX XXX"
                  maxLength="12"
                />
              </div>
            </div>
            {mpesaStatus === 'pending' && (
              <div className="mpesa-status pending">
                <span className="spinner"></span>
                <span>Sending STK Push to your phone...</span>
              </div>
            )}
            {mpesaStatus === 'checking' && (
              <div className="mpesa-status checking">
                <span className="spinner"></span>
                <span>Enter your M-Pesa PIN on your phone...</span>
              </div>
            )}
            {mpesaStatus === 'success' && (
              <div className="mpesa-status success">
                <span>✅</span>
                <span>Payment confirmed!</span>
              </div>
            )}
            {mpesaStatus === 'failed' && (
              <div className="mpesa-status failed">
                <span>❌</span>
                <span>Payment failed. Please try again.</span>
              </div>
            )}
            <button 
              className="mpesa-pay-btn"
              onClick={handleMpesaPayment}
              disabled={isProcessing || !mpesaPhone}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>📱 Pay ${total.toFixed(2)} with M-Pesa</>
              )}
            </button>
            <div className="mpesa-steps">
              <h4>How it works:</h4>
              <ol>
                <li>Enter your Safaricom phone number</li>
                <li>Click "Pay with M-Pesa" button above</li>
                <li>Check your phone for the M-Pesa prompt</li>
                <li>Enter your M-Pesa PIN to confirm</li>
              </ol>
            </div>
          </div>
        );

      case PAYMENT_METHODS.PAYPAL:
        return (
          <div className="paypal-form">
            <div className="paypal-logo">
              <span className="paypal-brand">Pay</span>
              <span className="paypal-brand blue">Pal</span>
            </div>
            <div className="form-group full">
              <label>PayPal Email</label>
              <input 
                type="email" 
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="your-email@example.com"
              />
            </div>
            <p className="paypal-info">
              You will be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        );

      case PAYMENT_METHODS.APPLE_PAY:
        return (
          <div className="digital-wallet-form">
            <div className="wallet-logo apple">
              <span className="apple-icon">🍎</span>
              <span>Apple Pay</span>
            </div>
            <p className="wallet-info">
              Click the button below to pay with Apple Pay. You'll use Face ID, Touch ID, or your passcode to confirm.
            </p>
            <button className="apple-pay-btn" onClick={handleSubmitOrder} disabled={isProcessing}>
              {isProcessing ? <><span className="spinner"></span> Processing...</> : <>🍎 Pay with Apple Pay</>}
            </button>
          </div>
        );

      case PAYMENT_METHODS.GOOGLE_PAY:
        return (
          <div className="digital-wallet-form">
            <div className="wallet-logo google">
              <span className="google-icon">G</span>
              <span>Google Pay</span>
            </div>
            <p className="wallet-info">
              Click the button below to pay with Google Pay. You'll confirm payment using your saved cards.
            </p>
            <button className="google-pay-btn" onClick={handleSubmitOrder} disabled={isProcessing}>
              {isProcessing ? <><span className="spinner"></span> Processing...</> : (
                <>
                  <span className="google-colors">
                    <span style={{color: '#4285F4'}}>G</span>
                    <span style={{color: '#EA4335'}}>o</span>
                    <span style={{color: '#FBBC05'}}>o</span>
                    <span style={{color: '#4285F4'}}>g</span>
                    <span style={{color: '#34A853'}}>l</span>
                    <span style={{color: '#EA4335'}}>e</span>
                  </span> Pay
                </>
              )}
            </button>
          </div>
        );

      case PAYMENT_METHODS.BANK_TRANSFER:
        return (
          <div className="bank-form">
            <div className="bank-logo">🏦 Bank Transfer</div>
            {bankDetails ? (
              <div className="bank-details">
                <h4>Transfer Details</h4>
                <div className="detail-row">
                  <span>Bank Name:</span>
                  <strong>{bankDetails.bankName}</strong>
                </div>
                <div className="detail-row">
                  <span>Account Number:</span>
                  <strong>{bankDetails.accountNumber}</strong>
                </div>
                <div className="detail-row">
                  <span>Account Name:</span>
                  <strong>{bankDetails.accountName}</strong>
                </div>
                <div className="detail-row">
                  <span>SWIFT Code:</span>
                  <strong>{bankDetails.swiftCode}</strong>
                </div>
                <div className="detail-row highlight">
                  <span>Reference:</span>
                  <strong>{bankDetails.reference}</strong>
                </div>
                <div className="detail-row highlight">
                  <span>Amount:</span>
                  <strong>${bankDetails.amount.toFixed(2)}</strong>
                </div>
                <p className="bank-warning">
                  ⚠️ Please include the reference number in your transfer. Your order will be processed once payment is confirmed.
                </p>
                <button className="confirm-transfer-btn" onClick={() => {
                  clearCart();
                  navigate('/order-success');
                }}>
                  I've Made the Transfer
                </button>
              </div>
            ) : (
              <p className="bank-info">
                Click "Generate Transfer Details" to get bank account information for your transfer.
              </p>
            )}
          </div>
        );

      case PAYMENT_METHODS.CASH_ON_DELIVERY:
        return (
          <div className="cod-form">
            <div className="cod-logo">💵 Cash on Delivery</div>
            <p className="cod-info">
              Pay with cash when your order is delivered. A small COD fee may apply.
            </p>
            <div className="cod-note">
              <h4>Please Note:</h4>
              <ul>
                <li>Payment is required upon delivery</li>
                <li>Please have exact change ready</li>
                <li>Order may require signature confirmation</li>
                <li>Available for orders under $500</li>
              </ul>
            </div>
          </div>
        );

      case PAYMENT_METHODS.CRYPTO:
        return (
          <div className="crypto-form">
            <div className="crypto-logo">₿ Cryptocurrency</div>
            <div className="crypto-options">
              <label className={`crypto-option ${selectedCrypto === 'bitcoin' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="crypto" 
                  value="bitcoin"
                  checked={selectedCrypto === 'bitcoin'}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                />
                <span className="crypto-icon">₿</span>
                <span>Bitcoin</span>
              </label>
              <label className={`crypto-option ${selectedCrypto === 'ethereum' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="crypto" 
                  value="ethereum"
                  checked={selectedCrypto === 'ethereum'}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                />
                <span className="crypto-icon">Ξ</span>
                <span>Ethereum</span>
              </label>
              <label className={`crypto-option ${selectedCrypto === 'usdt' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="crypto" 
                  value="usdt"
                  checked={selectedCrypto === 'usdt'}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                />
                <span className="crypto-icon">₮</span>
                <span>USDT</span>
              </label>
            </div>
            {cryptoAddresses && (
              <div className="crypto-details">
                <h4>Send {selectedCrypto.toUpperCase()} to:</h4>
                <div className="crypto-address">
                  <code>{cryptoAddresses[selectedCrypto]}</code>
                  <button 
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(cryptoAddresses[selectedCrypto]);
                      toast.success('Address copied!');
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="crypto-amount">
                  Amount: <strong>${total.toFixed(2)} USD equivalent</strong>
                </p>
                <p className="crypto-warning">
                  ⚠️ Send only {selectedCrypto.toUpperCase()} to this address. Your order will be confirmed after network confirmation.
                </p>
                <button className="confirm-crypto-btn" onClick={() => {
                  clearCart();
                  navigate('/order-success');
                }}>
                  I've Sent the Payment
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <h2>Your cart is empty</h2>
          <Link to="/products" className="shop-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Confirm</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form-section">
            {step === 1 && (
              <div className="shipping-form">
                <h2>Shipping Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={shippingInfo.firstName}
                      onChange={handleShippingChange}
                      placeholder="John"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={shippingInfo.lastName}
                      onChange={handleShippingChange}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>
                <div className="form-group full">
                  <label>Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      value={shippingInfo.postalCode}
                      onChange={handleShippingChange}
                      placeholder="00100"
                    />
                  </div>
                </div>
                <button 
                  className="continue-btn"
                  onClick={() => validateShipping() ? setStep(2) : toast.error('Please fill in all fields')}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="payment-form">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  {paymentMethodsConfig.map(method => (
                    <label 
                      key={method.id}
                      className={`payment-option ${selectedPayment === method.id ? 'active' : ''} ${method.popular ? 'popular' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                      />
                      <span className="option-content">
                        <span className="option-icon">{method.icon}</span>
                        <span className="option-details">
                          <span className="option-name">{method.name}</span>
                          <span className="option-desc">{method.description}</span>
                        </span>
                        {method.popular && <span className="popular-badge">Popular</span>}
                      </span>
                    </label>
                  ))}
                </div>
                
                <div className="payment-form-content">
                  {renderPaymentForm()}
                </div>
                
                <div className="form-buttons">
                  <button className="back-btn" onClick={() => setStep(1)}>Back</button>
                  <button className="continue-btn" onClick={() => setStep(3)}>Review Order</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="review-order">
                <h2>Review Your Order</h2>
                
                <div className="review-section">
                  <h3>Shipping To</h3>
                  <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.city}, {shippingInfo.postalCode}</p>
                  <p>{shippingInfo.email}</p>
                </div>

                <div className="review-section">
                  <h3>Payment Method</h3>
                  <p>
                    {paymentMethodsConfig.find(m => m.id === selectedPayment)?.icon}{' '}
                    {getPaymentMethodName()}
                    {selectedPayment === PAYMENT_METHODS.CREDIT_CARD && paymentInfo.cardNumber && 
                      ` ending in ${paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)}`
                    }
                    {selectedPayment === PAYMENT_METHODS.MPESA && mpesaPhone && 
                      ` - ${mpesaPhone}`
                    }
                  </p>
                </div>

                <div className="review-items">
                  <h3>Order Items ({cartItems.length})</h3>
                  {cartItems.map(item => (
                    <div key={item.id} className="review-item">
                      <img src={item.image} alt={item.name} />
                      <div className="review-item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="form-buttons">
                  <button className="back-btn" onClick={() => setStep(2)}>Back</button>
                  <button 
                    className="place-order-btn" 
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner"></span>
                        Processing...
                      </>
                    ) : (
                      selectedPayment === PAYMENT_METHODS.MPESA ? 
                        `Pay with M-Pesa • $${total.toFixed(2)}` :
                      selectedPayment === PAYMENT_METHODS.BANK_TRANSFER ?
                        'Generate Transfer Details' :
                      selectedPayment === PAYMENT_METHODS.CRYPTO ?
                        'Generate Crypto Address' :
                        `Place Order • $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="order-summary-section">
            <div className="order-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="summary-item-info">
                      <span className="name">{item.name}</span>
                      <span className="qty">x{item.quantity}</span>
                    </div>
                    <span className="price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="payment-badges">
                <div className="secure-badge">
                  🔒 Secure Checkout
                </div>
                <div className="accepted-payments">
                  <span>We accept:</span>
                  <div className="payment-icons">
                    💳 📱 🅿️ 🍎 🏦 ₿
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
