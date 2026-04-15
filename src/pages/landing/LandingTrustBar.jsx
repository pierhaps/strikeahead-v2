import React from 'react';
import { Globe, Shield, Lock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LandingTrustBar() {
  const { t } = useTranslation();

  const items = [
    { icon: Globe, label: t('landing.trust.countries') },
    { icon: Shield, label: t('landing.trust.gdpr') },
    { icon: Lock, label: t('landing.trust.encrypted') },
    { icon: Star, label: t('landing.trust.rating') },
  ];

  return (
    <div className="py-5 border-y border-tide-300/10" style={{ background: 'rgba(7,38,55,0.4)' }}>
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