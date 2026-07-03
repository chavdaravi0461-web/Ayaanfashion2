import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/store';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Ayaan Footwear & Watches — Premium Shoes & Timepieces',
    template: '%s | Ayaan Footwear & Watches',
  },
  description: 'Discover premium shoes and watches at Ayaan Footwear & Watches. Shop sneakers, formal shoes, luxury watches, smartwatches and more.',
  keywords: 'shoes, footwear, watches, luxury watches, smart watches, sneakers, online shopping, Ayaan',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Ayaan Footwear & Watches',
    title: 'Ayaan Footwear & Watches — Premium Shoes & Timepieces',
    description: 'Premium shoes and watches curated for style and performance.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayaan Footwear & Watches',
    description: 'Premium shoes and watches curated for style and performance.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#333', color: '#fff', borderRadius: '8px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
