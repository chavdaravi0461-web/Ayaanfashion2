import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Browse our collection, add items to your cart, and proceed to checkout. Enter your shipping details and confirm your order. You will receive an order confirmation via email.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently accept Cash on Delivery (COD) for all orders. Online payment options including UPI, credit/debit cards, and net banking will be available soon.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are processed within 24-48 hours. Delivery typically takes 2-6 business days depending on your location. Metro cities receive faster delivery.',
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Yes! We offer free shipping on all orders above ₹999. A flat ₹50 shipping charge applies to orders below this amount.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 7 days of delivery for unused items in original packaging. Defective or incorrect items are eligible for free return and full refund. See our Refund Policy page for details.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is dispatched, you will receive a tracking link via email. You can also track your order on our Order Tracking page using your order number.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Orders can be cancelled within 6 hours of placement, as long as they have not been shipped. Contact us immediately at bhojanikomail@gmail.com to request a cancellation.',
  },
  {
    q: 'Do you sell genuine products?',
    a: 'Absolutely. We source all products directly from authorized distributors and brand partners. Every product we sell is 100% authentic and comes with original manufacturer warranty where applicable.',
  },
  {
    q: 'How can I contact customer support?',
    a: 'You can reach us via email at bhojanikomail@gmail.com, call us at +91-7977885020, or use the contact form on our website. Our team is available Monday to Saturday, 10:00 AM to 7:00 PM.',
  },
  {
    q: 'Is my personal information secure?',
    a: 'Yes. We use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties. See our Privacy Policy for details.',
  },
];

export default function FAQPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 max-w-xl mx-auto">Find answers to common questions about shopping at Ayaan Footwear & Watches.</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-gray-900 font-medium hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
