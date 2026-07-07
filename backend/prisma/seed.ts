import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function img(seed: string, label: string): string {
  return `https://picsum.photos/seed/${seed}/800/800`;
}

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
    { name: "Men's Footwear", slug: 'mens-footwear', description: 'Premium shoes for men — sneakers, formal, loafers & more', sortOrder: 1 },
    { name: "Women's Footwear", slug: 'womens-footwear', description: 'Trendy footwear for women — heels, flats, sneakers & more', sortOrder: 2 },
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

  type SeedVariant = { color: string; colorCode: string; stock: number };
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
    variants?: SeedVariant[];
    images?: { url: string; alt: string; color?: string; colorCode?: string }[];
  };

  const products: SeedProduct[] = [
    {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'Iconic lifestyle sneaker with a large Air unit for all-day comfort. Features a mesh upper with synthetic overlays and a sleek modern silhouette.',
      mrp: 15995, salePrice: 11999, sku: 'SH-NK-001', stock: 45,
      categorySlug: 'mens-footwear', isFeatured: true, isNewArrival: true,
      images: [
        { url: img('nike-am-1', 'Nike Air Max 1'), alt: 'Nike Air Max 270 - Front View' },
        { url: img('nike-am-2', 'Nike Air Max 2'), alt: 'Nike Air Max 270 - Side View' },
        { url: img('nike-am-3', 'Nike Air Max 3'), alt: 'Nike Air Max 270 - Back View' },
        { url: img('nike-am-4', 'Nike Air Max 4'), alt: 'Nike Air Max 270 - Detail' },
      ],
    },
    {
      name: 'Adidas Ultraboost Light',
      slug: 'adidas-ultraboost-light',
      description: 'The lightest Ultraboost yet. Responsive BOOST midsole with Primeknit upper for a sock-like fit and ultimate energy return.',
      mrp: 17999, salePrice: 13999, sku: 'SH-AD-001', stock: 30,
      categorySlug: 'mens-footwear', isFeatured: true,
      images: [
        { url: img('adidas-ub-1', 'Adidas Ultraboost 1'), alt: 'Adidas Ultraboost Light - Front' },
        { url: img('adidas-ub-2', 'Adidas Ultraboost 2'), alt: 'Adidas Ultraboost Light - Side' },
        { url: img('adidas-ub-3', 'Adidas Ultraboost 3'), alt: 'Adidas Ultraboost Light - Back' },
      ],
    },
    {
      name: 'Puma Cali Dream',
      slug: 'puma-cali-dream',
      description: 'Chunky sneaker with a platform silhouette. Leather upper with perforation details and a cushioned insole for all-day wear.',
      mrp: 8995, salePrice: 6499, sku: 'SH-PU-001', stock: 25,
      categorySlug: 'womens-footwear', isNewArrival: true,
      images: [
        { url: img('puma-cali-1', 'Puma Cali 1'), alt: 'Puma Cali Dream - Front' },
        { url: img('puma-cali-2', 'Puma Cali 2'), alt: 'Puma Cali Dream - Side' },
      ],
    },
    {
      name: 'New Balance 574',
      slug: 'new-balance-574',
      description: 'Timeless classic with a mix of suede and mesh upper. ENCAP midsole technology provides lightweight cushioning and support.',
      mrp: 11999, salePrice: 8499, sku: 'SH-NB-001', stock: 35,
      categorySlug: 'mens-footwear', isBestSeller: true,
      images: [
        { url: img('nb-574-1', 'NB 574 1'), alt: 'New Balance 574 - Front' },
        { url: img('nb-574-2', 'NB 574 2'), alt: 'New Balance 574 - Side' },
        { url: img('nb-574-3', 'NB 574 3'), alt: 'New Balance 574 - Back' },
      ],
    },
    {
      name: 'ASICS Gel-Kayano 30',
      slug: 'asics-gel-kayano-30',
      description: 'Premium stability running shoe with PureGEL technology and FF BLAST PLUS ECO cushioning. Designed for long-distance comfort.',
      mrp: 18999, salePrice: 14999, sku: 'SH-AS-001', stock: 20,
      categorySlug: 'sports-running', isFeatured: true, isBestSeller: true,
      images: [
        { url: img('asics-gk-1', 'ASICS GK 1'), alt: 'ASICS Gel-Kayano 30 - Front' },
        { url: img('asics-gk-2', 'ASICS GK 2'), alt: 'ASICS Gel-Kayano 30 - Side' },
        { url: img('asics-gk-3', 'ASICS GK 3'), alt: 'ASICS Gel-Kayano 30 - Back' },
        { url: img('asics-gk-4', 'ASICS GK 4'), alt: 'ASICS Gel-Kayano 30 - Detail' },
      ],
    },
    {
      name: 'Rolex Submariner Date',
      slug: 'rolex-submariner-date',
      description: 'Iconic dive watch with 41mm Oystersteel case. Cerachrom bezel, automatic movement, and 300m water resistance. The ultimate luxury timepiece.',
      mrp: 985000, salePrice: 985000, sku: 'WT-RL-001', stock: 3,
      categorySlug: 'luxury-watches', isFeatured: true, isBestSeller: true,
      images: [
        { url: img('rolex-sub-1', 'Rolex Sub 1'), alt: 'Rolex Submariner - Front' },
        { url: img('rolex-sub-2', 'Rolex Sub 2'), alt: 'Rolex Submariner - Side' },
        { url: img('rolex-sub-3', 'Rolex Sub 3'), alt: 'Rolex Submariner - Detail' },
      ],
    },
    {
      name: 'Apple Watch Ultra 2',
      slug: 'apple-watch-ultra-2',
      description: 'The most rugged Apple Watch yet. 49mm titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.',
      mrp: 89900, salePrice: 84900, sku: 'WT-AP-001', stock: 15,
      categorySlug: 'smart-watches', isFeatured: true, isNewArrival: true,
      images: [
        { url: img('aw-ultra-1', 'AW Ultra 1'), alt: 'Apple Watch Ultra 2 - Front' },
        { url: img('aw-ultra-2', 'AW Ultra 2'), alt: 'Apple Watch Ultra 2 - Side' },
        { url: img('aw-ultra-3', 'AW Ultra 3'), alt: 'Apple Watch Ultra 2 - Band' },
      ],
    },
    {
      name: 'Casio G-Shock GA-2100',
      slug: 'casio-g-shock-ga-2100',
      description: 'The iconic octagonal CasiOak design. Carbon core guard structure, shock resistant, 200m water resistance, and world time.',
      mrp: 6495, salePrice: 5495, sku: 'WT-CS-001', stock: 50,
      categorySlug: 'casual-watches', isBestSeller: true,
      images: [
        { url: img('gshock-1', 'G-Shock 1'), alt: 'Casio G-Shock GA-2100 - Front' },
        { url: img('gshock-2', 'G-Shock 2'), alt: 'Casio G-Shock GA-2100 - Side' },
      ],
    },
    {
      name: 'Titan Karishma Quartz',
      slug: 'titan-karishma-quartz',
      description: 'Elegant analogue watch with stainless steel strap and mother-of-pearl dial. Perfect for formal occasions and daily wear.',
      mrp: 5495, salePrice: 3995, sku: 'WT-TT-001', stock: 40,
      categorySlug: 'casual-watches', isNewArrival: true,
      images: [
        { url: img('titan-k-1', 'Titan K 1'), alt: 'Titan Karishma - Front' },
        { url: img('titan-k-2', 'Titan K 2'), alt: 'Titan Karishma - Side' },
      ],
    },
    {
      name: 'Samsung Galaxy Watch 6',
      slug: 'samsung-galaxy-watch-6',
      description: 'Sleek smartwatch with BioActive sensor, sapphire crystal display, and Wear OS powered by Samsung. Track your fitness and style.',
      mrp: 34999, salePrice: 29999, sku: 'WT-SG-001', stock: 22,
      categorySlug: 'smart-watches', isBestSeller: true,
      images: [
        { url: img('sgw6-1', 'SGW6 1'), alt: 'Samsung Galaxy Watch 6 - Front' },
        { url: img('sgw6-2', 'SGW6 2'), alt: 'Samsung Galaxy Watch 6 - Side' },
        { url: img('sgw6-3', 'SGW6 3'), alt: 'Samsung Galaxy Watch 6 - Display' },
      ],
    },
    {
      name: 'Skechers GOwalk 6',
      slug: 'skechers-gowalk-6',
      description: 'Ultra-lightweight walking shoe with Skechers Air-Cooled Goga Mat insole and ULTRA GO cushioning for maximum comfort.',
      mrp: 6999, salePrice: 5499, sku: 'SH-SK-001', stock: 40,
      categorySlug: 'womens-footwear', isFeatured: true,
      images: [
        { url: img('skechers-gw-1', 'Skechers GW 1'), alt: 'Skechers GOwalk 6 - Front' },
        { url: img('skechers-gw-2', 'Skechers GW 2'), alt: 'Skechers GOwalk 6 - Side' },
      ],
    },
    {
      name: 'Fossil Gen 6 Hybrid',
      slug: 'fossil-gen-6-hybrid',
      description: 'Hybrid smartwatch with analog design and smart features. Heart rate tracking, activity tracking, and customizable dials.',
      mrp: 24995, salePrice: 17995, sku: 'WT-FS-001', stock: 12,
      categorySlug: 'smart-watches', isNewArrival: true,
      images: [
        { url: img('fossil-hybrid-1', 'Fossil Hybrid 1'), alt: 'Fossil Gen 6 Hybrid - Front' },
        { url: img('fossil-hybrid-2', 'Fossil Hybrid 2'), alt: 'Fossil Gen 6 Hybrid - Side' },
      ],
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
      images: [
        { url: img('ea-chrono-w', 'EA Chrono W'), alt: 'Emporio Armani - White Dial / Rose Gold', color: 'White Dial / Rose Gold', colorCode: '#F5F5F5' },
        { url: img('ea-chrono-ws', 'EA Chrono WS'), alt: 'Emporio Armani - White Dial / Silver', color: 'White Dial / Silver', colorCode: '#FFFFFF' },
        { url: img('ea-chrono-b', 'EA Chrono B'), alt: 'Emporio Armani - Blue Dial / Silver', color: 'Blue Dial / Silver', colorCode: '#1E3A5F' },
        { url: img('ea-chrono-bg', 'EA Chrono BG'), alt: 'Emporio Armani - Blue Dial / Rose Gold', color: 'Blue Dial / Rose Gold', colorCode: '#1E3A5F' },
        { url: img('ea-chrono-g', 'EA Chrono G'), alt: 'Emporio Armani - Grey Dial / Rose Gold', color: 'Grey Dial / Rose Gold', colorCode: '#808080' },
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
      images: [
        { url: img('ax-oct-b', 'AX Oct B'), alt: 'Armani Exchange - Blue Dial / Silver', color: 'Blue Dial / Silver', colorCode: '#1E3A5F' },
        { url: img('ax-oct-g', 'AX Oct G'), alt: 'Armani Exchange - Grey Dial / Gold', color: 'Grey Dial / Gold', colorCode: '#808080' },
        { url: img('ax-oct-w', 'AX Oct W'), alt: 'Armani Exchange - White Dial / Silver', color: 'White Dial / Silver', colorCode: '#FFFFFF' },
        { url: img('ax-oct-gr', 'AX Oct Gr'), alt: 'Armani Exchange - Green Dial / Silver', color: 'Green Dial / Silver', colorCode: '#228B22' },
        { url: img('ax-oct-m', 'AX Oct M'), alt: 'Armani Exchange - Mint Blue Dial / Silver', color: 'Mint Blue Dial / Silver', colorCode: '#98FF98' },
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
      images: [
        { url: img('mtw-b', 'MTW B'), alt: 'Montblanc - Blue Dial / Steel', color: 'Blue Dial / Steel', colorCode: '#1E3A5F' },
        { url: img('mtw-bg', 'MTW BG'), alt: 'Montblanc - Blue Dial / Rose Gold', color: 'Blue Dial / Rose Gold', colorCode: '#1E3A5F' },
        { url: img('mtw-blk', 'MTW Blk'), alt: 'Montblanc - Black Dial / Black', color: 'Black Dial / Black', colorCode: '#000000' },
        { url: img('mtw-w', 'MTW W'), alt: 'Montblanc - White Dial / Rose Gold', color: 'White Dial / Rose Gold', colorCode: '#FFFFFF' },
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
      images: [
        { url: img('armani-lb-br', 'Armani LB Br'), alt: 'Armani Leather - Brown / Gold', color: 'Brown Leather / Gold', colorCode: '#8B4513' },
        { url: img('armani-lb-db', 'Armani LB DB'), alt: 'Armani Leather - Dark Brown / Gold', color: 'Dark Brown Leather / Gold', colorCode: '#654321' },
        { url: img('armani-lb-blk', 'Armani LB Blk'), alt: 'Armani Leather - Black / Gold', color: 'Black Leather / Gold', colorCode: '#000000' },
        { url: img('armani-lb-bls', 'Armani LB BlS'), alt: 'Armani Leather - Black / Silver', color: 'Black Leather / Silver', colorCode: '#000000' },
        { url: img('armani-lb-tan', 'Armani LB Tan'), alt: 'Armani Leather - Tan / Silver', color: 'Tan Leather / Silver', colorCode: '#D2B48C' },
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
      images: [
        { url: img('fossil-cl-bb', 'Fossil CL BB'), alt: 'Fossil - Black Dial / Black Leather / Black Case', color: 'Black Dial / Black Leather / Black Case', colorCode: '#000000' },
        { url: img('fossil-cl-bg', 'Fossil CL BG'), alt: 'Fossil - Black Dial / Brown Leather / Gold Case', color: 'Black Dial / Brown Leather / Gold Case', colorCode: '#000000' },
        { url: img('fossil-cl-g', 'Fossil CL G'), alt: 'Fossil - Green Dial / Brown Leather / Silver Case', color: 'Green Dial / Brown Leather / Silver Case', colorCode: '#228B22' },
        { url: img('fossil-cl-bl', 'Fossil CL Bl'), alt: 'Fossil - Blue Dial / Brown Leather / Silver Case', color: 'Blue Dial / Brown Leather / Silver Case', colorCode: '#1E3A5F' },
        { url: img('fossil-cl-bs', 'Fossil CL BS'), alt: 'Fossil - Black Dial / Black Leather / Silver Case', color: 'Black Dial / Black Leather / Silver Case', colorCode: '#000000' },
      ],
    },
  ];

  for (const p of products) {
    const categoryId = catMap[p.categorySlug];
    if (!categoryId) continue;
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      if (p.variants && p.variants.length > 0) {
        await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
        await prisma.productVariant.createMany({
          data: p.variants.map((v, i) => ({
            productId: existing.id, color: v.color, colorCode: v.colorCode,
            stock: v.stock, sku: `${p.sku}-V${i + 1}`,
          })),
        });
      }
      if (p.images && p.images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: existing.id } });
        await prisma.productImage.createMany({
          data: p.images.map((img, i) => ({
            productId: existing.id,
            url: img.url,
            alt: img.alt,
            color: img.color || null,
            colorCode: img.colorCode || null,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        });
      }
    } else {
      const created = await prisma.product.create({
        data: {
          name: p.name, slug: p.slug, description: p.description,
          mrp: p.mrp, salePrice: p.salePrice, sku: p.sku, stock: p.stock,
          discount: Math.round(((p.mrp - p.salePrice) / p.mrp) * 100),
          categoryId, isActive: true,
          isFeatured: p.isFeatured || false, isNewArrival: p.isNewArrival || false,
          isBestSeller: p.isBestSeller || false,
        },
      });
      if (p.variants && p.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: p.variants.map((v, i) => ({
            productId: created.id, color: v.color, colorCode: v.colorCode,
            stock: v.stock, sku: `${p.sku}-V${i + 1}`,
          })),
        });
      }
      if (p.images && p.images.length > 0) {
        await prisma.productImage.createMany({
          data: p.images.map((img, i) => ({
            productId: created.id, url: img.url, alt: img.alt,
            color: img.color || null, colorCode: img.colorCode || null,
            isPrimary: i === 0, sortOrder: i,
          })),
        });
      }
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
