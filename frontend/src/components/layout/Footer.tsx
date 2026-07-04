'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, MessageCircle, Play, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export function Footer() {
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then((res: any) => {
      if (res.success) setCategories(res.data.slice(0, 6));
    }).catch(() => {});
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Newsletter */}
        <div className="py-12 border-b border-gray-800">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-display font-bold text-white mb-2">Join Our Newsletter</h3>
            <p className="text-gray-400 mb-6">Subscribe to get special offers, free giveaways, and exclusive deals.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              <span className="text-primary-500">Ayaan</span> Footwear &amp; Watches
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Premium shoes and watches curated for style and performance. 
              Discover footwear and timepieces that define you.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Instagram">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="Facebook">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors" aria-label="YouTube">
                <Play className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop', label: 'Shop All' },
                { href: '/new-arrivals', label: 'New Arrivals' },
                { href: '/best-sellers', label: 'Best Sellers' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/order-tracking', label: 'Track Order' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-3">
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.slug}`} className="text-sm hover:text-primary-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">Shop no 06, Behman Arcade, opp. Bilal Hospital, Kausa, Mumbra, Thane, Maharashtra 400612</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm">+91-7977885020</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm">bhojanikomail@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Ayaan Footwear &amp; Watches. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
