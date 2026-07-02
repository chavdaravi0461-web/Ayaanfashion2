'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Email and password required'); return; }
    if (!isLogin && !form.name) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const res = isLogin
        ? await api.customerLogin(form.email, form.password)
        : await api.customerRegister({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      if (res.success) {
        localStorage.setItem('customer_token', res.data.access_token);
        toast.success(isLogin ? 'Welcome back!' : 'Account created!');
        router.push('/account');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28 min-h-[70vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-display font-bold text-gray-900">{isLogin ? 'Sign In' : 'Create Account'}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin ? 'Welcome back to Ayaan Fashion' : 'Join Ayaan Fashion today'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />}
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              {!isLogin && <Input label="Phone (Optional)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
              <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary-600 hover:underline font-medium">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
