import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: January 2024</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-gray max-w-none">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including your name, email address, phone number, shipping address, and payment information when you make a purchase or create an account.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to process your orders, communicate with you about your purchases, improve our services, and send you marketing communications (with your consent).</p>
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business.</p>
          <h2>4. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>
          <h2>5. Cookies</h2>
          <p>We use cookies to enhance your browsing experience, analyze site traffic, and understand where our audience is coming from.</p>
          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time. You can also opt out of marketing communications by contacting us.</p>
          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at komailbhojani@gmail.com.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
