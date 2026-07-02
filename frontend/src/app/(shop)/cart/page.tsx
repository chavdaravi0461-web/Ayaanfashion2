'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { useCart } from '@/lib/store';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { api } from '@/lib/api';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { state, removeItem, updateQuantity, getSubtotal, getDiscount, getShipping, getTax, getTotal, getItemCount, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.validateCoupon(couponCode.trim(), getSubtotal());
      if (res.success) {
        applyCoupon(res.data.code, Number(res.data.discount));
        toast.success('Coupon applied!');
        setCouponCode('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  if (state.items.length === 0) {
    return (
      <main>
        <Header />
        <div className="pt-24 lg:pt-28 min-h-[60vh] flex items-center justify-center">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added anything yet"
            icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
            action={{ label: 'Start Shopping', onClick: () => window.location.href = '/shop' }}
          />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{getItemCount()} items in your cart</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                  <Link href={`/product/${item.slug}`} className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary-600 font-semibold">{formatPrice(item.price)}</span>
                      {item.mrp > item.price && <span className="text-gray-400 text-sm line-through">{formatPrice(item.mrp)}</span>}
                    </div>
                    {(item.size || item.color) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.size && `Size: ${item.size}`}{item.size && item.color && ' | '}{item.color && `Color: ${item.color}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => { removeItem(item.id); toast.success('Removed from cart'); }} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-28">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Coupon */}
                <div className="mb-6">
                  {state.coupon ? (
                    <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {state.coupon.code}</span>
                      <button onClick={removeCoupon} className="text-green-500 hover:text-green-700">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="text-sm" />
                      <Button variant="outline" size="sm" onClick={handleApplyCoupon} isLoading={couponLoading}>Apply</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-gray-900 text-base">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block mt-6">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/shop" className="block mt-3 text-center text-sm text-primary-600 hover:text-primary-700">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
