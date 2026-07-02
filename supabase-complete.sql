-- ============================================================
-- AYAAN FASHION — Complete Database Schema + Seed Data
-- Run this ONCE in Supabase SQL Editor
-- No changes needed — just paste and run
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enum
DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- DROP existing tables (clean slate)
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
-- CREATE ALL TABLES
-- ============================================================

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

CREATE TABLE "Setting" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

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
-- SEED DATA
-- ============================================================

-- 1. Admin
INSERT INTO "Admin" (name, email, password, role, "isActive") VALUES
  ('Admin', 'bhojanikomail@gmail.com', crypt('Komail@111173452B', gen_salt('bf', 12)), 'superadmin', true);

-- 2. Categories (capture IDs for products)
WITH cat AS (
  INSERT INTO "Category" (name, slug, description, "sortOrder") VALUES
    ('Traditional Wear', 'traditional-wear', 'Elegant traditional clothing for men and women', 1),
    ('Western Wear', 'western-wear', 'Modern western fashion trends', 2),
    ('Footwear', 'footwear', 'Premium shoes and footwear collection', 3),
    ('Accessories', 'accessories', 'Complete your look with stylish accessories', 4),
    ('Jewelry', 'jewelry', 'Handcrafted fine jewelry', 5)
  RETURNING id, slug
)
-- 3. Products (using category slugs to map)
, trad AS (SELECT id FROM cat WHERE slug = 'traditional-wear')
, west AS (SELECT id FROM cat WHERE slug = 'western-wear')
, foot AS (SELECT id FROM cat WHERE slug = 'footwear')
, acc AS (SELECT id FROM cat WHERE slug = 'accessories')
, jewl AS (SELECT id FROM cat WHERE slug = 'jewelry')
, p1 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Kurta Set — Embroidered Cotton', 'kurta-set-embroidered-cotton',
    'Hand-embroidered cotton kurta set with matching dupatta. Features intricate thread work on the neckline and cuffs. Perfect for festive occasions and family gatherings.',
    2999, 1999, 33, 'TRD-KURTA-001', 50, true, true, true, true, id, 'kurta,traditional,ethnic,cotton,festive'
  FROM trad
), p2 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Lehenga Choli — Designer Silk', 'lehenga-choli-designer-silk',
    'Rich silk lehenga choli with zari embroidery and sequin work. Three-piece set includes lehenga, blouse and dupatta. Wedding-ready elegance.',
    15999, 9999, 37, 'TRD-LEHENGA-001', 20, true, true, false, true, id, 'lehenga,silk,wedding,bridal,designer'
  FROM trad
), p3 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Banarasi Silk Saree', 'banarasi-silk-saree',
    'Authentic Banarasi silk saree with gold zari weave. Comes with a contrasting blouse piece. A timeless addition to any wardrobe.',
    8499, 5499, 35, 'TRD-SAREE-001', 30, true, true, true, false, id, 'saree,banarasi,silk,zari,traditional'
  FROM trad
), p4 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Sherwani — Classic Beige', 'sherwani-classic-beige',
    'Premium beige sherwani with subtle gold embroidery. Made from luxury fabric blend. Ideal for weddings and formal celebrations.',
    12999, 7999, 38, 'TRD-SHERWANI-001', 15, true, false, false, false, id, 'sherwani,men,wedding,formal,beige'
  FROM trad
)
-- 4. Western Wear
, p5 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Floral Midi Dress', 'floral-midi-dress',
    'Beautiful floral print midi dress with tiered ruffles. Features a smocked bodice and adjustable spaghetti straps. Perfect for summer days.',
    2499, 1499, 40, 'WST-DRESS-001', 45, true, true, true, false, id, 'dress,floral,summer,casual,midi'
  FROM west
), p6 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'High-Rise Skinny Jeans', 'high-rise-skinny-jeans',
    'Comfortable high-rise skinny jeans in stretch denim. Features a classic five-pocket design and belt loops. Available in multiple washes.',
    1999, 1299, 35, 'WST-JEANS-001', 60, true, true, false, true, id, 'jeans,denim,skinny,high-rise,casual'
  FROM west
), p7 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Crisp White Button-Up Shirt', 'crisp-white-button-up-shirt',
    'Classic white cotton button-up shirt with a tailored fit. Features a spread collar and adjustable cuffs. Wardrobe essential for every professional.',
    1799, 1199, 33, 'WST-SHIRT-001', 40, true, false, false, false, id, 'shirt,white,formal,cotton,office'
  FROM west
), p8 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Tailored Blazer — Navy Blue', 'tailored-blazer-navy-blue',
    'Slim-fit navy blue blazer crafted from premium wool blend. Features notch lapels, two-button closure, and interior pockets. Power dressing at its finest.',
    8999, 5999, 33, 'WST-BLAZER-001', 25, true, false, false, false, id, 'blazer,navy,formal,wool,office'
  FROM west
)
-- 5. Footwear
, p9 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Stiletto Heels — Black Patent', 'stiletto-heels-black-patent',
    'Sleek black patent leather stiletto heels with pointed toe. Features a comfortable padded insole and non-slip sole. Elevate any outfit.',
    3499, 2499, 29, 'FTW-HEELS-001', 35, true, true, true, false, id, 'heels,stiletto,black,formal,patent'
  FROM foot
), p10 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'White Chunky Sneakers', 'white-chunky-sneakers',
    'Trendy chunky sneakers in crisp white. Features a cushioned sole for all-day comfort and breathable mesh lining. Street-style essential.',
    3999, 2799, 30, 'FTW-SNEAKERS-001', 55, true, true, false, true, id, 'sneakers,white,chunky,casual,sporty'
  FROM foot
), p11 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Leather Sandals — Tan Brown', 'leather-sandals-tan-brown',
    'Handcrafted leather sandals in rich tan brown. Features an adjustable buckle and cushioned footbed. Perfect for casual summer outings.',
    2499, 1699, 32, 'FTW-SANDALS-001', 40, true, false, false, false, id, 'sandals,leather,tan,casual,summer'
  FROM foot
)
-- 6. Accessories
, p12 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Minimalist Leather Watch — Rose Gold', 'minimalist-leather-watch-rose-gold',
    'Elegant minimalist watch with rose gold case and genuine leather strap. Japanese quartz movement. Slim profile fits under any cuff.',
    5999, 3999, 33, 'ACC-WATCH-001', 30, true, false, false, false, id, 'watch,leather,rose-gold,minimalist,formal'
  FROM acc
), p13 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Tote Bag — Structured Vegan Leather', 'tote-bag-structured-vegan-leather',
    'Spacious structured tote bag in premium vegan leather. Features a top zip closure, interior pockets, and gold-toned hardware. Fits a 13" laptop.',
    4499, 2999, 33, 'ACC-BAG-001', 25, true, false, false, false, id, 'tote,bag,vegan-leather,office,everyday'
  FROM acc
)
-- 7. Jewelry
, p14 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Gold-Plated Layered Necklace', 'gold-plated-layered-necklace',
    'Stunning gold-plated layered necklace with delicate chain links and a central pendant. Adjustable length. Adds elegance to any neckline.',
    2999, 1999, 33, 'JWL-NECKLACE-001', 40, true, true, true, false, id, 'necklace,gold,layered,party,traditional'
  FROM jewl
), p15 AS (
  INSERT INTO "Product" (name, slug, description, mrp, "salePrice", discount, sku, stock, "isActive", "isFeatured", "isNewArrival", "isBestSeller", "categoryId", tags)
  SELECT
    'Pearl & Crystal Drop Earrings', 'pearl-crystal-drop-earrings',
    'Elegant drop earrings featuring freshwater pearls and sparkling crystal accents. Hypoallergenic posts. Perfect for weddings and special occasions.',
    1999, 1299, 35, 'JWL-EARRINGS-001', 50, true, false, false, false, id, 'earrings,pearl,crystal,bridal,party'
  FROM jewl
)
-- 8. Product Images
SELECT 'Products created' as status;

-- Kurta images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', 'Kurta Set Front View', true, 0, id FROM "Product" WHERE slug = 'kurta-set-embroidered-cotton';
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1598935898639-81586f7d2129?w=600', 'Kurta Set Detail', false, 1, id FROM "Product" WHERE slug = 'kurta-set-embroidered-cotton';

-- Lehenga images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600', 'Lehenga Choli Front', true, 0, id FROM "Product" WHERE slug = 'lehenga-choli-designer-silk';
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600', 'Lehenga Choli Back', false, 1, id FROM "Product" WHERE slug = 'lehenga-choli-designer-silk';

-- Saree images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', 'Banarasi Saree', true, 0, id FROM "Product" WHERE slug = 'banarasi-silk-saree';

-- Sherwani images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1623605931891-d6e95f639bca?w=600', 'Classic Sherwani', true, 0, id FROM "Product" WHERE slug = 'sherwani-classic-beige';

-- Dress images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', 'Floral Dress Front', true, 0, id FROM "Product" WHERE slug = 'floral-midi-dress';

-- Jeans images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 'Skinny Jeans', true, 0, id FROM "Product" WHERE slug = 'high-rise-skinny-jeans';

-- Shirt images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 'White Shirt', true, 0, id FROM "Product" WHERE slug = 'crisp-white-button-up-shirt';

-- Blazer images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', 'Navy Blazer', true, 0, id FROM "Product" WHERE slug = 'tailored-blazer-navy-blue';

-- Heels images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1543168256-77e0a1f1f96a?w=600', 'Black Stiletto Heels', true, 0, id FROM "Product" WHERE slug = 'stiletto-heels-black-patent';

-- Sneakers images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 'White Sneakers', true, 0, id FROM "Product" WHERE slug = 'white-chunky-sneakers';

-- Sandals images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1603487742131-4e4b2c3a10b8?w=600', 'Leather Sandals', true, 0, id FROM "Product" WHERE slug = 'leather-sandals-tan-brown';

-- Watch images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', 'Rose Gold Watch', true, 0, id FROM "Product" WHERE slug = 'minimalist-leather-watch-rose-gold';

-- Bag images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600', 'Vegan Leather Tote', true, 0, id FROM "Product" WHERE slug = 'tote-bag-structured-vegan-leather';

-- Necklace images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 'Gold Layered Necklace', true, 0, id FROM "Product" WHERE slug = 'gold-plated-layered-necklace';

-- Earrings images
INSERT INTO "ProductImage" (url, alt, "isPrimary", "sortOrder", "productId")
SELECT 'https://images.unsplash.com/photo-1535632066927-ab7c6ab60908?w=600', 'Pearl Drop Earrings', true, 0, id FROM "Product" WHERE slug = 'pearl-crystal-drop-earrings';

-- 9. Banners
INSERT INTO "Banner" (title, subtitle, image, link, "linkText", "isActive", "sortOrder") VALUES
  ('New Season Collection', 'Discover the latest trends in traditional and modern fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200', '/shop', 'Shop Now', true, 1),
  ('Festive Special — Up to 50% Off', 'Exclusive deals on lehengas, sarees and sherwanis', 'https://images.unsplash.com/photo-1600091166971-9862256d254d?w=1200', '/category/traditional-wear', 'Explore Traditional Wear', true, 2),
  ('Summer Essentials', 'Light, breathable fabrics for the warm months ahead', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200', '/new-arrivals', 'View New Arrivals', true, 3);

-- 10. Coupons
INSERT INTO "Coupon" (code, description, discount, type, "minOrder", "maxUses", "isActive", "expiresAt") VALUES
  ('WELCOME20', '20% off your first order', 20, 'percentage', 500, 100, true, now() + interval '90 days'),
  ('FREESHIP', 'Free shipping on orders above ₹999', 50, 'flat', 999, 200, true, now() + interval '60 days'),
  ('FESTIVE15', '15% off on festive collection', 15, 'percentage', 1000, 50, true, now() + interval '30 days');

-- 11. Settings
INSERT INTO "Setting" (key, value) VALUES
  ('site_name', 'Ayaan Fashion'),
  ('site_description', 'Premium fashion destination for traditional and modern wear'),
  ('site_email', 'bhojanikomail@gmail.com'),
  ('site_phone', '+91-9876543210'),
  ('site_address', '123 Fashion Street, Mumbai - 400001'),
  ('shipping_cost', '50'),
  ('free_shipping_min', '999'),
  ('tax_percentage', '5'),
  ('currency', '₹'),
  ('social_instagram', 'https://instagram.com/ayaanfashion'),
  ('social_facebook', 'https://facebook.com/ayaanfashion'),
  ('social_youtube', 'https://youtube.com/@ayaanfashion');

-- ============================================================
-- VERIFICATION (run these separately to confirm)
-- ============================================================
-- SELECT 'Admins' as tbl, count(*) FROM "Admin"
-- UNION ALL SELECT 'Categories', count(*) FROM "Category"
-- UNION ALL SELECT 'Products', count(*) FROM "Product"
-- UNION ALL SELECT 'Product Images', count(*) FROM "ProductImage"
-- UNION ALL SELECT 'Banners', count(*) FROM "Banner"
-- UNION ALL SELECT 'Coupons', count(*) FROM "Coupon"
-- UNION ALL SELECT 'Settings', count(*) FROM "Setting";
