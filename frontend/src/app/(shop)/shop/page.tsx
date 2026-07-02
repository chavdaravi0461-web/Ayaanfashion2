'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Suspense } from 'react';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { SlidersHorizontal, X } from 'lucide-react';

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('newest');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, limit, sort };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.getCategories().then((res: any) => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});
  }, []);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug === selectedCategory ? '' : slug);
    setPage(1);
  };

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        {/* Page Header */}
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Shop'
                : search ? `Search: "${search}"` : 'All Products'}
            </h1>
            <p className="text-gray-500 mt-1">{total} products found</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryClick('')}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <SearchInput
                    value={search}
                    onChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Search products..."
                    className="w-full sm:w-64"
                  />
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-2 border rounded-lg hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Categories</h3>
                    <button onClick={() => setShowFilters(false)}><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleCategoryClick('')} className={`px-3 py-1.5 rounded-lg text-sm ${!selectedCategory ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}>All</button>
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => handleCategoryClick(cat.slug)} className={`px-3 py-1.5 rounded-lg text-sm ${selectedCategory === cat.slug ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}>{cat.name}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {error ? (
                <ErrorState message={error} onRetry={fetchProducts} />
              ) : loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  title="No products found"
                  description="Try adjusting your search or filter criteria"
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>}>
      <ShopPageContent />
    </Suspense>
  );
}
