import React from 'react';
import { Globe, Shield, Lock, Star } from 'lucide-react';

const items = [
  { icon: Globe, label: 'Über 14 Länder' },
  { icon: Shield, label: 'DSGVO-konform' },
  { icon: Lock, label: 'Verschlüsselte Daten' },
  { icon: Star, label: '4.9 ⭐ App Store' },
];

export default function LandingTrustBar() {
  return (
    <div
      className="py-5 border-y border-tide-300/10"
      style={{ background: 'rgba(7,38,55,0.4)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap items-center justify-center gap-6 lg:gap-12">
        {items.map(({ icon: TrustIcon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-foam/60 text-sm font-medium">
            <TrustIcon className="w-4 h-4 text-tide-400 flex-shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}