'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboardStats()
      .then((res: any) => { if (res.success) setStats(res.data); })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Store performance analytics</p>
        </div>

        {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> :
         loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: stats?.totalRevenue ? formatPrice(stats.totalRevenue) : '₹0', icon: DollarSign, color: 'bg-green-500' },
                { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'bg-blue-500' },
                { label: 'Total Customers', value: stats?.totalCustomers ?? 0, icon: Users, color: 'bg-purple-500' },
                { label: 'Avg Order Value', value: stats?.avgOrderValue ? formatPrice(stats.avgOrderValue) : '₹0', icon: TrendingUp, color: 'bg-orange-500' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{item.label}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                        </div>
                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
              </CardHeader>
              <CardContent>
                {stats?.monthlyRevenue?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.monthlyRevenue.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 w-24">{item.month}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3">
                          <div
                            className="bg-primary-600 h-3 rounded-full"
                            style={{ width: `${Math.min(100, (item.revenue / Math.max(...stats.monthlyRevenue.map((m: any) => m.revenue))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-24 text-right">{formatPrice(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm py-4 text-center">No revenue data yet</p>}
              </CardContent>
            </Card>
          </>
        )}
      </div>
  );
}
