'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Pagination } from '@/components/ui/pagination';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    setLoading(true);
    api.getProducts({ search: query, page, limit: 12 })
      .then((res: any) => {
        if (res.success) { setProducts(res.data.items); setTotalPages(res.data.totalPages); }
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">
          Search Results
        </h1>
        <p className="text-gray-500 mt-1">
          {query ? `Showing results for "${query}"` : 'Enter a search term'}
        </p>
      </div>
      {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> :
       loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-6"><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /></div> :
       products.length === 0 && query ? <EmptyState title="No results found" description={`We couldn't find any products matching "${query}"`} /> :
       products.length === 0 ? <EmptyState title="Search for products" description="Use the search bar above to find products" /> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /></div>}>
          <SearchContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
