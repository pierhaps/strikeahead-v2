import React from 'react';
import LandingNav from './LandingNav';
import LandingHero from './LandingHero';
import LandingFeatures from './LandingFeatures';
import LandingHowItWorks from './LandingHowItWorks';
import LandingTestimonials from './LandingTestimonials';
import LandingPricing from './LandingPricing';
import LandingDevices from './LandingDevices';
import LandingTrustBar from './LandingTrustBar';
import LandingFAQ from './LandingFAQ';
import LandingFinalCTA from './LandingFinalCTA';
import LandingFooter from './LandingFooter';
import OceanBackground from '../../components/layout/OceanBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-abyss-950 overflow-x-hidden">
      <OceanBackground />
      <div className="relative z-10">
        <LandingNav />
        <LandingHero />
        <LandingTrustBar />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingPricing />
        <LandingDevices />
        <LandingFAQ />
        <LandingFinalCTA />
        <LandingFooter />
      </div>
    </div>
  );
}