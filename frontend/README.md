# E-Commerce Frontend

A modern React-based e-commerce application built with Vite.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The app will be available at `http://localhost:5174`

## Backend Setup

Ensure the backend is running on port 5000. See backend README for details.

## Mobile/Android Access

To access the app from mobile devices or Android emulators:

1. Run the backend on your local machine.
2. Find your local IP address.
3. Access the frontend from mobile using: `http://<your-local-ip>:5174`
4. For API calls from Android apps, use: `http://<your-local-ip>:5000/api`

To generate the current API link for Android:
```bash
node generate-android-api-link.js
```

## Features

- User authentication (login/register)
- Product browsing and search
- Shopping cart and wishlist
- Order management
- Responsive design for mobile and desktop
