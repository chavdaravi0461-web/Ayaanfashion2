'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-600 max-w-xl mx-auto">Have a question or concern? We'd love to hear from you.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <Input label="Your Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <Input label="Subject *" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <Textarea label="Message *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={6} />
                <Button type="submit" size="lg" isLoading={loading}>Send Message</Button>
              </form>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Contact Information</h2>
              {[
                { icon: MapPin, label: 'Address', value: '123 Fashion Street, Mumbai - 400001' },
                { icon: Phone, label: 'Phone', value: '+91-9876543210' },
                { icon: Mail, label: 'Email', value: 'bhojanikomail@gmail.com' },
                { icon: Clock, label: 'Working Hours', value: 'Mon - Sat: 10:00 AM - 7:00 PM' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
