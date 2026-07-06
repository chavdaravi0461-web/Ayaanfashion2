'use client';

import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
  initialProducts?: any[];
}

export function FeaturedProducts({ initialProducts = [] }: FeaturedProductsProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-2">Handpicked just for you</p>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {initialProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 text-primary-600 font-medium">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}