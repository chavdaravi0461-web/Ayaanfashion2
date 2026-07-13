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
import { ShoppingBag, CreditCard, ShieldCheck, ArrowLeft, Lock, Truck, RotateCcw, Wallet, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const UPI_ID = 'bhojanikomail@gmail.com';
const UPI_APPS = [
  { name: 'Google Pay', id: 'gpay', color: 'bg-white border border-gray-300 hover:border-green-400', textColor: 'text-gray-800', icon: 'G' },
  { name: 'PhonePe', id: 'phonepe', color: 'bg-white border border-gray-300 hover:border-purple-400', textColor: 'text-purple-700', icon: 'P' },
  { name: 'Paytm', id: 'paytm', color: 'bg-white border border-gray-300 hover:border-blue-400', textColor: 'text-blue-600', icon: 'P' },
  { name: 'Other UPI', id: 'other', color: 'bg-white border border-gray-300 hover:border-gray-400', textColor: 'text-gray-600', icon: 'U' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { state, getSubtotal, getDiscount, getShipping, getTax, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', notes: '',
  });

  const subtotal = getSubtotal();
  const total = getTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('UPI ID copied!');
  };

  const openUpiApp = (appId: string) => {
    const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=Ayaan%20Fashion&am=${total}&cu=INR&tn=Order%20Payment`;
    if (appId === 'gpay') {
      window.open(`tez://upi/${UPI_ID}?amount=${total}`, '_blank');
      setTimeout(() => window.open(upiDeepLink, '_blank'), 300);
    } else if (appId === 'phonepe') {
      window.open(`phonepe://pay/${UPI_ID}?amount=${total}`, '_blank');
      setTimeout(() => window.open(upiDeepLink, '_blank'), 300);
    } else if (appId === 'paytm') {
      window.open(`paytm://upi/${UPI_ID}?amount=${total}`, '_blank');
      setTimeout(() => window.open(upiDeepLink, '_blank'), 300);
    } else {
      window.open(upiDeepLink, '_blank');
    }
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
    if (paymentMethod === 'upi' && !transactionId.trim()) {
      toast.error('Please enter UPI transaction ID after payment');
      return;
    }

    setLoading(true);
    try {
      const upiNotes = paymentMethod === 'upi'
        ? `UPI: ${UPI_ID} | App: ${UPI_APPS.find(a => a.id === selectedUpiApp)?.name || 'UPI'} | TXN: ${transactionId}`
        : '';

      const orderData = {
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingAddress: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        notes: [form.notes, upiNotes].filter(Boolean).join('\n') || undefined,
        subtotal,
        shippingCost: getShipping(),
        tax: getTax(),
        discount: getDiscount(),
        total,
        paymentMethod: paymentMethod,
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
        router.push(`/order-success?order=${res.data.orderNumber}${paymentMethod === 'upi' ? `&txn=${transactionId}` : ''}`);
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

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-green-600 ml-auto" />
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-purple-200 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Pay Online (UPI)</p>
                      <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm & more</p>
                    </div>
                    <Wallet className="w-5 h-5 text-purple-600 ml-auto" />
                  </label>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                    <p className="text-sm font-medium text-gray-700">Pay to this UPI ID:</p>
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3">
                      <Wallet className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-base font-mono font-semibold text-gray-900">{UPI_ID}</span>
                      <button type="button" onClick={copyUpiId} className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Copy UPI ID">
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                      </button>
                    </div>

                    <p className="text-sm font-medium text-gray-700">Choose your UPI app:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {UPI_APPS.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => { setSelectedUpiApp(app.id); openUpiApp(app.id); }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-all ${selectedUpiApp === app.id ? 'ring-2 ring-primary-500 border-primary-500' : ''} ${app.color}`}
                        >
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${app.textColor} bg-gray-100`}>{app.icon}</span>
                          <span className="text-xs">{app.name}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <Input
                        label="UPI Transaction ID (UTR)"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter UPI reference/UTR number after payment"
                      />
                      <p className="text-xs text-gray-500 mt-1">This helps us verify your payment quickly</p>
                    </div>
                  </div>
                )}
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
                  {paymentMethod === 'upi' ? `Pay ₹${formatPrice(total).replace('₹', '')} Online` : `Place Order - ${formatPrice(total)}`}
                </Button>
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