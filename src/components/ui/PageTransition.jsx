import React from 'react';

/**
 * PageTransition — plain wrapper (no motion.div).
 * AppShell's AnimatePresence already handles page enter/exit animations.
 * A nested motion.div here caused exit-animation conflicts that prevented
 * new pages from mounting (blank-page bug).
 */
export default function PageTransition({ children }) {
  return <div>{children}</div>;
}