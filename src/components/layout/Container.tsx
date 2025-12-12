import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className = '' }: ContainerProps) => {
  // Centralne miejsce do zarządzania kontenerem.
  // Używamy max-w-6xl, bo jest najczęściej stosowany w projekcie.
  // px-4 na mobile i sm:px-6 na większych ekranach dla lepszego dopasowania.
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};
