'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

export function CategoriesShowcase() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then((res: any) => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Find exactly what you need</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group block bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  {cat.image ? (
                    <img src={getImageUrl(cat.image)} alt={cat.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <span className="text-2xl font-display font-bold text-primary-600">{cat.name[0]}</span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
