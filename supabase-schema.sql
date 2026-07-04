-- ============================================================
-- Ayaan Fashion - Complete Supabase Schema + Seed Data
-- Run this in Supabase SQL Editor (New Project)
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enum types
DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 3. DROP existing tables (order respects foreign keys)
-- ============================================================
DROP TABLE IF EXISTS "WishlistItem" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "OrderStatusHistory" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "ProductVariant" CASCADE;
DROP TABLE IF EXISTS "ProductImage" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Address" CASCADE;
DROP TABLE IF EXISTS "Coupon" CASCADE;
DROP TABLE IF EXISTS "Banner" CASCADE;
DROP TABLE IF EXISTS "Setting" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "Admin" CASCADE;

-- ============================================================
-- 4. CREATE tables
-- ============================================================

-- Admin
CREATE TABLE "Admin" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_email ON "Admin"(email);

-- Customer
CREATE TABLE "Customer" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customer_email ON "Customer"(email);
CREATE INDEX idx_customer_phone ON "Customer"(phone);

-- Category
CREATE TABLE "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  "parentId" UUID,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_category_parent FOREIGN KEY ("parentId") REFERENCES "Category"(id) ON DELETE SET NULL
);
CREATE INDEX idx_category_parent ON "Category"("parentId");
CREATE INDEX idx_category_slug ON "Category"(slug);
CREATE INDEX idx_category_active ON "Category"("isActive");

-- Product
CREATE TABLE "Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  mrp DECIMAL(10,2) NOT NULL,
  "salePrice" DECIMAL(10,2) NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  sku TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
  "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
  "categoryId" UUID NOT NULL,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  tags TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_product_category FOREIGN KEY ("categoryId") REFERENCES "Category"(id) ON DELETE RESTRICT
);
CREATE INDEX idx_product_category ON "Product"("categoryId");
CREATE INDEX idx_product_slug ON "Product"(slug);
CREATE INDEX idx_product_sku ON "Product"(sku);
CREATE INDEX idx_product_active ON "Product"("isActive");
CREATE INDEX idx_product_featured ON "Product"("isFeatured");
CREATE INDEX idx_product_newarrival ON "Product"("isNewArrival");
CREATE INDEX idx_product_bestseller ON "Product"("isBestSeller");
CREATE INDEX idx_product_created ON "Product"("createdAt");

-- ProductImage
CREATE TABLE "ProductImage" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_productimage_product FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);
CREATE INDEX idx_productimage_product ON "ProductImage"("productId");
CREATE INDEX idx_productimage_primary ON "ProductImage"("isPrimary");

-- ProductVariant
CREATE TABLE "ProductVariant" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size TEXT,
  color TEXT,
  "colorCode" TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  price DECIMAL(10,2),
  "productId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_productvariant_product FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);
CREATE INDEX idx_productvariant_product ON "ProductVariant"("productId");
CREATE INDEX idx_productvariant_sku ON "ProductVariant"(sku);
CREATE INDEX idx_productvariant_size ON "ProductVariant"(size);
CREATE INDEX idx_productvariant_color ON "ProductVariant"(color);

-- Address
CREATE TABLE "Address" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" UUID,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_address_customer FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE
);
CREATE INDEX idx_address_customer ON "Address"("customerId");

-- Coupon
CREATE TABLE "Coupon" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'flat',
  "minOrder" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "maxUses" INTEGER NOT NULL DEFAULT 0,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coupon_code ON "Coupon"(code);
CREATE INDEX idx_coupon_active ON "Coupon"("isActive");
CREATE INDEX idx_coupon_expires ON "Coupon"("expiresAt");

-- Order
CREATE TABLE "Order" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderNumber" TEXT NOT NULL UNIQUE,
  "customerId" UUID,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "addressId" UUID,
  "shippingAddress" TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  notes TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  "couponId" UUID,
  "paymentMethod" TEXT NOT NULL DEFAULT 'cod',
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
  "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "trackingNumber" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_order_customer FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_address FOREIGN KEY ("addressId") REFERENCES "Address"(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_coupon FOREIGN KEY ("couponId") REFERENCES "Coupon"(id) ON DELETE SET NULL
);
CREATE INDEX idx_order_customer ON "Order"("customerId");
CREATE INDEX idx_order_number ON "Order"("orderNumber");
CREATE INDEX idx_order_status ON "Order"("orderStatus");
CREATE INDEX idx_order_created ON "Order"("createdAt");
CREATE INDEX idx_order_coupon ON "Order"("couponId");
CREATE INDEX idx_order_payment ON "Order"("paymentStatus");

-- OrderItem
CREATE TABLE "OrderItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  size TEXT,
  color TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_orderitem_order FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE,
  CONSTRAINT fk_orderitem_product FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE RESTRICT
);
CREATE INDEX idx_orderitem_order ON "OrderItem"("orderId");
CREATE INDEX idx_orderitem_product ON "OrderItem"("productId");

-- OrderStatusHistory
CREATE TABLE "OrderStatusHistory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL,
  status "OrderStatus" NOT NULL,
  note TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_ordershistory_order FOREIGN KEY ("orderId") REFERENCES "Order"(id) ON DELETE CASCADE
);
CREATE INDEX idx_ordershistory_order ON "OrderStatusHistory"("orderId");
CREATE INDEX idx_ordershistory_status ON "OrderStatusHistory"(status);

-- Banner
CREATE TABLE "Banner" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT,
  "linkText" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_banner_active ON "Banner"("isActive");
CREATE INDEX idx_banner_sort ON "Banner"("sortOrder");

-- Setting
CREATE TABLE "Setting" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- ActivityLog
CREATE TABLE "ActivityLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" UUID,
  action TEXT NOT NULL,
  entity TEXT,
  "entityId" TEXT,
  details TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_activitylog_admin FOREIGN KEY ("adminId") REFERENCES "Admin"(id) ON DELETE SET NULL
);
CREATE INDEX idx_activitylog_admin ON "ActivityLog"("adminId");
CREATE INDEX idx_activitylog_entity ON "ActivityLog"(entity);
CREATE INDEX idx_activitylog_created ON "ActivityLog"("createdAt");

-- Review
CREATE TABLE "Review" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL,
  comment TEXT,
  "customerId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_review_customer FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_product FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
);
CREATE INDEX idx_review_customer ON "Review"("customerId");
CREATE INDEX idx_review_product ON "Review"("productId");
CREATE INDEX idx_review_active ON "Review"("isActive");

-- WishlistItem
CREATE TABLE "WishlistItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "customerId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_wishlist_customer FOREIGN KEY ("customerId") REFERENCES "Customer"(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE,
  UNIQUE("customerId", "productId")
);

-- ============================================================
-- 5. SEED DATA
-- ============================================================

-- 5a. Admin (password: Komail@111173452B)
INSERT INTO "Admin" (id, name, email, password, role, "isActive")
VALUES (
  gen_random_uuid(),
  'Admin',
  'bhojanikomail@gmail.com',
  crypt('Komail@111173452B', gen_salt('bf', 12)),
  'superadmin',
  true
);

-- 5b. Categories
INSERT INTO "Category" (id, name, slug, description, "sortOrder") VALUES
  (gen_random_uuid(), 'Traditional Wear', 'traditional-wear', 'Elegant traditional clothing', 1),
  (gen_random_uuid(), 'Western Wear', 'western-wear', 'Modern western fashion', 2),
  (gen_random_uuid(), 'Footwear', 'footwear', 'Shoes and footwear', 3),
  (gen_random_uuid(), 'Accessories', 'accessories', 'Fashion accessories', 4),
  (gen_random_uuid(), 'Jewelry', 'jewelry', 'Handcrafted jewelry', 5);

-- 5c. Settings
INSERT INTO "Setting" (key, value) VALUES
  ('site_name', 'Ayaan Fashion'),
  ('site_description', 'Premium fashion destination for traditional and modern wear'),
  ('site_email', 'bhojanikomail@gmail.com'),
  ('site_phone', '+91-9876543210'),
  ('site_address', 'Shop no 06, Behman Arcade, opp. Bilal Hospital, Kausa, Mumbra, Thane, Maharashtra 400612'),
  ('shipping_cost', '50'),
  ('free_shipping_min', '999'),
  ('tax_percentage', '5'),
  ('currency', '₹'),
  ('social_instagram', 'https://instagram.com/ayaanfashion'),
  ('social_facebook', 'https://facebook.com/ayaanfashion'),
  ('social_youtube', 'https://youtube.com/@ayaanfashion');

-- ============================================================
-- 6. Update DATABASE_URL in backend .env
-- ============================================================
-- After running this, update backend/.env:
-- DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
--
-- Then update backend/prisma/schema.prisma datasource:
--   provider = "postgresql"
--   url      = env("DATABASE_URL")
--
-- Then run: cd backend && npx prisma generate && npm run start:dev