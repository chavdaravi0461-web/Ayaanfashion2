import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesShowcase } from '@/components/home/CategoriesShowcase';
import { FlashSale } from '@/components/home/FlashSale';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Testimonials } from '@/components/home/Testimonials';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroBanner />
      <FeaturedProducts />
      <CategoriesShowcase />
      <FlashSale />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </main>
  );
}
