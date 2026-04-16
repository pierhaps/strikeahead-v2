import React from 'react';

/**
 * StrikeLogo — StrikeAhead Brand v3 logo component.
 *
 * Variants (from /public/brand/logo):
 *   - 'mark'        : Mark_Primary_Transparent.svg  (icon, best on mid/light surfaces)
 *   - 'mark-dark'   : Mark_Primary_OnDark.svg       (icon, optimized for dark surfaces)
 *   - 'gradient'    : Mark_Gradient.svg             (icon, full strike gradient)
 *   - 'horizontal'  : Wordmark_Horizontal.svg       (icon + wordmark, horizontal)
 *   - 'wordmark'    : Wordmark_TextOnly.svg         (wordmark only)
 *   - 'full-black'  : Wordmark_Full_Black.svg       (wordmark, black — for print/light bg)
 *
 * Props:
 *   variant  — one of the above, default 'mark-dark'
 *   size     — px height, default 32 (width auto-scales via aspect)
 *   className — extra classes (applied to <img>)
 *   glow      — if true, add strike-tinted drop-shadow
 *   pulse     — if true, subtle breathing animation
 */
const VARIANTS = {
  'mark':       '/brand/logo/Mark_Primary_Transparent.svg',
  'mark-dark':  '/brand/logo/Mark_Primary_OnDark.svg',
  'gradient':   '/brand/logo/Mark_Gradient.svg',
  'horizontal': '/brand/logo/Wordmark_Horizontal.svg',
  'wordmark':   '/brand/logo/Wordmark_TextOnly.svg',
  'full-black': '/brand/logo/Wordmark_Full_Black.svg',
};

export default function StrikeLogo({
  variant = 'mark-dark',
  size = 32,
  className = '',
  glow = false,
  pulse = false,
  alt = 'StrikeAhead',
  ...rest
}) {
  const src = VARIANTS[variant] || VARIANTS['mark-dark'];
  const filter = glow ? 'drop-shadow(0 0 18px rgba(46,224,201,0.55))' : undefined;
  const animClass = pulse ? 'animate-breathe' : '';

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      height={size}
      style={{ height: size, width: 'auto', filter }}
      className={`select-none ${animClass} ${className}`}
      {...rest}
    />
  );
}

export { VARIANTS as STRIKE_LOGO_VARIANTS };
