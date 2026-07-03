'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag, Image,
  Settings, Shield, FileText, LogOut, Menu, X, ChevronDown,
  Receipt, BarChart3, Activity, ChevronLeft, ChevronRight,
  LogOutIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Receipt },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
  { href: '/admin/logs', label: 'Activity Logs', icon: Activity },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name?: string; email?: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) setAdminUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('customer_token');
    window.location.href = '/admin/login';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-display font-bold text-sm">Ayaan F&W</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-full" />
              )}
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-2">
        {adminUser && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-600">
                {(adminUser.name || adminUser.email || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{adminUser.name || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{adminUser.email || ''}</p>
            </div>
          </div>
        )}
        {confirmLogout ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={handleLogout}
              className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmLogout(false)}
              className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-gray-200 relative transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ChevronLeft className="w-3 h-3 text-gray-500" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full bg-white shadow-2xl animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="p-1 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-display font-bold text-sm">Ayaan F&W Admin</h2>
        <div className="w-5" />
      </div>
    </>
  );
}
