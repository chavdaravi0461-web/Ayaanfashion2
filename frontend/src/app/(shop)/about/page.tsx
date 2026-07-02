import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Shield, Heart, Award, Users } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Passion for Fashion', text: 'We curate every piece with love and attention to detail, ensuring our collection reflects the latest trends while maintaining timeless elegance.' },
  { icon: Award, title: 'Quality First', text: 'Every product undergoes rigorous quality checks to ensure you receive nothing but the best.' },
  { icon: Shield, title: 'Trust & Reliability', text: 'With secure payments, easy returns, and dedicated support, your shopping experience is our top priority.' },
  { icon: Users, title: 'Customer Centric', text: 'Our customers are at the heart of everything we do. Your satisfaction drives us to constantly improve.' },
];

export default function AboutPage() {
  return (
    <main>
      <Header />
      <div className="pt-24 lg:pt-28">
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">About Ayaan Fashion</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Your premium fashion destination where tradition meets contemporary style.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">Founded with a vision to make premium fashion accessible to everyone, Ayaan Fashion started as a small boutique and has grown into a trusted name in the fashion industry.</p>
              <p className="text-gray-600 leading-relaxed mb-4">We believe that fashion is a form of self-expression. Our carefully curated collections are designed to help you make a statement, whether you prefer traditional elegance or modern sophistication.</p>
              <p className="text-gray-600 leading-relaxed">Today, we serve thousands of happy customers across India, offering everything from traditional wear to contemporary fashion accessories.</p>
            </div>
            <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center">
              <span className="text-6xl font-display font-bold text-primary-600">AF</span>
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, idx) => {
              const Icon = v.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
