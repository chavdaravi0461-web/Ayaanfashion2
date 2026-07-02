'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getNewArrivals()
      .then((res: any) => { if (res.success) setProducts(res.data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">New Arrivals</h1>
            <p className="text-gray-500 mt-1">Be the first to wear the latest trends</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> :
           loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-6"><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /></div> :
           products.length === 0 ? <EmptyState title="No new arrivals yet" description="Check back soon for new products" /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
