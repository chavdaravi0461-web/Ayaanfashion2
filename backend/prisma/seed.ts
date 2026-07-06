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

  type SeedProduct = {
    name: string;
    slug: string;
    description: string;
    mrp: number;
    salePrice: number;
    sku: string;
    stock: number;
    categorySlug: string;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    variants?: { color: string; colorCode: string; stock: number }[];
  };

  const products: SeedProduct[] = [
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
    {
      name: 'Emporio Armani Chronograph Steel Watch',
      slug: 'emporio-armani-chronograph-steel',
      description: 'Premium Emporio Armani chronograph with stainless steel bracelet and dual sub-dials. Features a sophisticated dial design with date display, rose gold or silver accents, and a classic round case. Perfect for both formal and casual occasions. Comes with original Emporio Armani packaging.',
      mrp: 6990, salePrice: 1590, sku: 'WT-EA-CH-001', stock: 30,
      categorySlug: 'luxury-watches', isFeatured: true, isBestSeller: true,
      variants: [
        { color: 'White Dial / Rose Gold', colorCode: '#F5F5F5', stock: 6 },
        { color: 'White Dial / Silver', colorCode: '#FFFFFF', stock: 6 },
        { color: 'Blue Dial / Silver', colorCode: '#1E3A5F', stock: 6 },
        { color: 'Blue Dial / Rose Gold', colorCode: '#1E3A5F', stock: 6 },
        { color: 'Grey Dial / Rose Gold', colorCode: '#808080', stock: 6 },
      ],
    },
    {
      name: 'Armani Exchange A|X Octagonal Watch',
      slug: 'armani-exchange-ax-octagonal',
      description: 'Bold Armani Exchange octagonal case watch with stainless steel bracelet. Features the iconic A|X logo on the dial, day-date display, and a distinctive multi-sided bezel. Available in 5 stunning dial colors. A statement piece for the modern gentleman.',
      mrp: 7490, salePrice: 1590, sku: 'WT-AX-OC-001', stock: 30,
      categorySlug: 'luxury-watches', isFeatured: true, isNewArrival: true,
      variants: [
        { color: 'Blue Dial / Silver', colorCode: '#1E3A5F', stock: 6 },
        { color: 'Grey Dial / Gold', colorCode: '#808080', stock: 6 },
        { color: 'White Dial / Silver', colorCode: '#FFFFFF', stock: 6 },
        { color: 'Green Dial / Silver', colorCode: '#228B22', stock: 6 },
        { color: 'Mint Blue Dial / Silver', colorCode: '#98FF98', stock: 6 },
      ],
    },
    {
      name: 'Montblanc Time Walker Chronograph',
      slug: 'montblanc-timewalker-chronograph',
      description: 'Luxury Montblanc Time Walker chronograph with Swiss-made precision. Features a distinctive bi-compax dial layout, date window, and premium leather or steel bracelet options. Available in Blue, Black, and White dial variants with Rose Gold or Silver finishes. Comes in authentic Montblanc presentation box.',
      mrp: 7990, salePrice: 1590, sku: 'WT-MB-TW-001', stock: 20,
      categorySlug: 'luxury-watches', isFeatured: true,
      variants: [
        { color: 'Blue Dial / Steel', colorCode: '#1E3A5F', stock: 5 },
        { color: 'Blue Dial / Rose Gold', colorCode: '#1E3A5F', stock: 5 },
        { color: 'Black Dial / Black', colorCode: '#000000', stock: 5 },
        { color: 'White Dial / Rose Gold', colorCode: '#FFFFFF', stock: 5 },
      ],
    },
    {
      name: 'Armani Leather Belt Watch Collection',
      slug: 'armani-leather-belt-watch',
      description: 'Elegant Armani watch with premium leather strap and chronograph dial. Features a sophisticated design with multiple sub-dials, gold or silver case, and genuine leather belt in Brown, Black, and Tan shades. Perfect for office wear and special occasions.',
      mrp: 5990, salePrice: 1590, sku: 'WT-AL-LB-001', stock: 25,
      categorySlug: 'casual-watches', isBestSeller: true,
      variants: [
        { color: 'Brown Leather / Gold', colorCode: '#8B4513', stock: 5 },
        { color: 'Dark Brown Leather / Gold', colorCode: '#654321', stock: 5 },
        { color: 'Black Leather / Gold', colorCode: '#000000', stock: 5 },
        { color: 'Black Leather / Silver', colorCode: '#000000', stock: 5 },
        { color: 'Tan Leather / Silver', colorCode: '#D2B48C', stock: 5 },
      ],
    },
    {
      name: 'Fossil Chronograph Leather Watch',
      slug: 'fossil-chronograph-leather',
      description: 'Classic Fossil chronograph with genuine leather strap and three sub-dial design. Features Roman numeral indices, date display, and a sleek round case. Available in Black, Green, and Blue dials with Brown, Black leather straps and Silver or Gold cases. A timeless accessory for every man.',
      mrp: 6490, salePrice: 1590, sku: 'WT-FO-CL-001', stock: 25,
      categorySlug: 'casual-watches', isNewArrival: true,
      variants: [
        { color: 'Black Dial / Black Leather / Black Case', colorCode: '#000000', stock: 5 },
        { color: 'Black Dial / Brown Leather / Gold Case', colorCode: '#000000', stock: 5 },
        { color: 'Green Dial / Brown Leather / Silver Case', colorCode: '#228B22', stock: 5 },
        { color: 'Blue Dial / Brown Leather / Silver Case', colorCode: '#1E3A5F', stock: 5 },
        { color: 'Black Dial / Black Leather / Silver Case', colorCode: '#000000', stock: 5 },
      ],
    },
  ];

  for (const p of products) {
    const categoryId = catMap[p.categorySlug];
    if (!categoryId) continue;
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      const created = await prisma.product.create({
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
      if (p.variants && p.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: p.variants.map((v, i) => ({
            productId: created.id,
            color: v.color,
            colorCode: v.colorCode,
            stock: v.stock,
            sku: `${p.sku}-V${i + 1}`,
          })),
        });
      }
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
