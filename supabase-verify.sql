-- Run this to verify all tables and data were created

-- 1. Count tables
SELECT 'Tables' as section, count(*) as value FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Count rows per table
SELECT 'Admin' as tbl, count(*) FROM "Admin"
UNION ALL SELECT 'Customer', count(*) FROM "Customer"
UNION ALL SELECT 'Category', count(*) FROM "Category"
UNION ALL SELECT 'Product', count(*) FROM "Product"
UNION ALL SELECT 'Setting', count(*) FROM "Setting"
UNION ALL SELECT 'Banner', count(*) FROM "Banner"
UNION ALL SELECT 'Coupon', count(*) FROM "Coupon"
UNION ALL SELECT 'Address', count(*) FROM "Address";

-- 3. Show admin (without password hash)
SELECT id, name, email, role, "isActive" FROM "Admin";

-- 4. Show categories
SELECT name, slug, "sortOrder" FROM "Category" ORDER BY "sortOrder";

-- 5. Show settings (first 5)
SELECT key, value FROM "Setting" LIMIT 5;
