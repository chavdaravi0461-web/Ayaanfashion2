import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesShowcase } from '@/components/home/CategoriesShowcase';
import { FlashSale } from '@/components/home/FlashSale';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Testimonials } from '@/components/home/Testimonials';
import { getServerFeaturedProducts, getServerFlashSale, getServerCategories, getServerBanners } from '@/lib/server-api';

export const revalidate = 60;

export default async function HomePage() {
  const [featuredProducts, flashSaleProducts, categories, banners] = await Promise.all([
    getServerFeaturedProducts().catch(() => []),
    getServerFlashSale().catch(() => []),
    getServerCategories().catch(() => []),
    getServerBanners().catch(() => []),
  ]);

  return (
    <main>
      <Header />
      <HeroBanner initialBanners={banners} />
      <FeaturedProducts initialProducts={featuredProducts} />
      <CategoriesShowcase initialCategories={categories} />
      <FlashSale initialProducts={flashSaleProducts} />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </main>
  );
}