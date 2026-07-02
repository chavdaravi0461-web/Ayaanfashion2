'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCategories()
      .then((res: any) => { if (res.success) setCategories(res.data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 mt-1">Browse our curated collections</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> :
           loading ? <PageLoader /> :
           categories.length === 0 ? <EmptyState title="No categories found" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/shop?category=${cat.slug}`} className="group block bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                      {cat.image ? <img src={getImageUrl(cat.image)} alt={cat.name} className="w-10 h-10 object-contain" /> :
                       <span className="text-2xl font-bold text-primary-600">{cat.name[0]}</span>}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{cat.name}</h3>
                    {cat.description && <p className="text-gray-500 text-sm mb-4">{cat.description}</p>}
                    <span className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium group-hover:gap-2 transition-all">
                      Shop Now <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
