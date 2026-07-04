import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Komail@111173452B', 12);
  await prisma.admin.upsert({
    where: { email: 'bhojanikomail@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'bhojanikomail@gmail.com',
      password: adminPassword,
      role: 'superadmin',
    },
  });

  const categories = [
    { name: 'Men\'s Footwear', slug: 'mens-footwear', description: 'Premium shoes for men — sneakers, formal, loafers & more', sortOrder: 1 },
    { name: 'Women\'s Footwear', slug: 'womens-footwear', description: 'Trendy footwear for women — heels, flats, sneakers & more', sortOrder: 2 },
    { name: 'Sports & Running', slug: 'sports-running', description: 'Performance shoes for running, training & sports', sortOrder: 3 },
    { name: 'Luxury Watches', slug: 'luxury-watches', description: 'Premium timepieces from top brands', sortOrder: 4 },
    { name: 'Smart Watches', slug: 'smart-watches', description: 'Smart wearables with style and function', sortOrder: 5 },
    { name: 'Casual Watches', slug: 'casual-watches', description: 'Everyday watches for any occasion', sortOrder: 6 },
    { name: 'Accessories', slug: 'accessories', description: 'Watch bands, straps, shoe care & more', sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const settings = [
    { key: 'site_name', value: 'Ayaan Footwear & Watches' },
    { key: 'site_description', value: 'Premium shoes and watches — curated for style and performance' },
    { key: 'site_email', value: 'bhojanikomail@gmail.com' },
    { key: 'site_phone', value: '+91-9876543210' },
    { key: 'site_address', value: 'Shop no 06, Behman Arcade, opp. Bilal Hospital, Kausa, Mumbra, Thane, Maharashtra 400612' },
    { key: 'shipping_cost', value: '50' },
    { key: 'free_shipping_min', value: '999' },
    { key: 'tax_percentage', value: '5' },
    { key: 'currency', value: '\u20b9' },
    { key: 'social_instagram', value: 'https://instagram.com/ayaanfashion' },
    { key: 'social_facebook', value: 'https://facebook.com/ayaanfashion' },
    { key: 'social_youtube', value: 'https://youtube.com/@ayaanfashion' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (created) catMap[cat.slug] = created.id;
  }

  const products = [
    {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'Iconic lifestyle sneaker with a large Air unit for all-day comfort. Features a mesh upper with synthetic overlays and a sleek modern silhouette.',
      mrp: 15995, salePrice: 11999, sku: 'SH-NK-001', stock: 45,
      categorySlug: 'mens-footwear', isFeatured: true, isNewArrival: true,
    },
    {
      name: 'Adidas Ultraboost Light',
      slug: 'adidas-ultraboost-light',
      description: 'The lightest Ultraboost yet. Responsive BOOST midsole with Primeknit upper for a sock-like fit and ultimate energy return.',
      mrp: 17999, salePrice: 13999, sku: 'SH-AD-001', stock: 30,
      categorySlug: 'mens-footwear', isFeatured: true,
    },
    {
      name: 'Puma Cali Dream',
      slug: 'puma-cali-dream',
      description: 'Chunky sneaker with a platform silhouette. Leather upper with perforation details and a cushioned insole for all-day wear.',
      mrp: 8995, salePrice: 6499, sku: 'SH-PU-001', stock: 25,
      categorySlug: 'womens-footwear', isNewArrival: true,
    },
    {
      name: 'New Balance 574',
      slug: 'new-balance-574',
      description: 'Timeless classic with a mix of suede and mesh upper. ENCAP midsole technology provides lightweight cushioning and support.',
      mrp: 11999, salePrice: 8499, sku: 'SH-NB-001', stock: 35,
      categorySlug: 'mens-footwear', isBestSeller: true,
    },
    {
      name: 'ASICS Gel-Kayano 30',
      slug: 'asics-gel-kayano-30',
      description: 'Premium stability running shoe with PureGEL technology and FF BLAST PLUS ECO cushioning. Designed for long-distance comfort.',
      mrp: 18999, salePrice: 14999, sku: 'SH-AS-001', stock: 20,
      categorySlug: 'sports-running', isFeatured: true, isBestSeller: true,
    },
    {
      name: 'Rolex Submariner Date',
      slug: 'rolex-submariner-date',
      description: 'Iconic dive watch with 41mm Oystersteel case. Cerachrom bezel, automatic movement, and 300m water resistance. The ultimate luxury timepiece.',
      mrp: 985000, salePrice: 985000, sku: 'WT-RL-001', stock: 3,
      categorySlug: 'luxury-watches', isFeatured: true, isBestSeller: true,
    },
    {
      name: 'Apple Watch Ultra 2',
      slug: 'apple-watch-ultra-2',
      description: 'The most rugged Apple Watch yet. 49mm titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.',
      mrp: 89900, salePrice: 84900, sku: 'WT-AP-001', stock: 15,
      categorySlug: 'smart-watches', isFeatured: true, isNewArrival: true,
    },
    {
      name: 'Casio G-Shock GA-2100',
      slug: 'casio-g-shock-ga-2100',
      description: 'The iconic octagonal CasiOak design. Carbon core guard structure, shock resistant, 200m water resistance, and world time.',
      mrp: 6495, salePrice: 5495, sku: 'WT-CS-001', stock: 50,
      categorySlug: 'casual-watches', isBestSeller: true,
    },
    {
      name: 'Titan Karishma Quartz',
      slug: 'titan-karishma-quartz',
      description: 'Elegant analogue watch with stainless steel strap and mother-of-pearl dial. Perfect for formal occasions and daily wear.',
      mrp: 5495, salePrice: 3995, sku: 'WT-TT-001', stock: 40,
      categorySlug: 'casual-watches', isNewArrival: true,
    },
    {
      name: 'Samsung Galaxy Watch 6',
      slug: 'samsung-galaxy-watch-6',
      description: 'Sleek smartwatch with BioActive sensor, sapphire crystal display, and Wear OS powered by Samsung. Track your fitness and style.',
      mrp: 34999, salePrice: 29999, sku: 'WT-SG-001', stock: 22,
      categorySlug: 'smart-watches', isBestSeller: true,
    },
    {
      name: 'Skechers GOwalk 6',
      slug: 'skechers-gowalk-6',
      description: 'Ultra-lightweight walking shoe with Skechers Air-Cooled Goga Mat insole and ULTRA GO cushioning for maximum comfort.',
      mrp: 6999, salePrice: 5499, sku: 'SH-SK-001', stock: 40,
      categorySlug: 'womens-footwear', isFeatured: true,
    },
    {
      name: 'Fossil Gen 6 Hybrid',
      slug: 'fossil-gen-6-hybrid',
      description: 'Hybrid smartwatch with analog design and smart features. Heart rate tracking, activity tracking, and customizable dials.',
      mrp: 24995, salePrice: 17995, sku: 'WT-FS-001', stock: 12,
      categorySlug: 'smart-watches', isNewArrival: true,
    },
  ];

  for (const p of products) {
    const categoryId = catMap[p.categorySlug];
    if (!categoryId) continue;
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          mrp: p.mrp,
          salePrice: p.salePrice,
          sku: p.sku,
          stock: p.stock,
          discount: Math.round(((p.mrp - p.salePrice) / p.mrp) * 100),
          categoryId,
          isActive: true,
          isFeatured: p.isFeatured || false,
          isNewArrival: p.isNewArrival || false,
          isBestSeller: p.isBestSeller || false,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
