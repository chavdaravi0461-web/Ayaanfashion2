import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28 min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-8xl font-display font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">The page you are looking for does not exist or has been moved.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/"><Button>Go Home</Button></Link>
            <Link href="/shop"><Button variant="outline">Browse Products</Button></Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
