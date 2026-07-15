import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function RefundPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">Return, Refund & Exchange Policy</h1>
            <p className="text-gray-500">Effective Date: July 15, 2026</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-gray max-w-none">
          <p>At <strong>Ayaan Fashion</strong>, customer satisfaction is our priority. If you&apos;re not completely satisfied with your purchase, we&apos;re here to help with a simple and transparent return, exchange, and refund process.</p>

          <h2>1. Return Eligibility</h2>
          <p>You may request a return or exchange within <strong>7 days</strong> of receiving your order, provided that:</p>
          <ul>
            <li>The item is unused, unwashed, and unworn.</li>
            <li>All original tags, labels, and packaging are intact.</li>
            <li>The product is returned in its original condition.</li>
            <li>A valid proof of purchase or order number is provided.</li>
          </ul>
          <p>Products that do not meet these conditions may not be eligible for return or refund.</p>

          <h2>2. Non-Returnable Items</h2>
          <p>The following items cannot be returned or exchanged:</p>
          <ul>
            <li>Products marked as <strong>Final Sale</strong> or <strong>Non-Returnable</strong></li>
            <li>Gift Cards</li>
            <li>Personalized or Customized Products</li>
            <li>Products damaged due to misuse or improper handling</li>
            <li>Items returned without original tags or packaging</li>
          </ul>

          <h2>3. Exchange Policy</h2>
          <p>Eligible products may be exchanged for:</p>
          <ul>
            <li>A different size</li>
            <li>A different color (subject to availability)</li>
            <li>Another product of equal value</li>
          </ul>
          <p>If the requested product is unavailable, we may offer store credit or process a refund where applicable.</p>

          <h2>4. Refund Process</h2>
          <p>Once your returned item is received and inspected, we will notify you of the approval or rejection of your refund request.</p>
          <p>If approved:</p>
          <ul>
            <li>Refunds are processed to the original payment method.</li>
            <li>Processing typically takes <strong>5–10 business days</strong> after approval.</li>
            <li>The time for the amount to appear in your account may vary depending on your bank or payment provider.</li>
          </ul>

          <h2>5. Damaged, Defective or Incorrect Items</h2>
          <p>If you receive a product that is damaged, defective, or different from what you ordered, please contact us within <strong>48 hours</strong> of delivery.</p>
          <p>To help us resolve the issue quickly, please provide:</p>
          <ul>
            <li>Your Order Number</li>
            <li>Photos of the product</li>
            <li>Photos of the packaging (if applicable)</li>
          </ul>
          <p>After verification, we will arrange a replacement or refund, as appropriate.</p>

          <h2>6. Return Shipping</h2>
          <p>If the return is due to our error (wrong, damaged, or defective item), return shipping costs will be borne by <strong>Ayaan Fashion</strong>.</p>
          <p>For all other eligible returns, return shipping charges may be the customer&apos;s responsibility unless otherwise stated.</p>

          <h2>7. Order Cancellation</h2>
          <p>Orders may be cancelled before they are dispatched.</p>
          <p>Once an order has been shipped, cancellation is no longer possible. In such cases, the order will be subject to this Return &amp; Refund Policy.</p>

          <h2>8. Late or Missing Refunds</h2>
          <p>If you have not received your refund:</p>
          <ul>
            <li>Check your bank account again.</li>
            <li>Contact your card issuer or payment provider.</li>
            <li>Processing times may vary depending on your financial institution.</li>
          </ul>
          <p>If you still require assistance, please contact our Customer Support team.</p>

          <h2>9. Policy Updates</h2>
          <p>We reserve the right to modify this Return, Refund &amp; Exchange Policy at any time.</p>
          <p>Any updates will be posted on this page and become effective immediately upon publication.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions regarding returns, exchanges, or refunds, please contact us at:</p>
          <ul>
            <li><strong>Email:</strong> bhojanikomail@gmail.com</li>
            <li><strong>Phone:</strong> +91-7977885020</li>
            <li><strong>Address:</strong> Shop no 06, Behman Arcade, opp. Bilal Hospital, Kausa, Mumbra, Thane, Maharashtra 400612</li>
          </ul>
          <hr className="my-8" />
          <p className="text-center text-sm text-gray-500"><strong>Ayaan Fashion</strong> — Premium Fashion. Trusted Service. Hassle-Free Shopping.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
