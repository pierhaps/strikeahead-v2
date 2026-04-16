import React from 'react';

/**
 * OceanBackground — Brand v3 ambient layer.
 *
 * Navy base surface + aurora glow (cyan/teal/lime radial gradients, drifting),
 * subtle wave silhouettes, floating plankton.  All animations respect
 * prefers-reduced-motion (handled globally in index.css).
 */
export default function OceanBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Navy gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, #0E1E30 0%, #0A1828 55%, #07101D 100%)',
        }}
      />

      {/* Aurora: brand-tinted radial glows, slow drift */}
      <div className="aurora-layer" />

      {/* Accent glow — strike-lime echo bottom-right */}
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(182,240,60,0.35), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Accent glow — cyan echo top-left */}
      <div
        className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle, rgba(45,168,255,0.35), transparent 60%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Fine grain overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
        }}
      />

      {/* Wave Layer 1 — brand teal, low alpha */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-40 animate-wave-drift"
        style={{ willChange: 'transform' }}
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,0 1440,40 L1440,120 L0,120 Z"
            fill="rgba(46,224,201,0.10)"
          />
        </svg>
      </div>

      {/* Wave Layer 2 — cyan, lower */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-48 animate-wave-drift"
        style={{ willChange: 'transform', animationDuration: '22s' }}
      >
        <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,140 L0,140 Z"
            fill="rgba(45,168,255,0.08)"
          />
        </svg>
      </div>

      {/* Plankton particles — mixed strike palette */}
      <PlanktonField />
    </div>
  );
}

function PlanktonField() {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 14 + Math.random() * 12,
        delay: Math.random() * 20,
        color:
          i % 3 === 0
            ? 'rgba(182,240,60,0.30)'   // lime
            : i % 3 === 1
            ? 'rgba(46,224,201,0.28)'   // teal
            : 'rgba(45,168,255,0.26)',  // cyan
      })),
    []
  );

  return (
    <>
      {particles.map((p) => (
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
