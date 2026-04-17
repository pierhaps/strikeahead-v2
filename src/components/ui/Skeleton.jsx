/**
 * Skeleton — shimmer placeholder components.
 * All use the same CSS shimmer animation defined in index.css.
 * Colors: base #0e1e30, shimmer highlight #132843
 */
import React from 'react';

/* ── Base shimmer block ─────────────────────────────────────────────── */
export function Sk({ className = '', style = {}, rounded = 'rounded-xl' }) {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      style={style}
    />
  );
}

/* ── Preset shapes ──────────────────────────────────────────────────── */
export function SkCircle({ size = 40, className = '' }) {
  return <Sk className={className} rounded="rounded-full" style={{ width: size, height: size, flexShrink: 0 }} />;
}

export function SkLine({ width = '100%', height = 12, className = '' }) {
  return <Sk className={className} rounded="rounded-lg" style={{ width, height }} />;
}

export function SkBlock({ width = '100%', height = 80, className = '' }) {
  return <Sk className={className} style={{ width, height }} />;
}

/* ── Composite skeletons ────────────────────────────────────────────── */

/** Feed post card */
export function SkFeedPost() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
        <SkCircle size={36} />
        <div className="flex-1 space-y-1.5">
          <SkLine width="40%" height={11} />
          <SkLine width="25%" height={9} />
        </div>
      </div>
      {/* Image */}
      <SkBlock height={200} className="rounded-none" />
      {/* Text lines */}
      <div className="px-4 py-3 space-y-2">
        <SkLine width="90%" height={11} />
        <SkLine width="70%" height={11} />
      </div>
      {/* Actions */}
      <div className="px-4 pb-3 flex gap-4">
        <SkLine width={48} height={20} />
        <SkLine width={48} height={20} />
      </div>
    </div>
  );
}

/** 2-col card (bait / encyclopedia) */
export function SkCard2Col() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <SkBlock height={112} className="rounded-none" />
      <div className="p-2.5 space-y-1.5">
        <SkLine width="80%" height={11} />
        <SkLine width="50%" height={9} />
        <SkLine width="35%" height={9} />
      </div>
    </div>
  );
}

/** Encyclopedia fish card */
export function SkFishCard() {
  return (
    <div className="liquid-glass-subtle rounded-2xl overflow-hidden border border-foam/5">
      <SkBlock height={112} className="rounded-none" />
      <div className="p-2.5 space-y-1.5">
        <SkLine width="75%" height={12} />
        <SkLine width="55%" height={9} />
        <SkLine width="40%" height={8} />
      </div>
    </div>
  );
}

/** Stat block (3-col grid) */
export function SkStatGrid() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="liquid-glass-subtle rounded-2xl p-3 flex flex-col items-center gap-1.5">
          <SkLine width="60%" height={22} />
          <SkLine width="80%" height={9} />
        </div>
      ))}
    </div>
  );
}

/** Profile header (avatar + name + xp bar) */
export function SkProfileHeader() {
  return (
    <div className="space-y-4 px-4">
      {/* Cover + avatar */}
      <div className="relative">
        <SkBlock height={144} className="rounded-none" />
        <div className="absolute -bottom-12 left-4">
          <SkCircle size={96} />
        </div>
      </div>
      <div className="pt-14 space-y-2">
        <SkLine width="55%" height={22} />
        <SkLine width="40%" height={12} />
      </div>
      {/* Stats */}
      <SkStatGrid />
      {/* XP bar */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <div className="flex justify-between">
          <SkLine width="40%" height={12} />
          <SkLine width="30%" height={12} />
        </div>
        <SkBlock height={12} />
      </div>
    </div>
  );
}

/** Insight bar placeholder */
export function SkInsightBar() {
  return (
    <div className="rounded-2xl px-4 py-3 flex items-start gap-3" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(14,30,48,0.6)' }}>
      <SkCircle size={32} />
      <div className="flex-1 space-y-2">
        <SkLine width="85%" height={12} />
        <SkLine width="60%" height={10} />
        <SkBlock height={6} />
      </div>
    </div>
  );
}

/** Regulation list row */
export function SkRegRow() {
  return (
    <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
      <SkCircle size={32} />
      <div className="flex-1 space-y-1.5">
        <SkLine width="55%" height={12} />
        <SkLine width="40%" height={9} />
      </div>
      <SkLine width={40} height={20} />
    </div>
  );
}

/** Catch card (horizontal scroll) */
export function SkCatchCard() {
  return (
    <div className="flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden">
      <SkBlock width={96} height={128} className="rounded-none" />
    </div>
  );
}

/** Map overlay */
export function SkMapOverlay() {
  return (
    <div className="absolute inset-0 bg-abyss-950/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
      <SkBlock width={200} height={16} />
      <SkBlock width={140} height={12} />
    </div>
  );
}

/** Generic full-page loader (replaces spinner) */
export function SkPage({ children }) {
  return (
    <div className="px-4 pt-6 pb-4 space-y-4 animate-fade-in">
      {children}
    </div>
  );
}