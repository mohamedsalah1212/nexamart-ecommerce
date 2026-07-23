# NexaMart — Enterprise E-Commerce Platform

A production-ready enterprise e-commerce platform built with Next.js 15, Express.js, PostgreSQL, and a premium Royal Blue design system.

## Tech Stack

**Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Hook Form, Zod, Lucide Icons

**Backend:** Node.js, Express.js, TypeScript, Prisma ORM, SQLite, JWT Authentication, Multer

**Deployment:** Docker Compose, Hostinger VPS Ready

## Features

### Customer Features
- 🏠 **Premium Homepage** — Hero slider, promotional banners, flash deals, featured/trending/best seller products
- 🔍 **Instant Search** — Autocomplete search with product suggestions
- 🛍️ **Product Catalog** — Category filtering, sorting, pagination
- 📄 **Product Pages** — Image gallery, zoom, specifications, reviews, related products
- ❤️ **Wishlist** — Save and manage favorite products
- 🛒 **Shopping Cart** — Add/remove/update quantities with drawer and full page views
- 📦 **Checkout** — COD order form with validation (Zod)
- 📋 **Order Tracking** — Track order status with timeline
- 💬 **WhatsApp Integration** — Share order details via WhatsApp

### Admin Dashboard
- 📊 **Dashboard** — Sales analytics, revenue chart, order statistics, notifications
- 📦 **Product Management** — CRUD, duplicate, media upload, featured/best seller/trending/flash deal tags
- 🏷️ **Category Management** — CRUD with drag-and-drop reordering
- 🖼️ **Banner Management** — CRUD with scheduling and active/inactive toggle
- 📋 **Order Management** — View all orders, update status, call/WhatsApp customer
- ⭐ **Review Management** — Approve/hide/delete customer reviews
- ⚙️ **Settings** — Site name, contact info, social media, delivery/payment info

### Design System
- **Primary:** Royal Blue (#1e40af) & Navy (#102a43)
- **Style:** Premium, elegant, minimal, professional
- **Responsive:** Mobile-first, perfect across all devices
- **Components:** Cards, badges, buttons, inputs, tables, skeletons

## Quick Start

### Prerequisites
- Node.js 20+
- No database setup needed — uses SQLite (file-based, zero config)

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed    # Creates admin + default data
npm run dev        # Starts on port 5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Starts on port 3000
```

### 3. Access
- **Store:** http://localhost:3000
- **Admin:** http://localhost:3000/admin
- **Login:** admin@example.com / admin123

### Docker Deployment
```bash
docker-compose up -d
```

## Project Structure

```
ecommerce-platform/
├── backend/
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── config/      # App config, database client
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/   # Auth, upload, error handling
│   │   ├── routes/      # API route definitions
│   │   └── index.ts     # Server entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages (App Router)
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # Utilities, API client
│   │   └── store/       # Zustand state management
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

### Public
- `GET /api/products` — List products (with filters, search, pagination)
- `GET /api/products/:slug` — Product detail
- `GET /api/categories` — List categories
- `GET /api/categories/:slug` — Category detail
- `GET /api/banners/active` — Active banners
- `GET /api/cart` — Get cart (requires x-session-id header)
- `POST /api/cart` — Add to cart
- `POST /api/orders` — Place order
- `GET /api/orders/track/:orderId` — Track order
- `GET /api/wishlist` — Get wishlist
- `POST /api/wishlist` — Toggle wishlist
- `POST /api/reviews` — Submit review

### Admin (requires JWT)
- `POST /api/auth/login` — Admin login
- `GET /api/auth/me` — Current admin
- Full CRUD for products, categories, banners, orders, reviews, settings
- `GET /api/orders/dashboard` — Dashboard analytics

## Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
