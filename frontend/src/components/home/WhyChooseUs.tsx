import { Truck, Shield, HeadphonesIcon, RotateCcw } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'Free delivery on orders above ₹999' },
  { icon: Shield, title: 'Secure Payment', description: '100% secure payment processing' },
  { icon: HeadphonesIcon, title: '24/7 Support', description: 'Round-the-clock customer service' },
  { icon: RotateCcw, title: 'Easy Returns', description: 'Hassle-free returns within 7 days' },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white">Why Choose Us</h2>
          <p className="text-primary-100 mt-2">We deliver excellence in every aspect</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-primary-100">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
