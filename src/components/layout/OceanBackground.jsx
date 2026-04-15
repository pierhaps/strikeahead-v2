import React, { useMemo } from 'react';

export default function OceanBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Deep background */}
      <div className="absolute inset-0 bg-abyss-950" />
      
      {/* Radial glow center */}
      <div 
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(14,64,84,0.6) 0%, transparent 70%)' }}
      />

      {/* Wave Layer 1 */}
      <div className="absolute bottom-0 left-0 w-[200%] h-48 animate-wave-drift-slow" style={{ willChange: 'transform' }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,0 1440,40 L1440,120 L0,120 Z"
            fill="rgba(31,167,184,0.14)"
          />
        </svg>
      </div>

      {/* Wave Layer 2 */}
      <div className="absolute bottom-0 left-0 w-[200%] h-56 animate-wave-drift-slower" style={{ willChange: 'transform' }}>
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,140 L0,140 Z"
            fill="rgba(31,167,184,0.09)"
          />
        </svg>
      </div>

      {/* Plankton particles */}
      <PlanktonField />
    </div>
  );
}

function PlanktonField() {
  const particles = React.useMemo(() => 
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 14 + Math.random() * 12,
      delay: Math.random() * 20,
      color: i % 3 === 0 ? 'rgba(245,195,75,0.25)' : i % 3 === 1 ? 'rgba(127,220,229,0.2)' : 'rgba(31,167,184,0.18)',
    }))
  , []);

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </>
  );
}