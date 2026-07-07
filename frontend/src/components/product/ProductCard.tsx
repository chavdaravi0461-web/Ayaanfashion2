'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatPrice, getImageUrl, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/lib/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
  variant?: 'default' | 'compact';
}

const FALLBACK = '/placeholder.svg';

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const imgUrl = getImageUrl(product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url || FALLBACK);
  const [imgSrc, setImgSrc] = useState(imgUrl);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.salePrice),
      mrp: Number(product.mrp),
      quantity: 1,
      image: getImageUrl(primaryImage),
      stock: product.stock,
    });
    toast.success('Added to cart');
  };

  const discount = product.discount || calculateDiscount(Number(product.mrp), Number(product.salePrice));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-3 aspect-square">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgSrc(FALLBACK)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-md">
              New
            </span>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-600 hover:text-white"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">{product.category?.name || 'Fashion'}</p>
          <h3 className={cn('font-medium text-gray-900 line-clamp-2', variant === 'compact' ? 'text-sm' : 'text-sm lg:text-base')}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-primary-600 font-semibold">{formatPrice(product.salePrice)}</span>
            {Number(product.mrp) > Number(product.salePrice) && (
              <span className="text-gray-400 text-sm line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
