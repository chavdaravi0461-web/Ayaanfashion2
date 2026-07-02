'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';
import { SearchInput } from '@/components/ui/search-input';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { formatPrice, formatDateTime, getStatusColor } from '@/lib/utils';
import { Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const STATUS_SEQUENCE = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'] as const;

const BADGE_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  DELIVERED: 'success',
  CANCELLED: 'danger',
  PENDING: 'warning',
  CONFIRMED: 'info',
  PACKED: 'default',
  SHIPPED: 'default',
};

function getNextStatus(current: string): string | null {
  const idx = STATUS_SEQUENCE.indexOf(current as any);
  if (idx >= 0 && idx < STATUS_SEQUENCE.length - 1) return STATUS_SEQUENCE[idx + 1];
  return null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [confirmingStatus, setConfirmingStatus] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updatingTracking, setUpdatingTracking] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, limit: 15, sort: 'newest' };
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await api.getOrders(params);
      if (res.success) {
        setOrders(res.data.items);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string, note?: string) => {
    setUpdatingId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, note);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setConfirmingStatus(null);
        setStatusNote('');
        fetchOrders();
        if (selectedOrder?.id === orderId) setSelectedOrder(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTrackingUpdate = async (orderId: string) => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }
    setUpdatingTracking(true);
    try {
      const res = await api.put<{ success: boolean; data: any }>(`/orders/${orderId}`, { trackingNumber: trackingNumber.trim() });
      if (res.success) {
        toast.success('Tracking number updated');
        setTrackingNumber(trackingNumber.trim());
        fetchOrders();
        if (selectedOrder?.id === orderId) setSelectedOrder(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update tracking');
    } finally {
      setUpdatingTracking(false);
    }
  };

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setConfirmingStatus(null);
    setStatusNote('');
  };

  const handleExport = () => {
    toast.success('Orders export started. You will be notified when ready.');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500">Manage customer orders</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search by order #, customer name, email..."
              className="sm:w-80"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table / States */}
        {error ? (
          <ErrorState message={error} onRetry={fetchOrders} />
        ) : loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description={
              search || statusFilter !== 'ALL' || dateFrom || dateTo
                ? 'Try adjusting your search or filters'
                : undefined
            }
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Order #</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Items</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openOrderDetail(order)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-gray-900">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={order.paymentStatus === 'PAID' || order.paymentStatus === 'COMPLETED' ? 'success' : order.paymentStatus === 'REFUNDED' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {order.paymentStatus || 'UNPAID'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openOrderDetail(order); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <select
                            value={order.orderStatus}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              if (newStatus !== order.orderStatus) {
                                if (confirm(`Change order status from ${order.orderStatus} to ${newStatus}?`)) {
                                  handleStatusChange(order.id, newStatus);
                                }
                              }
                            }}
                            disabled={updatingId === order.id}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PACKED">Packed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => { setSelectedOrder(null); setConfirmingStatus(null); setStatusNote(''); }}
        title=""
        size="full"
        className="!max-w-5xl"
      >
        {selectedOrder && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 font-mono">{selectedOrder.orderNumber}</h2>
                  <Badge variant={BADGE_VARIANT[selectedOrder.orderStatus] || 'default'} size="md">
                    {selectedOrder.orderStatus}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">Placed on {formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getNextStatus(selectedOrder.orderStatus) && (
                  <Button
                    size="sm"
                    onClick={() => setConfirmingStatus(getNextStatus(selectedOrder.orderStatus))}
                  >
                    Mark as {getNextStatus(selectedOrder.orderStatus)}
                  </Button>
                )}
                {selectedOrder.orderStatus !== 'CANCELLED' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setConfirmingStatus('CANCELLED')}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Confirmation dialog for status change */}
            {confirmingStatus && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-amber-900">
                  {confirmingStatus === 'CANCELLED'
                    ? 'Are you sure you want to cancel this order?'
                    : `Update status from ${selectedOrder.orderStatus} to ${confirmingStatus}?`}
                </p>
                <Input
                  placeholder="Add a note (optional)..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    isLoading={updatingId === selectedOrder.id}
                    onClick={() => handleStatusChange(selectedOrder.id, confirmingStatus, statusNote || undefined)}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setConfirmingStatus(null); setStatusNote(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            {selectedOrder.statusHistory?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Status Timeline
                </h3>
                <div className="relative">
                  {selectedOrder.statusHistory.map((h: any, idx: number) => (
                    <div key={h.id} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ring-2 ring-white ${
                          h.status === 'DELIVERED' ? 'bg-green-500' :
                          h.status === 'CANCELLED' ? 'bg-red-500' :
                          h.status === 'CONFIRMED' ? 'bg-blue-500' :
                          h.status === 'PACKED' ? 'bg-indigo-500' :
                          h.status === 'SHIPPED' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`} />
                        {idx < selectedOrder.statusHistory.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {h.status === 'PENDING' ? 'Order Placed' :
                           h.status === 'CONFIRMED' ? 'Order Confirmed' :
                           h.status === 'PACKED' ? 'Order Packed' :
                           h.status === 'SHIPPED' ? 'Order Shipped' :
                           h.status === 'DELIVERED' ? 'Order Delivered' :
                           h.status === 'CANCELLED' ? 'Order Cancelled' : h.status}
                        </p>
                        <p className="text-xs text-gray-500">{formatDateTime(h.createdAt)}</p>
                        {h.note && <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{h.note}&rdquo;</p>}
                        {h.performedBy && <p className="text-xs text-gray-400 mt-0.5">by {h.performedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900 font-medium">{selectedOrder.customerName}</p>
                  <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && <p className="text-gray-600">{selectedOrder.customerPhone}</p>}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Shipping Address
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {selectedOrder.shippingAddress && <p>{selectedOrder.shippingAddress}</p>}
                  <p>
                    {[selectedOrder.city, selectedOrder.state].filter(Boolean).join(', ')}
                    {selectedOrder.pincode ? ` - ${selectedOrder.pincode}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Order Items
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Variant</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Qty</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-50"
                              />
                            )}
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{item.sku || '—'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {[item.size, item.color].filter(Boolean).join(' / ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatPrice(item.price)}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(selectedOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(selectedOrder.tax)}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Tracking */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Tracking
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex-1 w-full sm:max-w-xs">
                  <Input
                    placeholder="Enter tracking number..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  isLoading={updatingTracking}
                  onClick={() => handleTrackingUpdate(selectedOrder.id)}
                >
                  Update Tracking
                </Button>
              </div>
              {selectedOrder.trackingNumber && (
                <p className="text-sm text-gray-700 mt-2">
                  Current tracking:{' '}
                  <span className="font-mono font-medium text-gray-900">{selectedOrder.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
