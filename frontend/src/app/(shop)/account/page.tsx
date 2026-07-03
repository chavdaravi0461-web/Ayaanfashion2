'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { User, Package, MapPin, Heart, LogOut, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      window.location.href = '/shop';
      return;
    }
    Promise.all([
      api.getCustomerProfile(),
      api.getAddresses(),
      api.getWishlist(),
    ]).then(([profileRes, addrRes, wishRes]) => {
      if (profileRes.success) {
        setProfile(profileRes.data);
        if (profileRes.data?.id) {
          api.getMyOrders(profileRes.data.id).then((res: any) => {
            if (res.success) setOrders(res.data);
          }).catch(() => {});
        }
      }
      if (addrRes.success) setAddresses(addrRes.data);
      if (wishRes.success) setWishlist(wishRes.data);
    }).catch((err: any) => setError(err.message))
    .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    window.location.href = '/shop';
  };

  if (loading) return <main><Header /><PageLoader /><Footer /></main>;
  if (error) return <main><Header /><ErrorState message={error} /><Footer /></main>;

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">My Account</h1>
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-primary-600">{profile?.name?.[0] || 'U'}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{profile?.name}</p>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
                <nav className="p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Name" value={profile?.name || ''} readOnly />
                    <Input label="Email" value={profile?.email || ''} readOnly />
                    <Input label="Phone" value={profile?.phone || 'Not set'} readOnly />
                    <Input label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''} readOnly />
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No orders yet</p>
                      <Link href="/shop" className="text-primary-600 text-sm hover:underline mt-2 inline-block">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order: any) => (
                        <Link key={order.id} href={`/order-tracking?order=${order.orderNumber}`} className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-semibold text-gray-900">{order.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                              order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>{order.orderStatus}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{order.items?.length || 0} items</span>
                            <span className="font-semibold text-gray-900">₹{Number(order.total).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                    <Link href="/account/addresses/new" className="text-sm text-primary-600 hover:underline">Add New</Link>
                  </div>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No addresses saved</p>
                      <Link href="/account/addresses/new" className="text-primary-600 text-sm hover:underline mt-2 inline-block">Add Address</Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {addresses.map((addr: any) => (
                        <div key={addr.id} className="border border-gray-200 rounded-lg p-4 relative">
                          {addr.isDefault && <span className="absolute top-2 right-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Default</span>}
                          <p className="font-medium text-gray-900">{addr.name}</p>
                          <p className="text-sm text-gray-500">{addr.address}</p>
                          <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-sm text-gray-500">{addr.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">My Wishlist</h2>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Your wishlist is empty</p>
                      <Link href="/shop" className="text-primary-600 text-sm hover:underline mt-2 inline-block">Browse Products</Link>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((item: any) => (
                        <Link key={item.id} href={`/product/${item.product?.slug}`} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-gray-50">
                            <img src={getImageUrl(item.product?.images?.[0]?.url || '') || '/placeholder.svg'} alt={item.product?.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                            <p className="text-primary-600 font-semibold mt-1">₹{Number(item.product?.salePrice || 0).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
