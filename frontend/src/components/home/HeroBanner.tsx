'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const defaultSlides = [
  { title: 'Step Into Style', subtitle: 'Premium footwear for every occasion — from sneakers to formal', image: '', link: '/shop?category=mens-footwear', linkText: 'Shop Footwear' },
  { title: 'Time That Defines You', subtitle: 'Luxury watches and smart timepieces for the modern individual', image: '', link: '/shop?category=luxury-watches', linkText: 'Explore Watches' },
  { title: 'New Arrivals', subtitle: 'Be the first to wear the newest styles in shoes and watches', image: '', link: '/new-arrivals', linkText: 'View New Arrivals' },
];

interface HeroBannerProps {
  initialBanners?: any[];
}

export function HeroBanner({ initialBanners = [] }: HeroBannerProps) {
  const slides = initialBanners.length > 0 ? initialBanners : defaultSlides;

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-full"
      >
        {slides.map((slide: any, idx: number) => (
          <SwiperSlide key={idx}>
            <div className="relative h-full flex items-center">
              {slide.image ? (
                <img src={getImageUrl(slide.image)} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative max-w-7xl mx-auto px-4 text-white">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-4 max-w-2xl">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl">
                  {slide.subtitle}
                </p>
                <div>
                  <Link
                    href={slide.link || '/shop'}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {slide.linkText || 'Shop Now'} <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}