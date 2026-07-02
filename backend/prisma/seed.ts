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
    { name: 'Traditional Wear', slug: 'traditional-wear', description: 'Elegant traditional clothing', sortOrder: 1 },
    { name: 'Western Wear', slug: 'western-wear', description: 'Modern western fashion', sortOrder: 2 },
    { name: 'Footwear', slug: 'footwear', description: 'Shoes and footwear', sortOrder: 3 },
    { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories', sortOrder: 4 },
    { name: 'Jewelry', slug: 'jewelry', description: 'Handcrafted jewelry', sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const settings = [
    { key: 'site_name', value: 'Ayaan Fashion' },
    { key: 'site_description', value: 'Premium fashion destination for traditional and modern wear' },
    { key: 'site_email', value: 'bhojanikomail@gmail.com' },
    { key: 'site_phone', value: '+91-9876543210' },
    { key: 'site_address', value: '123 Fashion Street, Mumbai - 400001' },
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
