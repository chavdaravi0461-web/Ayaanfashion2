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
            <p className="text-gray-500">Effective Date: July 15, 2026</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 prose prose-gray max-w-none">
          <p>At <strong>Ayaan Fashion</strong>, your privacy is important to us. We are committed to protecting your personal information and ensuring complete transparency about how we collect, use, and safeguard your data.</p>
          <p>By accessing or using our website, you agree to the practices described in this Privacy Policy.</p>

          <h2>Information We Collect</h2>
          <p>When you interact with Ayaan Fashion, we may collect the following information:</p>
          <ul>
            <li>Full Name</li>
            <li>Email Address</li>
            <li>Mobile Number</li>
            <li>Shipping &amp; Billing Address</li>
            <li>Payment Information (processed securely through trusted payment providers)</li>
            <li>Order History</li>
            <li>Device Information</li>
            <li>IP Address</li>
            <li>Browser Type</li>
            <li>Cookies and Usage Data</li>
          </ul>
          <p>We only collect information necessary to provide you with a seamless shopping experience.</p>

          <h2>How We Use Your Information</h2>
          <p>Your information helps us:</p>
          <ul>
            <li>Process and deliver your orders</li>
            <li>Verify payments and prevent fraud</li>
            <li>Provide customer support</li>
            <li>Improve our products and website</li>
            <li>Personalize your shopping experience</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Notify you about new collections, exclusive offers, and promotions (only if you choose to receive them)</li>
          </ul>

          <h2>Payment Security</h2>
          <p>Your payment details are never stored on our servers. All transactions are securely processed through trusted payment gateways using industry-standard SSL encryption.</p>

          <h2>Cookies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Keep your shopping cart active</li>
            <li>Remember your preferences</li>
            <li>Improve website performance</li>
            <li>Analyze visitor behavior</li>
            <li>Deliver a personalized shopping experience</li>
          </ul>
          <p>You may disable cookies through your browser settings; however, some website features may not function properly.</p>

          <h2>Data Sharing</h2>
          <p>We <strong>never</strong> sell your personal information. Your information may only be shared with trusted partners including:</p>
          <ul>
            <li>Payment Providers</li>
            <li>Shipping &amp; Logistics Partners</li>
            <li>Technology &amp; Hosting Providers</li>
            <li>Analytics Services</li>
            <li>Government Authorities where legally required</li>
          </ul>
          <p>Each partner is required to maintain strict confidentiality and security standards.</p>

          <h2>Marketing Communications</h2>
          <p>If you subscribe to our newsletter, we may occasionally send updates regarding new arrivals, exclusive collections, seasonal sales, and special offers.</p>
          <p>You can <strong>unsubscribe at any time</strong> using the link provided in every email.</p>

          <h2>Data Retention</h2>
          <p>We retain your personal information only as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. Your account data is kept while your account is active. Order records are retained for 5 years for tax and legal compliance. You may request deletion of your data at any time.</p>

          <h2>Data Security</h2>
          <p>We implement appropriate technical and organizational security measures including SSL/TLS encryption, firewalls, access controls, and regular security audits to protect your personal information from unauthorized access, misuse, alteration, or disclosure. While we strive to use commercially acceptable methods to protect your data, no online transmission can be guaranteed to be 100% secure.</p>

          <h2>Your Rights</h2>
          <p>You have the right to request:</p>
          <ul>
            <li>Access to your personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of your account and associated data</li>
            <li>Withdrawal of marketing consent at any time</li>
            <li>Data portability in a commonly used format</li>
            <li>Restriction of processing where applicable</li>
          </ul>
          <p>To exercise these rights, please contact us using the details below. We will respond to your request within 30 days.</p>

          <h2>Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites. We encourage you to review their privacy policies before providing any personal information.</p>

          <h2>Children's Privacy</h2>
          <p>Our website is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware of any such data, we will delete it immediately.</p>

          <h2>Policy Updates</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements. The latest version will always be available on this page with the updated effective date.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions regarding this Privacy Policy or your personal information, please contact us at:</p>
          <ul>
            <li><strong>Email:</strong> bhojanikomail@gmail.com</li>
            <li><strong>Phone:</strong> +91-7977885020</li>
            <li><strong>Address:</strong> Shop no 06, Behman Arcade, opp. Bilal Hospital, Kausa, Mumbra, Thane, Maharashtra 400612</li>
          </ul>
          <p>We aim to resolve all privacy-related concerns within 48 hours.</p>
          <hr className="my-8" />
          <p className="text-center text-sm text-gray-500"><strong>Ayaan Fashion</strong> — Premium Fashion. Trusted Shopping. Secure Experience.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
