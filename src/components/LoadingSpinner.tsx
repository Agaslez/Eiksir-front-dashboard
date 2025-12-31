import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          {/* Outer ring */}
          <div className="w-20 h-20 border-4 border-amber-900/30 rounded-full"></div>

          {/* Spinning ring */}
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-amber-500 border-r-amber-600 rounded-full animate-spin"></div>

          {/* Inner glow */}
          <div className="absolute top-2 left-2 w-16 h-16 border-2 border-amber-500/20 rounded-full"></div>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gradient mb-2">
            Ładowanie Eliksiru...
          </h2>
          <p className="text-amber-200/70">
            Przygotowujemy magiczne doświadczenie
          </p>
        </div>

        {/* Animated dots */}
        <div className="mt-8 flex justify-center space-x-2">
          <div
            className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-3 h-3 bg-amber-700 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
