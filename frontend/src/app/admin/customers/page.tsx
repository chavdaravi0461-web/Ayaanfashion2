'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { formatDate, formatPrice, getImageUrl } from '@/lib/utils';
import { Eye, Mail, Phone, MapPin, Heart, ShoppingBag, User, Calendar } from 'lucide-react';

type Tab = 'profile' | 'orders' | 'addresses' | 'wishlist';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<Tab>('profile');

  const fetchCustomers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      const res = await api.getCustomers(params);
      if (res.success) { setCustomers(res.data.items); setTotalPages(res.data.totalPages); }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const viewCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    setDetailTab('profile');
    setDetailLoading(true);
    setCustomerDetail(null);
    setCustomerOrders([]);
    try {
      const [detailRes, ordersRes] = await Promise.allSettled([
        api.getCustomer(customer.id),
        api.getCustomerOrders(customer.id),
      ]);
      if (detailRes.status === 'fulfilled' && detailRes.value.success) {
        setCustomerDetail(detailRes.value.data);
      } else {
        setCustomerDetail(customer);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
        setCustomerOrders(ordersRes.value.data);
      }
    } catch {} finally { setDetailLoading(false); }
  };

  const initials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    'bg-primary-100 text-primary-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-teal-100 text-teal-600',
    'bg-orange-100 text-orange-600',
    'bg-indigo-100 text-indigo-600',
    'bg-cyan-100 text-cyan-600',
    'bg-rose-100 text-rose-600',
  ];

  const avatarColor = (id: string) => avatarColors[parseInt(id?.slice(-2) || '0', 16) % avatarColors.length];

  const activeTabClass = 'px-4 py-2.5 text-sm font-medium text-primary-600 border-b-2 border-primary-600';
  const inactiveTabClass = 'px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300';

  const detail = customerDetail || selectedCustomer;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500">Manage your customer base</p>
          </div>
        </div>

        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name, email or phone..."
          className="sm:w-80"
        />

        {error ? <ErrorState message={error} onRetry={fetchCustomers} /> :
         loading ? <TableSkeleton rows={8} cols={7} /> :
         customers.length === 0 ? <EmptyState title="No customers found" description="Try adjusting your search" /> : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Orders</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Total Spent</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => viewCustomer(c)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor(c.id)}`}>
                            <span className="text-sm font-bold">{initials(c.name)}</span>
                          </div>
                          <span className="font-medium text-gray-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{c.email}</td>
                      <td className="px-4 py-3 text-gray-500">{c.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                          {c.ordersCount ?? c._count?.orders ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.totalSpent ? formatPrice(c.totalSpent) : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => viewCustomer(c)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="View customer">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
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

      <Modal isOpen={!!selectedCustomer} onClose={() => { setSelectedCustomer(null); setCustomerDetail(null); }} title="Customer Details" size="xl">
        {detailLoading ? (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full skeleton" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 skeleton rounded" />
                <div className="h-4 w-56 skeleton rounded" />
              </div>
            </div>
            <div className="h-10 skeleton rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-lg" />
              ))}
            </div>
          </div>
        ) : detail ? (
          <div className="space-y-0">
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold ${avatarColor(detail.id)}`}>
                {initials(detail.name)}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{detail.name}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {detail.email}
                  </span>
                  {detail.phone && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" /> {detail.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> Joined {formatDate(detail.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex border-b overflow-x-auto">
              <button onClick={() => setDetailTab('profile')} className={detailTab === 'profile' ? activeTabClass : inactiveTabClass}>
                <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />Profile
              </button>
              <button onClick={() => setDetailTab('orders')} className={detailTab === 'orders' ? activeTabClass : inactiveTabClass}>
                <ShoppingBag className="w-4 h-4 inline mr-1.5 -mt-0.5" />Orders ({customerOrders.length})
              </button>
              <button onClick={() => setDetailTab('addresses')} className={detailTab === 'addresses' ? activeTabClass : inactiveTabClass}>
                <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5" />Addresses
              </button>
              <button onClick={() => setDetailTab('wishlist')} className={detailTab === 'wishlist' ? activeTabClass : inactiveTabClass}>
                <Heart className="w-4 h-4 inline mr-1.5 -mt-0.5" />Wishlist
              </button>
            </div>

            <div className="pt-5">
              {detailTab === 'profile' && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{detail.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-sm text-gray-900 mt-1 break-all">{detail.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm text-gray-900 mt-1">{detail.phone || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</p>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(detail.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-primary-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary-600">{detail.ordersCount ?? detail._count?.orders ?? 0}</p>
                      <p className="text-xs text-primary-600 font-medium mt-0.5">Total Orders</p>
                    </div>
                    <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{detail.totalSpent ? formatPrice(detail.totalSpent) : '₹0'}</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Total Spent</p>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'orders' && (
                customerOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2.5 font-medium text-gray-600">Order #</th>
                          <th className="text-left px-3 py-2.5 font-medium text-gray-600">Date</th>
                          <th className="text-left px-3 py-2.5 font-medium text-gray-600">Total</th>
                          <th className="text-left px-3 py-2.5 font-medium text-gray-600">Status</th>
                          <th className="text-left px-3 py-2.5 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customerOrders.map((order: any) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 font-mono font-medium text-gray-900 text-xs">
                              {order.orderNumber || `#${order.id.slice(-8).toUpperCase()}`}
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                            <td className="px-3 py-2.5 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                order.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                order.orderStatus === 'CONFIRMED' ? 'bg-purple-100 text-purple-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>{order.orderStatus}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <button className="text-primary-600 hover:text-primary-700 text-xs font-medium">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {detailTab === 'addresses' && (
                (!detail.addresses || detail.addresses.length === 0) ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No addresses saved</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {detail.addresses.map((addr: any, idx: number) => (
                      <div key={addr.id || idx} className="border border-gray-200 rounded-lg p-4 relative">
                        {addr.isDefault && (
                          <span className="absolute top-2 right-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-100 text-primary-700">
                            Default
                          </span>
                        )}
                        <p className="text-sm font-semibold text-gray-900 pr-14">{addr.name}</p>
                        {addr.phone && <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>}
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </p>
                        <p className="text-xs text-gray-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {detailTab === 'wishlist' && (
                (!detail.wishlist || detail.wishlist.length === 0) ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No items in wishlist</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {detail.wishlist.map((item: any, idx: number) => {
                      const product = item.product || item;
                      return (
                        <div key={item.id || idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {product.images?.[0] || product.image ? (
                              <img
                                src={getImageUrl(product.images?.[0] || product.image)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Heart className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatPrice(product.salePrice || product.price)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
