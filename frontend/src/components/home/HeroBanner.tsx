'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export function HeroBanner() {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    api.getBanners().then((res: any) => {
      if (res.success) setBanners(res.data);
    }).catch(() => {});
  }, []);

  const slides = banners.length > 0 ? banners : [
    { title: 'Summer Collection 2024', subtitle: 'Discover the latest trends in fashion', image: '', link: '/shop', linkText: 'Shop Now' },
    { title: 'Traditional Elegance', subtitle: 'Handcrafted with love for every occasion', image: '', link: '/shop?category=traditional-wear', linkText: 'Explore' },
    { title: 'New Arrivals', subtitle: 'Be the first to wear the newest styles', image: '', link: '/new-arrivals', linkText: 'View New Arrivals' },
  ];

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
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative h-full flex items-center">
              {slide.image ? (
                <img src={getImageUrl(slide.image)} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative max-w-7xl mx-auto px-4 text-white"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-4 max-w-2xl"
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl"
                >
                  {slide.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Link
                    href={slide.link || '/shop'}
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {slide.linkText || 'Shop Now'} <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
