
# Auren E-Commerce Frontend

Auren is a modern full-stack e-commerce application built with React.js and integrated with a Java Spring Boot REST API backend. The application provides customer shopping features along with a dedicated admin dashboard for managing products, orders, and users.

## 🚀 Live Project

**Live Website:** https://auren-clothing-fashion.vercel.app

**Backend:** Deployed on Railway

## 🛠️ Tech Stack

- React.js
- JavaScript
- React Router
- Axios
- HTML5
- CSS3
- Vite
- Git & GitHub
- Vercel

## ✨ Features

### 👤 Authentication

- User registration
- User login
- OTP verification
- JWT-based authentication
- Protected routes
- Customer and admin roles

### 🛍️ Shopping

- Browse products
- Product search
- Product categories
- Product details
- Product images
- Product ratings and reviews
- Shopping cart
- Wishlist
- Checkout
- Order management

### 👨‍💼 Admin Dashboard

- Admin authentication
- Product management
- Add products
- Update products
- Delete products
- Stock management
- Order management
- User role management

### 💳 Payments

- Razorpay payment integration
- Online payment processing
- Payment verification

### 📧 Email & OTP

- OTP-based verification
- Email functionality
- Brevo integration

## 🔗 Backend Integration

The frontend communicates with the Spring Boot backend using REST APIs and Axios.

The API base URL is configured using the `VITE_API_URL` environment variable.

### Local Development

```env
VITE_API_URL=http://localhost:8080
```

### Production

```env
VITE_API_URL=https://YOUR-BACKEND-URL
```

The production API URL is configured through Vercel environment variables.

## ⚙️ Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/auren-ecommerce-frontend.git
cd auren-ecommerce-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8080
```

Make sure the Spring Boot backend is running on:

```text
http://localhost:8080
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## 🌐 Deployment

The frontend is deployed on Vercel.

The production architecture connects:

```text
React.js Frontend
        │
        │ REST API / Axios
        ▼
Spring Boot Backend
        │
        ▼
MySQL Database
```

### Production Environment

The frontend uses:

```text
VITE_API_URL
```

to communicate with the deployed Spring Boot backend.

CORS is configured in the backend to allow communication between the Vercel frontend and Railway backend.

## 📂 Project Structure

```text
src
│
├── components
├── pages
├── context
├── services
├── assets
├── App.jsx
└── main.jsx
```

## 🔐 Security

- Authentication handled through JWT
- Protected customer and admin routes
- API requests handled through Axios
- Production environment variables configured through Vercel
- Sensitive credentials are not committed to GitHub

## 👨‍💻 Author

**UTKARSH MORWAL**

Java Full-Stack Developer
