'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { ImageZoom } from '@/components/ui/image-zoom';
import { PageLoader } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { useCart } from '@/lib/store';
import { formatPrice, getImageUrl, calculateDiscount } from '@/lib/utils';
import { api } from '@/lib/api';
import { Minus, Plus, ShoppingBag, Heart, Share2, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.getProduct(params.slug as string)
      .then((res: any) => {
        if (res.success) {
          setProduct(res.data);
          if (res.data.images?.[0]) setSelectedImage(0);
          if (res.data.variants?.length) {
            const sizes = [...new Set(res.data.variants.map((v: any) => v.size).filter((s: any) => s))] as string[];
            const colors = [...new Set(res.data.variants.map((v: any) => v.color).filter((c: any) => c))] as string[];
            if (sizes.length) setSelectedSize(sizes[0]);
            if (colors.length) setSelectedColor(colors[0]);
          }
          // Fetch related
          api.getRelatedProducts(res.data.id).then((rel: any) => {
            if (rel.success) setRelatedProducts(rel.data);
          }).catch(() => {});
        }
      })
      .catch((err: any) => setError(err.message || 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const variantId = `${product.id}${selectedSize ? '-' + selectedSize : ''}${selectedColor ? '-' + selectedColor : ''}`;
    addItem({
      id: variantId,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.salePrice),
      mrp: Number(product.mrp),
      quantity,
      image: getImageUrl(product.images?.[selectedImage]?.url || product.images?.[0]?.url || ''),
      size: selectedSize,
      color: selectedColor,
      stock: product.stock,
    });
    toast.success('Added to cart!');
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const jsonLd = useMemo(() => {
    if (!product) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images?.map((img: any) => getImageUrl(img.url)) || [getImageUrl(product.images?.[0]?.url)],
      sku: product.sku,
      brand: { '@type': 'Brand', name: 'Ayaan Fashion' },
      offers: {
        '@type': 'Offer',
        url: `${siteUrl}${pathname}`,
        priceCurrency: 'INR',
        price: Number(product.salePrice),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    };
  }, [product, pathname, siteUrl]);

  if (loading) return <main><Header /><PageLoader /><Footer /></main>;
  if (error) return <main><Header /><div className="pt-28"><ErrorState message={error} onRetry={() => window.location.reload()} /></div><Footer /></main>;
  if (!product) return <main><Header /><div className="pt-28"><ErrorState message="Product not found" /></div><Footer /></main>;

  const images = product.images?.length ? product.images : [{ url: '/placeholder.svg', alt: product.name }];
  const sizes = [...new Set(product.variants?.map((v: any) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set(product.variants?.map((v: any) => v.color).filter(Boolean))] as string[];
  const discount = product.discount || calculateDiscount(Number(product.mrp), Number(product.salePrice));

  return (
    <main>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <a href="/" className="hover:text-primary-600">Home</a>
            <span>/</span>
            <a href="/shop" className="hover:text-primary-600">Shop</a>
            <span>/</span>
            {product.category && <a href={`/shop?category=${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</a>}
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square">
                <ImageZoom
                  src={getImageUrl(images[selectedImage]?.url)}
                  alt={images[selectedImage]?.alt || product.name}
                  className="w-full h-full"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        idx === selectedImage ? 'border-primary-600' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={getImageUrl(img.url)} alt={img.alt || ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start gap-2 mb-2">
                {product.category && (
                  <Badge variant="primary" size="sm">{product.category.name}</Badge>
                )}
                {product.isNewArrival && <Badge variant="info" size="sm">New Arrival</Badge>}
                {product.isBestSeller && <Badge variant="warning" size="sm">Best Seller</Badge>}
              </div>

              <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-3">{product.name}</h1>
              
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-primary-600">{formatPrice(product.salePrice)}</span>
                {Number(product.mrp) > Number(product.salePrice) && (
                  <>
                    <span className="text-xl text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                    <Badge variant="danger" size="sm">{discount}% OFF</Badge>
                  </>
                )}
              </div>

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Size: <span className="font-normal">{selectedSize}</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          selectedSize === size
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Color: <span className="font-normal">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => {
                      const variant = product.variants?.find((v: any) => v.color === color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-colors ${
                            selectedColor === color ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: variant?.colorCode || '#ccc' }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-medium min-w-[40px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              {/* Stock Info */}
              <p className={`text-sm mb-6 ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                <div className="text-center">
                  <Truck className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                  <p className="text-xs text-gray-600">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                  <p className="text-xs text-gray-600">Secure</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                  <p className="text-xs text-gray-600">Easy Returns</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* SKU & Tags */}
              <div className="mt-4 space-y-1 text-sm text-gray-500">
                <p>SKU: {product.sku}</p>
                {product.tags && <p>Tags: {product.tags}</p>}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
