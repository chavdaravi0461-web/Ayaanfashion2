-- Sab data check karo
SELECT 'Admins' as tbl, count(*)::text FROM "Admin"
UNION ALL SELECT 'Categories', count(*)::text FROM "Category"
UNION ALL SELECT 'Products', count(*)::text FROM "Product"
UNION ALL SELECT 'Product Images', count(*)::text FROM "ProductImage"
UNION ALL SELECT 'Banners', count(*)::text FROM "Banner"
UNION ALL SELECT 'Coupons', count(*)::text FROM "Coupon"
UNION ALL SELECT 'Settings', count(*)::text FROM "Setting"
ORDER BY tbl;

-- Products with their images
SELECT p.name, p.sku, p."salePrice", p.stock, c.name as category,
  (SELECT count(*) FROM "ProductImage" pi WHERE pi."productId" = p.id) as images
FROM "Product" p
LEFT JOIN "Category" c ON c.id = p."categoryId"
ORDER BY c.name, p.name;

-- Banners
SELECT title, subtitle FROM "Banner";

-- Coupons
SELECT code, discount, type FROM "Coupon";
