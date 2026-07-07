import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ShippingPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">Shipping Policy</h1>
            <p className="text-gray-500">Last updated: July 2026</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-gray max-w-none">
          <h2>1. Processing Time</h2>
          <p>All orders are processed within <strong>24-48 hours</strong> (business days) after order confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>

          <h2>2. Shipping Charges</h2>
          <ul>
            <li><strong>Free Shipping:</strong> On all orders above ₹999</li>
            <li><strong>Standard Shipping:</strong> ₹50 flat rate for orders below ₹999</li>
            <li><strong>Express Shipping:</strong> ₹150 — delivery in 1-2 business days (select locations)</li>
          </ul>

          <h2>3. Delivery Timeframe</h2>
          <p>Estimated delivery times after dispatch:</p>
          <ul>
            <li><strong>Metro Cities:</strong> 2-4 business days</li>
            <li><strong>Tier 2 Cities:</strong> 3-6 business days</li>
            <li><strong>Remote Areas:</strong> 5-8 business days</li>
          </ul>

          <h2>4. Order Tracking</h2>
          <p>Once your order is dispatched, you will receive a confirmation email with a tracking number. You can track your order anytime on our <a href="/order-tracking">Order Tracking</a> page.</p>

          <h2>5. Shipping Partners</h2>
          <p>We partner with trusted courier services including Delhivery, Blue Dart, and India Post to ensure reliable delivery across India.</p>

          <h2>6. Delivery Issues</h2>
          <p>If your package is lost or damaged during transit, please contact us within 48 hours at <strong>bhojanikomail@gmail.com</strong> or call <strong>+91-7977885020</strong>. We will file a claim and arrange a replacement or refund.</p>

          <h2>7. Cash on Delivery</h2>
          <p>COD is available on orders up to ₹50,000. A nominal convenience fee may apply. Please keep exact change as our delivery partners may not always have change.</p>

          <h2>8. Shipping Restrictions</h2>
          <p>We currently ship only within India. International shipping is not available at this time.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
