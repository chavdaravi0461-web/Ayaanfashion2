'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { formatDate, formatDateTime, formatPrice, getStatusColor } from '@/lib/utils';
import { Package, Search, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

const statusIcons: Record<string, any> = {
  PENDING: Clock, CONFIRMED: Package, PACKED: Package, SHIPPED: Truck, DELIVERED: CheckCircle, CANCELLED: XCircle,
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await api.trackOrder(orderNumber.trim());
      if (res.success) setOrder(res.data);
    } catch (err: any) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const statusFlow = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentStatusIdx = order ? statusFlow.indexOf(order.orderStatus) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-2">Track Your Order</h1>
      <p className="text-gray-500 mb-8">Enter your order number to track the status</p>

      <form onSubmit={handleTrack} className="flex gap-3 mb-8">
        <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Enter order number (e.g. AF...)" className="text-sm" />
        <Button type="submit" isLoading={loading}><Search className="w-4 h-4 mr-2" /> Track</Button>
      </form>

      {error && <div className="mb-8"><ErrorState message={error} /></div>}

      {order && (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="text-xl font-mono font-bold text-gray-900">{order.orderNumber}</p>
              </div>
              <Badge variant={order.orderStatus === 'CANCELLED' ? 'danger' : order.orderStatus === 'DELIVERED' ? 'success' : 'warning'}>
                {order.orderStatus}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Placed on: {formatDateTime(order.createdAt)}</p>
              <p>Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</p>
              <p>Total: {formatPrice(order.total)}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Order Status</h2>
            <div className="space-y-0">
              {statusFlow.map((status, idx) => {
                const Icon = statusIcons[status];
                const isCompleted = idx <= currentStatusIdx;
                const isCurrent = idx === currentStatusIdx;
                const historyItem = order.statusHistory?.find((h: any) => h.status === status);
                return (
                  <div key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {idx < statusFlow.length - 1 && (
                        <div className={`w-0.5 h-12 ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className={`pb-8 ${idx === statusFlow.length - 1 ? 'pb-0' : ''}`}>
                      <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                        {isCurrent && <span className="ml-2 text-xs text-primary-600 animate-pulse">(Current)</span>}
                      </p>
                      {historyItem && <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(historyItem.createdAt)}</p>}
                      {historyItem?.note && <p className="text-xs text-gray-400 mt-0.5">{historyItem.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-3">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-16 h-16 bg-gray-50 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                    <p className="text-sm font-semibold text-primary-600">{formatPrice(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Shipping Address</h2>
            <p className="text-sm text-gray-600">{order.shippingAddress}</p>
            <p className="text-sm text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-sm text-gray-600">Phone: {order.customerPhone}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28 min-h-[60vh]">
        <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
          <TrackingContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
