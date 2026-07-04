'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import { ProductCardSkeleton } from '@/components/ui/skeleton';

export function FlashSale() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shouldLoad) return;

    const loadProducts = async () => {
      try {
        const res = await api.getProducts({ sort: 'salePrice', limit: 4 });
        if (res.success) setProducts(res.data.items);
      } catch {
        // Ignore flash-sale fetch failures.
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [shouldLoad]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">Flash Sale</h2>
              <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full animate-pulse">Live</span>
            </div>
            <p className="text-gray-500">Limited time offers on premium products</p>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5 text-red-500" />
            <div className="flex gap-1 text-lg font-mono font-bold">
              <span className="bg-gray-100 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-gray-400">:</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-gray-400">:</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)
          }
        </div>
      </div>
    </section>
  );
}
