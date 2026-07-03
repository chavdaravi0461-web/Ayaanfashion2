'use client';

import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const testimonials = [
  { name: 'Priya Sharma', text: 'Amazing quality sneakers! The comfort is unreal and the fit is perfect. Highly recommend Ayaan for footwear.', rating: 5, location: 'Mumbai' },
  { name: 'Rahul Verma', text: 'Bought a luxury watch — exceptional collection and fast delivery. The watch exceeded my expectations.', rating: 5, location: 'Delhi' },
  { name: 'Ananya Patel', text: 'Beautiful collection of shoes and watches! Found exactly what I was looking for at great prices.', rating: 5, location: 'Bangalore' },
  { name: 'Vikram Singh', text: 'My go-to store for premium watches now. Great variety, amazing quality, and premium packaging. Love it!', rating: 5, location: 'Pune' },
];

export function Testimonials() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 mt-2">Real reviews from real customers</p>
        </div>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={idx}>
              <div className="bg-white rounded-2xl p-6 shadow-sm h-full">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.location}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
