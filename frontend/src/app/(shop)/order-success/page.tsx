'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-500 mb-6">Thank you for your order. We'll send you a confirmation shortly.</p>
      {orderNumber && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <p className="text-2xl font-mono font-bold text-gray-900">{orderNumber}</p>
          <Link href={`/order-tracking?order=${orderNumber}`} className="inline-flex items-center gap-1 text-primary-600 text-sm font-medium mt-2 hover:underline">
            Track your order <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/shop"><Button variant="outline"><Package className="w-4 h-4 mr-2" /> Continue Shopping</Button></Link>
        <Link href={orderNumber ? `/order-tracking?order=${orderNumber}` : '/'}><Button>Track Order</Button></Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28 min-h-[60vh] flex items-center">
        <Suspense fallback={<div className="text-center w-full py-16">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
