# 🛒 SmartCart Application

A full-stack Smart Cart application with camera barcode scanning, admin panel, and payment gateway integration.

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React.js
- **Payment**: Razorpay, Stripe, Cash on Delivery
- **Camera Scanning**: html5-qrcode (laptop/mobile webcam)
- **Auth**: JWT-based authentication

---

## 📁 Project Structure

```
smart-cart/
├── backend/          # Express.js API
│   ├── models/       # MongoDB Schemas
│   ├── routes/       # API Routes
│   ├── middleware/   # Auth middleware
│   └── server.js     # Entry point
├── frontend/         # React.js app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth & Cart context
│   │   └── pages/        # All pages + admin/
│   └── public/
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## 🔑 Environment Variables (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartcart
JWT_SECRET=your_jwt_secret_here

# Stripe (International Cards)
STRIPE_SECRET_KEY=sk_test_...

# Razorpay (UPI / India)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret

CLIENT_URL=http://localhost:3000
```

---

## 👥 User Roles

### Admin
- Register with role `admin` and secret key: `ADMIN_SECRET_2024`
- Access admin panel at `/admin`
- Add/edit/delete products with barcode
- Add product image from file OR **capture from laptop camera**
- View and manage all orders

### Customer (User)
- Register normally
- Browse and search products
- **Scan product barcodes using laptop webcam** at `/scanner`
- Add to cart and checkout
- Pay via Razorpay, Stripe, or COD
- View order history

---

## 📷 Camera Features

### User - Barcode Scanner
- Navigate to `/scanner`
- Click **Start Camera** to activate laptop webcam
- Point camera at any product barcode
- Product is automatically found and can be added to cart
- Also supports **manual barcode entry**

### Admin - Product Image Capture
- In Add/Edit Product form
- Click **📷 Camera** button
- Live preview shows webcam feed
- Click **📸 Capture** to take photo and use as product image

---

## 💳 Payment Gateway

### Razorpay (Default - India)
- Supports UPI, Cards, Net Banking, Wallets
- Test mode: use test credentials from Razorpay dashboard
- Test UPI: `success@razorpay`

### Stripe
- International cards
- Integrate Stripe Elements in `Checkout.js` for full card UI

### Cash on Delivery
- No payment gateway needed
- Order placed directly

---

## 🗂️ API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Products
- `GET /api/products` — List all (with search/filter)
- `GET /api/products/:id` — Get single
- `GET /api/products/barcode/:barcode` — **Barcode lookup (for scanner)**
- `GET /api/products/categories`
- `POST /api/products` — Create (Admin)
- `PUT /api/products/:id` — Update (Admin)
- `DELETE /api/products/:id` — Delete (Admin)

### Cart
- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove/:productId`
- `DELETE /api/cart/clear`

### Payment
- `POST /api/payment/razorpay/create-order`
- `POST /api/payment/razorpay/verify`
- `POST /api/payment/stripe/create-intent`
- `POST /api/payment/stripe/confirm`
- `POST /api/payment/cod/place-order`

### Orders
- `GET /api/orders/my-orders`
- `GET /api/orders/all` (Admin)
- `PUT /api/orders/:id/status` (Admin)

---

## 🎯 Demo Credentials

After starting, create accounts at `/register`:
- **Admin**: email + `ADMIN_SECRET_2024` as admin secret
- **User**: Register normally

---

## 📝 Notes

- Products need a **barcode field** for scanner to work
- Add sample products via admin panel with real barcodes from product packaging
- For Razorpay test: use `rzp_test_*` keys from your Razorpay dashboard
- Camera requires HTTPS in production (works on localhost without HTTPS)
