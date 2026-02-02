// Payment Service - Handles all payment methods
// In production, these would connect to actual payment gateways

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  MPESA: 'mpesa',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cod',
  CRYPTO: 'crypto'
}

export const paymentMethodsConfig = [
  {
    id: PAYMENT_METHODS.CREDIT_CARD,
    name: 'Credit / Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard, Amex',
    available: true
  },
  {
    id: PAYMENT_METHODS.MPESA,
    name: 'M-Pesa Express',
    icon: '📱',
    description: 'Pay via M-Pesa STK Push',
    available: true,
    popular: true
  },
  {
    id: PAYMENT_METHODS.PAYPAL,
    name: 'PayPal',
    icon: '🅿️',
    description: 'Pay with PayPal account',
    available: true
  },
  {
    id: PAYMENT_METHODS.APPLE_PAY,
    name: 'Apple Pay',
    icon: '🍎',
    description: 'Quick payment with Apple Pay',
    available: true
  },
  {
    id: PAYMENT_METHODS.GOOGLE_PAY,
    name: 'Google Pay',
    icon: '🔵',
    description: 'Fast checkout with Google Pay',
    available: true
  },
  {
    id: PAYMENT_METHODS.BANK_TRANSFER,
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct bank transfer',
    available: true
  },
  {
    id: PAYMENT_METHODS.CASH_ON_DELIVERY,
    name: 'Cash on Delivery',
    icon: '💵',
    description: 'Pay when you receive',
    available: true
  },
  {
    id: PAYMENT_METHODS.CRYPTO,
    name: 'Cryptocurrency',
    icon: '₿',
    description: 'Bitcoin, Ethereum, USDT',
    available: true
  }
]

// M-Pesa STK Push simulation
export const initiateMpesaPayment = async (phoneNumber, amount, orderId) => {
  // In production, this would call Safaricom Daraja API
  // POST to https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
  
  console.log('Initiating M-Pesa STK Push:', { phoneNumber, amount, orderId })
  
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful STK push initiation
      resolve({
        success: true,
        checkoutRequestId: 'ws_CO_' + Date.now(),
        merchantRequestId: 'MR_' + orderId,
        responseDescription: 'Success. Request accepted for processing',
        message: 'Please check your phone for the M-Pesa prompt'
      })
    }, 1500)
  })
}

// Check M-Pesa transaction status
export const checkMpesaStatus = async (checkoutRequestId) => {
  // In production, this would query Safaricom for transaction status
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        resultCode: 0,
        resultDescription: 'The service request is processed successfully.',
        transactionId: 'MPESA' + Date.now()
      })
    }, 3000)
  })
}

// Process credit card payment
export const processCardPayment = async (cardDetails, amount, orderId) => {
  // In production, this would integrate with Stripe, Flutterwave, etc.
  console.log('Processing card payment:', { amount, orderId })
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: 'CARD_' + Date.now(),
        message: 'Payment processed successfully'
      })
    }, 2000)
  })
}

// Process PayPal payment
export const processPayPalPayment = async (amount, orderId) => {
  // In production, this would use PayPal SDK
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: 'PP_' + Date.now(),
        message: 'PayPal payment completed'
      })
    }, 2000)
  })
}

// Process bank transfer
export const initiateBankTransfer = async (amount, orderId) => {
  return {
    success: true,
    bankName: 'E-Com Bank',
    accountNumber: '1234567890',
    accountName: 'E-Commerce Store Ltd',
    swiftCode: 'ECOMKE01',
    reference: 'ORD-' + orderId,
    amount: amount,
    message: 'Please transfer the exact amount with the reference number'
  }
}

// Validate phone number for M-Pesa (Kenyan format)
export const validateMpesaPhone = (phone) => {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Check if it's a valid Kenyan phone number
  // Should be 254XXXXXXXXX (12 digits) or 07XXXXXXXX (10 digits) or 01XXXXXXXX (10 digits)
  const kenyanRegex = /^(?:254|\+254|0)?(7[0-9]{8}|1[0-9]{8})$/
  
  return kenyanRegex.test(cleaned)
}

// Format phone number for M-Pesa API (254XXXXXXXXX format)
export const formatMpesaPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '')
  
  if (cleaned.startsWith('254')) {
    return cleaned
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1)
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned
  }
  
  return cleaned
}

// Crypto payment addresses (demo)
export const getCryptoAddresses = () => ({
  bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ethereum: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  usdt: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'
})
