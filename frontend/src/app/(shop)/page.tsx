import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const HeroBanner = dynamic(() => import('@/components/home/HeroBanner').then((mod) => mod.HeroBanner), {
  loading: () => <div className="h-[70vh] min-h-[500px] w-full bg-gray-100" />,
});
const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts').then((mod) => mod.FeaturedProducts), {
  loading: () => <div className="h-80 w-full" />,
});
const CategoriesShowcase = dynamic(() => import('@/components/home/CategoriesShowcase').then((mod) => mod.CategoriesShowcase), {
  loading: () => <div className="h-64 w-full" />,
});
const FlashSale = dynamic(() => import('@/components/home/FlashSale').then((mod) => mod.FlashSale), {
  loading: () => <div className="h-72 w-full" />,
});
const WhyChooseUs = dynamic(() => import('@/components/home/WhyChooseUs').then((mod) => mod.WhyChooseUs), {
  loading: () => <div className="h-64 w-full" />,
});
const Testimonials = dynamic(() => import('@/components/home/Testimonials').then((mod) => mod.Testimonials), {
  loading: () => <div className="h-64 w-full" />,
});

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
