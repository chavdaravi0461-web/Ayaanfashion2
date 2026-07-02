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
    default: 'Ayaan Fashion - Premium Fashion Destination',
    template: '%s | Ayaan Fashion',
  },
  description: 'Discover premium fashion at Ayaan Fashion. Shop the latest trends in traditional wear, western wear, accessories and more.',
  keywords: 'fashion, clothing, traditional wear, western wear, accessories, online shopping',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Ayaan Fashion',
    title: 'Ayaan Fashion - Premium Fashion Destination',
    description: 'Discover premium fashion at Ayaan Fashion.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayaan Fashion',
    description: 'Discover premium fashion at Ayaan Fashion.',
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
