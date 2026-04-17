import React from 'react';

/**
 * Skeleton — shimmer placeholder blocks for loading states.
 * Colors tuned to StrikeAhead dark palette:
 *  base:    #0D1E30  (slightly lighter than bg)
 *  shimmer: #132843  (highlight stripe)
 */

const shimmerStyle = {
  background: 'linear-gradient(90deg, #0D1E30 0%, #132843 50%, #0D1E30 100%)',
  backgroundSize: '200% 100%',
  animation: 'sa-shimmer 1.5s ease-in-out infinite',
};

// Inject keyframes once
if (typeof document !== 'undefined') {
  const id = '__sa_shimmer_kf__';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes sa-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/** Generic skeleton block */
export function SkeletonBlock({ className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{ ...shimmerStyle, ...style }}
    />
  );
}

/** Skeleton for a catch card (grid item) */
export function SkeletonCatchCard() {
  return (
    <div className="rounded-2xl overflow-hidden h-44" style={{ background: '#0D1E30' }}>
      <div className="w-full h-full" style={shimmerStyle} />
    </div>
  );
}

/** Skeleton for a feed post */
export function SkeletonFeedPost() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl" style={shimmerStyle} />
        <div className="flex-1 space-y-1.5">
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="h-2.5 w-20" />
        </div>
      </div>
      <div className="aspect-[4/3] rounded-xl" style={shimmerStyle} />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-3/4" />
    </div>
  );
}

/** Skeleton for a bait/species card (horizontal list) */
export function SkeletonBaitCard() {
  return (
    <div className="flex-shrink-0 w-48 glass-card rounded-2xl overflow-hidden p-3 space-y-2">
      <div className="w-full h-28 rounded-xl" style={shimmerStyle} />
      <SkeletonBlock className="h-3 w-28" />
      <SkeletonBlock className="h-2.5 w-20" />
      <SkeletonBlock className="h-2.5 w-16" />
    </div>
  );
}

/** Skeleton for an encyclopedia fish card */
export function SkeletonFishCard() {
  return (
    <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
      <div className="w-14 h-14 rounded-full flex-shrink-0" style={shimmerStyle} />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="h-2.5 w-16" />
      </div>
    </div>
  );
}

/** Skeleton for a regulation row */
export function SkeletonRegRow() {
  return (
    <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex-shrink-0" style={shimmerStyle} />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-2.5 w-24" />
      </div>
      <SkeletonBlock className="h-3 w-12 rounded-full" />
    </div>
  );
}

/** Skeleton for the profile header */
export function SkeletonProfile() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {/* Cover */}
      <div className="h-36 rounded-2xl" style={shimmerStyle} />
      {/* Avatar + name */}
      <div className="flex items-end gap-3 -mt-10 pl-2">
        <div className="w-24 h-24 rounded-3xl border-4 border-abyss-950 flex-shrink-0" style={shimmerStyle} />
        <div className="pb-2 space-y-2">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-3 w-24" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="glass-card rounded-2xl p-3 space-y-2">
            <SkeletonBlock className="h-5 w-12 mx-auto" />
            <SkeletonBlock className="h-2.5 w-10 mx-auto" />
          </div>
        ))}
      </div>
      {/* XP bar */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <SkeletonBlock className="h-3 w-40" />
        <SkeletonBlock className="h-3 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton for weather/home insight */
export function SkeletonInsight() {
  return (
    <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#0D1E30' }}>
      <div className="w-8 h-8 rounded-xl flex-shrink-0" style={shimmerStyle} />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-2.5 w-2/3" />
      </div>
    </div>
  );
}

/** Skeleton for home stats row */
export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[0,1,2].map(i => (
        <div key={i} className="liquid-glass-subtle rounded-2xl p-3 space-y-2 text-center">
          <SkeletonBlock className="h-5 w-10 mx-auto" />
          <SkeletonBlock className="h-2.5 w-12 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/** Fade-in wrapper for when real content arrives */
export function FadeIn({ children, className = '' }) {
  return (
    <div
      className={className}
      style={{
        animation: 'sa-fadein 0.4s ease both',
      }}
    >
      {children}
      <style>{`@keyframes sa-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}