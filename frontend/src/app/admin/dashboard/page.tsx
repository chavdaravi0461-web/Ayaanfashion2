'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, DollarSign, Package, Users, TrendingUp,
  ArrowUp, ArrowDown, Clock, AlertTriangle, PlusCircle,
  BarChart3, FileText, Eye
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatPrice, formatDateTime, getStatusColor, cn } from '@/lib/utils';

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PACKED: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const monthlyRevenueData = [
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 0 },
  { month: 'Mar', revenue: 0 },
  { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 0 },
  { month: 'Jun', revenue: 0 },
];

const ordersByStatusData = [
  { name: 'Pending', value: 0 },
  { name: 'Confirmed', value: 0 },
  { name: 'Shipped', value: 0 },
  { name: 'Delivered', value: 0 },
  { name: 'Cancelled', value: 0 },
];

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getOrders({ limit: 5 }),
    ])
      .then(([statsRes, ordersRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (ordersRes.success) setOrders(ordersRes.data.items);
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const revenue = stats?.revenue ? Number(stats.revenue) : 0;
  const prevRevenue = stats?.prevRevenue ? Number(stats.prevRevenue) : revenue;
  const revenueTrend = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : '0';
  const todayOrders = stats?.todayOrders ?? 0;
  const prevTodayOrders = stats?.prevTodayOrders ?? todayOrders;
  const orderTrend = prevTodayOrders > 0 ? ((todayOrders - prevTodayOrders) / prevTodayOrders * 100).toFixed(1) : '0';

  const chartRevenue = stats?.monthlyRevenue?.length
    ? stats.monthlyRevenue.map((item: any, i: number) => ({
        month: item.month || monthlyRevenueData[i]?.month || `M${i + 1}`,
        revenue: Number(item.revenue) || 0,
      }))
    : monthlyRevenueData;

  const chartStatus = stats?.ordersByStatus
    ? [
        { name: 'Pending', value: Number(stats.ordersByStatus.PENDING) || 0 },
        { name: 'Confirmed', value: Number(stats.ordersByStatus.CONFIRMED) || 0 },
        { name: 'Shipped', value: Number(stats.ordersByStatus.SHIPPED) || 0 },
        { name: 'Delivered', value: Number(stats.ordersByStatus.DELIVERED) || 0 },
        { name: 'Cancelled', value: Number(stats.ordersByStatus.CANCELLED) || 0 },
      ].filter(d => d.value > 0)
    : ordersByStatusData;

  const lowStockProducts = stats?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card className="relative overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today&apos;s Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{todayOrders}</p>
                    <p className={cn('text-xs mt-1 flex items-center gap-1', Number(orderTrend) >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {Number(orderTrend) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(Number(orderTrend))}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(revenue)}</p>
                    <p className={cn('text-xs mt-1 flex items-center gap-1', Number(revenueTrend) >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {Number(revenueTrend) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(Number(revenueTrend))}% vs last period
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.pendingOrders ?? 0}</p>
                    <p className="text-xs mt-1 text-yellow-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Needs attention
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalCustomers ?? 0}</p>
                    <p className="text-xs mt-1 text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Registered users
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={((value: any) => [formatPrice(value), 'Revenue']) as any}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revenueGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Orders by Status</h2>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartStatus} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartStatus.map((entry: any, idx: number) => {
                          const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'];
                          return (
                            <rect key={idx} fill={colors[idx % colors.length]} />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Orders + Best Selling */}
      <div className="grid lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <RecentOrdersSkeleton />
            <Card>
              <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
              <CardContent><Skeleton className="h-48 w-full rounded-lg" /></CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                    View All <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No orders yet</p>
                    <p className="text-xs text-gray-400 mt-1">Orders will appear here once customers start purchasing</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.map((order: any) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors first:-mt-3 first:pt-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.customerName || 'Guest'} &bull; {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</p>
                          <Badge variant={statusVariantMap[order.orderStatus] || 'default'} size="sm">
                            {order.orderStatus}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Best Selling Products</h2>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {stats?.bestSelling?.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {stats.bestSelling.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 py-3 first:-mt-3 first:pt-0">
                        <span className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-100 text-gray-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-400'
                        )}>
                          #{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name || item.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-500">{item.quantity || 0} sold</p>
                        </div>
                        {item.revenue ? (
                          <p className="text-sm font-semibold text-gray-900">{formatPrice(item.revenue)}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No sales data yet</p>
                    <p className="text-xs text-gray-400 mt-1">Best selling products will appear here once orders are placed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions + Low Stock Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><div className="grid grid-cols-3 gap-3"><Skeleton className="h-24 rounded-lg" /><Skeleton className="h-24 rounded-lg" /><Skeleton className="h-24 rounded-lg" /></div></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent><Skeleton className="h-24 rounded-lg" /></CardContent></Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    href="/admin/products/new"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">Add Product</span>
                  </Link>
                  <Link
                    href="/admin/coupons/new"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Create Coupon</span>
                  </Link>
                  <Link
                    href="/admin/reports"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">View Reports</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
            {lowStockProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                    </div>
                    <Badge variant="danger" size="sm">{lowStockProducts.length} items</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-gray-100">
                    {lowStockProducts.map((product: any, idx: number) => (
                      <Link
                        key={product.id || idx}
                        href={`/admin/products/${product.id}`}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors first:-mt-3 first:pt-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name || 'Product'}</p>
                            <p className="text-xs text-gray-500">{product.category || ''}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {product.stock ?? 0} left
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
