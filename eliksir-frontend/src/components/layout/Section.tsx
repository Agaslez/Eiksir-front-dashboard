import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, id, className = '' }, ref) => {
    // Centralne miejsce do zarządzania paddingami sekcji.
    // Ujednolicamy odstępy do py-20 na mobile i md:py-32 na desktop.
    return (
      <motion.section
        ref={ref}
        id={id}
        className={`relative py-20 md:py-32 ${className}`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {children}
      </motion.section>
    );
  }
);

Section.displayName = 'Section';
