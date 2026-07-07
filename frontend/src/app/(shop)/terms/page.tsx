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
          <p>By accessing and using this website, you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree with any part of these terms, please do not use our website.</p>

          <h2>2. Products and Pricing</h2>
          <p>We strive to display accurate product information, pricing, and availability. Product images are for illustration purposes; actual products may vary slightly. We reserve the right to correct any errors and update prices at any time without prior notice.</p>

          <h2>3. Orders</h2>
          <p>All orders are subject to availability and confirmation. Once you place an order, you will receive an acknowledgment email. Order confirmation occurs once payment is verified and stock is confirmed. We reserve the right to cancel any order if the product is unavailable or if there was a pricing error.</p>

          <h2>4. Payment</h2>
          <p>We accept Cash on Delivery (COD) as a payment method. Full payment is required before order dispatch. We are working on adding online payment options including UPI, debit/credit cards, and net banking.</p>

          <h2>5. Shipping and Delivery</h2>
          <p>We aim to process and ship orders within 24-48 hours of confirmation. Estimated delivery is 2-6 business days depending on location. See our <a href="/shipping">Shipping Policy</a> for detailed information.</p>

          <h2>6. Returns and Refunds</h2>
          <p>We accept returns within 7 days of delivery for defective or incorrect items. Items must be unused and in original packaging with all tags attached. See our <a href="/refund">Refund Policy</a> for complete details.</p>

          <h2>7. Intellectual Property</h2>
          <p>All content on this website — including images, text, logos, and product descriptions — is the property of Ayaan Footwear & Watches and may not be reproduced without written permission.</p>

          <h2>8. Limitation of Liability</h2>
          <p>Ayaan Footwear & Watches shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or purchase of products.</p>

          <h2>9. Contact</h2>
          <p>For any questions regarding these terms, please contact us at <strong>bhojanikomail@gmail.com</strong> or call <strong>+91-7977885020</strong>.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
