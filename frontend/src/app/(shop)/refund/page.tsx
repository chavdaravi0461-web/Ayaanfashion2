import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function RefundPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">Refund & Returns Policy</h1>
            <p className="text-gray-500">Last updated: July 2026</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-gray max-w-none">
          <h2>1. Return Window</h2>
          <p>We accept returns within <strong>7 days</strong> of delivery. Items must be unused, unworn, and in original packaging with all tags attached.</p>

          <h2>2. Conditions for Returns</h2>
          <ul>
            <li>Footwear must be tried on a clean surface and returned with the original box (outer shipping box may be discarded).</li>
            <li>Watches must not have been worn or adjusted. Protective films must remain intact.</li>
            <li>All accessories must be returned in original, unused condition.</li>
            <li>Items showing signs of wear, damage, or alteration will not be accepted.</li>
          </ul>

          <h2>3. Defective or Incorrect Items</h2>
          <p>If you receive a defective, damaged, or incorrect item, please contact us within <strong>48 hours</strong> of delivery. We will arrange a free pickup and provide a full refund or replacement at no extra cost.</p>

          <h2>4. Non-Returnable Items</h2>
          <ul>
            <li>Personalized or customized products</li>
            <li>Items marked as "Final Sale" or "Clearance"</li>
            <li>Products damaged due to improper use</li>
            <li>Items returned after the 7-day window</li>
          </ul>

          <h2>5. Refund Process</h2>
          <p>Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within <strong>5-7 business days</strong> and credited to your original payment method or as store credit, as per your preference.</p>

          <h2>6. Return Shipping</h2>
          <p>For defective/incorrect items, return shipping is free. For change-of-mind returns, the customer is responsible for return shipping costs. Original shipping charges are non-refundable.</p>

          <h2>7. How to Initiate a Return</h2>
          <p>Email us at <strong>bhojanikomail@gmail.com</strong> with your order number, item details, and reason for return. Our team will respond within 24 hours with return instructions.</p>

          <h2>8. Exchanges</h2>
          <p>We do not offer direct exchanges. Please return the unwanted item and place a fresh order for the desired item.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
