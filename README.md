# Ayaan Fashion - E-commerce Platform

A premium, production-ready e-commerce platform built with Next.js 15, NestJS, PostgreSQL, and Docker.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** NestJS, TypeScript, Prisma ORM
- **Database:** PostgreSQL 16
- **Auth:** JWT with secure password hashing
- **Deployment:** Docker, Docker Compose

## Features

### Customer Features
- Browse products with advanced search, filtering, and sorting
- Product categories, new arrivals, and best sellers
- Product detail with image zoom, size/color variants
- Shopping cart with persistent storage
- Checkout with Cash on Delivery
- Order tracking with status timeline
- Responsive, mobile-first design

### Admin Features
- Secure admin login with JWT
- Dashboard with stats, charts, recent orders
- Product management (CRUD, duplicate, bulk operations)
- Category management
- Order management with status workflow
- Customer management
- Coupon management
- Banner management
- Settings management
- Reports and analytics
- Activity logs

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for production)
- PostgreSQL 16 (for local development)

### Installation

#### Option 1: Docker (Recommended for Production)

```bash
# Clone the repository
git clone <repository-url>
cd ayaan-fashion

# Start all services
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- API Docs: http://localhost:4000/api/docs
- Admin Panel: http://localhost:3000/admin/login

#### Option 2: Local Development

##### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server
npm run start:dev
```

##### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Default Admin Credentials

- **Email:** admin@ayaanfashion.com
- **Password:** admin123

## Project Structure

```
ayaan-fashion/
├── backend/                    # NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── products/          # Products module
│   │   ├── categories/        # Categories module
│   │   ├── orders/            # Orders module
│   │   ├── coupons/           # Coupons module
│   │   ├── banners/           # Banners module
│   │   ├── settings/          # Settings module
│   │   ├── customers/         # Customers module
│   │   ├── uploads/           # File uploads module
│   │   ├── prisma/            # Prisma service
│   │   └── common/            # Shared decorators, filters, interceptors
│   └── uploads/               # Uploaded files
├── frontend/                   # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── (shop)/        # Customer-facing pages
│       │   │   ├── page/      # Home page
│       │   │   ├── shop/      # Shop page
│       │   │   ├── product/   # Product detail
│       │   │   ├── cart/      # Shopping cart
│       │   │   ├── checkout/  # Checkout
│       │   │   ├── order-success/
│       │   │   ├── order-tracking/
│       │   │   ├── categories/
│       │   │   ├── new-arrivals/
│       │   │   ├── best-sellers/
│       │   │   ├── search/
│       │   │   ├── about/
│       │   │   ├── contact/
│       │   │   ├── privacy/
│       │   │   └── terms/
│       │   └── admin/         # Admin panel pages
│       │       ├── login/
│       │       ├── dashboard/
│       │       ├── orders/
│       │       ├── products/
│       │       ├── categories/
│       │       ├── customers/
│       │       ├── coupons/
│       │       ├── banners/
│       │       ├── settings/
│       │       ├── admins/
│       │       ├── reports/
│       │       └── logs/
│       ├── components/
│       │   ├── ui/            # Reusable UI components
│       │   ├── layout/        # Layout components
│       │   ├── product/       # Product components
│       │   ├── home/          # Home page components
│       │   ├── cart/          # Cart components
│       │   ├── checkout/      # Checkout components
│       │   └── admin/         # Admin components
│       ├── lib/               # Utilities, API client, store
│       ├── hooks/             # Custom hooks
│       ├── types/             # TypeScript types
│       └── styles/            # Additional styles
├── docker-compose.yml         # Docker Compose configuration
└── README.md                  # Project documentation
```

## API Endpoints

### Public
- `GET /api/products` - List products (paginated, filterable)
- `GET /api/products/featured` - Featured products
- `GET /api/products/new-arrivals` - New arrivals
- `GET /api/products/best-sellers` - Best sellers
- `GET /api/products/related/:id` - Related products
- `GET /api/products/:slug` - Product detail
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Category detail
- `GET /api/banners` - Active banners
- `GET /api/settings` - Public settings
- `POST /api/orders` - Place order
- `GET /api/orders/tracking/:orderNumber` - Track order
- `POST /api/coupons/validate` - Validate coupon
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/customer/register` - Customer register

### Admin (JWT Required)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Admin profile
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Order detail
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/dashboard` - Dashboard stats
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Customer detail
- `GET /api/customers/:id/orders` - Customer orders
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `PUT /api/settings` - Update settings
- `POST /api/uploads` - Upload file
- `POST /api/uploads/multiple` - Upload multiple files

## Database Schema

- **Admin** - Admin user accounts
- **Customer** - Customer accounts
- **Category** - Product categories (self-referencing for hierarchy)
- **Product** - Products with pricing, SEO fields
- **ProductImage** - Product images
- **ProductVariant** - Size/color variants
- **Order** - Customer orders
- **OrderItem** - Order line items
- **OrderStatusHistory** - Status change tracking
- **Address** - Customer addresses
- **Coupon** - Discount coupons
- **Banner** - Homepage banners
- **Setting** - Key-value settings
- **ActivityLog** - Admin action audit trail
- **Review** - Product reviews
- **WishlistItem** - Customer wishlist

## Deployment

### Production Build

```bash
# Build and start all services
docker-compose -f docker-compose.yml up --build -d

# Monitor logs
docker-compose logs -f
```

### Environment Variables

#### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://ayaan:ayaan_secret_2024@localhost:5432/ayaan_fashion |
| JWT_SECRET | JWT signing secret | ayaan_jwt_super_secret_key_2024 |
| JWT_EXPIRATION | JWT token expiry | 7d |
| PORT | Server port | 4000 |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

#### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:4000/api |
| NEXT_PUBLIC_SITE_URL | Site URL | http://localhost:3000 |
| NEXT_PUBLIC_UPLOADS_URL | Uploads URL | http://localhost:4000/uploads |

## License

MIT
