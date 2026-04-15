import React from 'react';
import { motion } from 'framer-motion';

const tideEase = [0.2, 0.8, 0.2, 1];

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(2px)' }}
      transition={{ duration: 0.4, ease: tideEase }}
    >
      {children}
    </motion.div>
  );
}