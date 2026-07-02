import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-500">Last updated: January 2024</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-gray max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using this website, you accept and agree to be bound by the terms and conditions of this agreement.</p>
          <h2>2. Products and Pricing</h2>
          <p>We strive to display accurate product information and pricing. However, we reserve the right to correct any errors and update prices at any time without prior notice.</p>
          <h2>3. Orders</h2>
          <p>All orders are subject to availability and confirmation. We reserve the right to cancel any order if the product is not available or if there was an error in pricing.</p>
          <h2>4. Payment</h2>
          <p>We accept Cash on Delivery (COD) as a payment method. Full payment is required before order dispatch for COD orders.</p>
          <h2>5. Shipping and Delivery</h2>
          <p>We aim to process and ship orders within 24-48 hours. Delivery times may vary based on location.</p>
          <h2>6. Returns and Refunds</h2>
          <p>We accept returns within 7 days of delivery for defective or incorrect items. Items must be unused and in original packaging.</p>
          <h2>7. Contact</h2>
          <p>For any questions regarding these terms, please contact us at .</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
