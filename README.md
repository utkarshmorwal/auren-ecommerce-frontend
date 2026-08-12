# 🛍️ Auren — Frontend (React)

This is the **frontend** of Auren, a full-stack e-commerce platform. It's a React application that provides the full shopping experience — browsing, cart, checkout, order tracking — plus a role-based admin dashboard.

**🔗 Live Site:** [veylo-ecommerce-frontend.vercel.app](https://veylo-ecommerce-frontend.vercel.app)
**🔗 Backend repo:** [veylo-ecommerce-backend](https://github.com/Anupam3792/veylo-ecommerce-backend) · [Live API](https://veylo-ecommerce-backend.onrender.com)

---

## ✨ Features

### Customer
- Product catalog with search, filters, and categories
- Product detail pages with image gallery, reviews & ratings, and related products
- Cart & wishlist management
- Secure checkout with **Razorpay** payment gateway
- Coupon / promo code support
- Order history and tracking
- Responsive, mobile-friendly UI with smooth page transitions

### Admin
- Role-based admin dashboard
- Product management (create, update, delete, inventory)
- Order management with live status and payment details
- Sales & order analytics
- User management
- Real-time notification system

---

## 🧱 Tech Stack

- React.js (Vite)
- Tailwind CSS
- Framer Motion (animations)
- Axios
- Deployed on **Vercel**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- The [backend API](https://github.com/Anupam3792/veylo-ecommerce-backend) running locally or accessible remotely

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Anupam3792/veylo-ecommerce-frontend.git
   cd veylo-ecommerce-frontend
   npm install
   ```

2. Create a `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_RAZORPAY_KEY_ID=<your_razorpay_key_id>
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The app will start on `http://localhost:5173`.

---

## 📁 Project Structure

```
src/
├── pages/           # Route-level pages (Home, Catalog, Checkout, Admin, etc.)
├── components/      # Reusable UI components
├── context/         # Global state (Auth, Cart, Wishlist, Notifications)
└── services/        # API client
```

---

## 🌐 Deployment

Deployed on [Vercel](https://vercel.com), auto-deployed from `main`.

---

## 🙋 Author

**Anupam Kumar**
Java Full Stack Developer
[GitHub](https://github.com/Anupam3792) • [LinkedIn](https://linkedin.com/in/anupam-kumar-4b6b94261)
