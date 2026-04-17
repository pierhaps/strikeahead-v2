import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LONG_PRESS_MS = 500;

/**
 * LongPressMenu
 *
 * Props:
 *   items: [{ label, icon: ReactNode, danger?, onPress }]
 *   children: the element to wrap
 */
export default function LongPressMenu({ items = [], children }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);

  const start = useCallback((e) => {
    const touch = e.touches?.[0] || e;
    const x = touch.clientX;
    const y = touch.clientY;
    timerRef.current = setTimeout(() => {
      setPos({ x, y });
      setOpen(true);
      // Haptic if available
      navigator.vibrate?.(18);
    }, LONG_PRESS_MS);
  }, []);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  const dismiss = useCallback(() => setOpen(false), []);

  // Clamp menu within viewport
  const menuW = 200;
  const menuH = items.length * 46 + 8;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const clampedX = Math.min(Math.max(pos.x - menuW / 2, 8), vw - menuW - 8);
  const clampedY = pos.y + menuH + 12 > vh ? pos.y - menuH - 12 : pos.y + 12;

  return (
    <>
      <div
        onTouchStart={start}
        onTouchEnd={cancel}
        onTouchMove={cancel}
        onMouseDown={start}
        onMouseUp={cancel}
        onMouseLeave={cancel}
        className="select-none"
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[9000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismiss}
              style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
            />

            {/* Menu */}
            <motion.div
              className="fixed z-[9001] rounded-2xl overflow-hidden"
              style={{
                left: clampedX,
                top: clampedY,
                width: menuW,
                background: 'rgba(14,30,48,0.88)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                border: '0.5px solid rgba(232,240,245,0.12)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
              }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            >
              {items.map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && (
                    <div style={{ height: '0.5px', background: 'rgba(232,240,245,0.08)', margin: '0 12px' }} />
                  )}
                  <motion.button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium"
                    style={{ color: item.danger ? '#FF6B5B' : '#E8F0F5' }}
                    whileTap={{ background: 'rgba(255,255,255,0.06)' }}
                    onClick={() => { dismiss(); item.onPress?.(); }}
                  >
                    {item.icon && (
                      <span className="w-5 h-5 flex items-center justify-center opacity-70 flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </motion.button>
                </React.Fragment>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}