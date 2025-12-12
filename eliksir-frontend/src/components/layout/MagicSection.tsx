import React from 'react';
import { motion } from 'framer-motion';
import { themes, type ThemeName } from '../../lib/theme';
import { Container } from './Container';

interface MagicSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  id?: string;
  className?: string;
  theme?: ThemeName;
}

export function MagicSection({
  children,
  title,
  subtitle,
  id,
  className = '',
  theme = 'eliksir'
}: MagicSectionProps) {
  const t = themes[theme];
  
  // Mapowanie akcentów na pełne klasy Tailwind
  const accentClasses: Record<string, string> = {
    'amber-400': 'text-amber-400',
    'rose-500': 'text-rose-500',
    'cyan-400': 'text-cyan-400',
    'emerald-600': 'text-emerald-600',
    'yellow-600': 'text-yellow-600'
  };
  
  const accentClass = accentClasses[t.accent] || 'text-amber-400';
  
  const item = {
    hidden: { opacity: 0, y: 80 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 1, 
        ease: t.easing 
      } 
    }
  };
  
  const line = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1, 
      transition: { 
        duration: 1.4, 
        ease: t.easing, 
        delay: 0.8 
      } 
    }
  };

  return (
    <section 
      id={id} 
      className={`py-24 md:py-32 overflow-hidden ${t.bg} ${className}`}
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ 
            visible: { 
              transition: { 
                staggerChildren: 0.12, 
                delayChildren: 0.3 
              } 
            } 
          }}
        >
          {(title || subtitle) && (
            <div className="text-center mb-20">
              {subtitle && (
                <motion.p 
                  variants={item} 
                  className={`${accentClass} uppercase tracking-[0.4em] text-sm font-light`}
                >
                  {subtitle}
                </motion.p>
              )}
              {title && (
                <motion.h2 
                  variants={item} 
                  className={`font-playfair text-5xl md:text-7xl font-bold ${t.text} mt-4`}
                >
                  {title}
                </motion.h2>
              )}
              <motion.div 
                variants={line} 
                className={`w-32 h-px bg-gradient-to-r from-transparent via-${t.accent.split('-')[0]}-${t.accent.split('-')[1]} to-transparent mx-auto mt-10 origin-left`} 
              />
            </div>
          )}
          {children}
        </motion.div>
      </Container>
    </section>
  );
}