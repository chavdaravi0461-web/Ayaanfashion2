'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('admin_token', res.data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin));
        toast.success('Welcome back!');
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display font-bold text-2xl">AF</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-1">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bhojanikomail@gmail.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              <Lock className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
          {/* Use the admin credentials configured in the backend */}
        </form>
      </div>
    </div>
  );
}
