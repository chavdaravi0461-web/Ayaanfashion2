'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/lib/store';
import { EmptyState } from '@/components/ui/empty-state';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { api } from '@/lib/api';
import { ShoppingBag, CreditCard, ShieldCheck, ArrowLeft, Lock, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, getSubtotal, getDiscount, getShipping, getTax, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', notes: '',
  });

  const subtotal = getSubtotal();
  const total = getTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingAddress: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        notes: form.notes || undefined,
        subtotal,
        shippingCost: getShipping(),
        tax: getTax(),
        discount: getDiscount(),
        total,
        paymentMethod: 'cod',
        couponId: state.coupon?.code || undefined,
        items: state.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          size: item.size,
          color: item.color,
          imageUrl: item.image,
        })),
      };

      const res = await api.createOrder(orderData);
      if (res.success) {
        clearCart();
        router.push(`/order-success?order=${res.data.orderNumber}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <main>
        <Header />
        <div className="pt-24 lg:pt-28 min-h-[60vh] flex items-center justify-center">
          <EmptyState
            title="Your cart is empty"
            description="Add some items before checking out"
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
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900">Checkout</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input id="name" name="name" label="Full Name *" value={form.name} onChange={handleChange} placeholder="John Doe" />
                  <Input id="email" name="email" label="Email *" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                  <Input id="phone" name="phone" label="Phone *" type="tel" value={form.phone} onChange={handleChange} placeholder="+91-7977885020" />
                  <Input id="pincode" name="pincode" label="PIN Code *" value={form.pincode} onChange={handleChange} placeholder="400001" />
                </div>
                <div className="mt-4">
                  <Textarea id="address" name="address" label="Address *" value={form.address} onChange={handleChange} placeholder="Street, building, area" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <Input id="city" name="city" label="City *" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                  <Input id="state" name="state" label="State *" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
                </div>
                <div className="mt-4">
                  <Textarea id="notes" name="notes" label="Order Notes (Optional)" value={form.notes} onChange={handleChange} placeholder="Any special instructions..." />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <label className="flex items-center gap-3 p-4 border border-green-200 bg-green-50 rounded-lg cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-green-600 ml-auto" />
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-28">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 bg-gray-50 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary-600">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {getDiscount() > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(getDiscount())}</span></div>}
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{getShipping() === 0 ? 'Free' : formatPrice(getShipping())}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(getTax())}</span></div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-gray-900 text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>
                <Button type="submit" size="lg" className="w-full mt-6" isLoading={loading}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Place Order - {formatPrice(total)}
                </Button>
                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3.5 h-3.5 text-green-600" />
                    <span>Secure checkout — your data is encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Truck className="w-3.5 h-3.5 text-green-600" />
                    <span>Free shipping on orders above ₹999</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <RotateCcw className="w-3.5 h-3.5 text-green-600" />
                    <span>7-day easy returns on all products</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span>100% authentic products guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
