'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error('All fields are required'); return;
    }
    setLoading(true);
    try {
      const res = await api.createAddress(form);
      if (res.success) {
        toast.success('Address added');
        router.push('/account');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28 min-h-[70vh] py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Add New Address</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Phone *" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              <Input label="Address *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                <Input label="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              </div>
              <Input label="PIN Code *" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded text-primary-600" />
                <span className="text-sm">Set as default address</span>
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" isLoading={loading}>Save Address</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
