'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

const defaultTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/customers': 'Customers',
  '/admin/coupons': 'Coupons',
  '/admin/banners': 'Banners',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
  '/admin/admins': 'Admins',
  '/admin/logs': 'Activity Logs',
};

export function AdminLayout({ children, title, description, breadcrumbs }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pageTitle = title || defaultTitles[pathname] || 'Admin';
  const defaultBreadcrumbs: Breadcrumb[] = [{ label: 'Home', href: '/admin/dashboard' }];
  if (pathname !== '/admin/dashboard') {
    defaultBreadcrumbs.push({ label: pageTitle });
  }
  const crumbs = breadcrumbs || defaultBreadcrumbs;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 lg:pl-0 pt-14 lg:pt-0 overflow-x-hidden">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            {crumbs && crumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                {crumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    {idx === 0 && <Home className="w-3.5 h-3.5" />}
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-primary-600 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">{pageTitle}</h1>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
