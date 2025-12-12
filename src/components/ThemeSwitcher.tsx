import { useState, useEffect } from 'react';
import { themes, type ThemeName } from '../lib/theme';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('eliksir');
  const [isVisible, setIsVisible] = useState(false);
  
  // Sprawdź czy jesteśmy w development lub debug mode
  const isDev = process.env.NODE_ENV === 'development';
  const showDebug = typeof window !== 'undefined' && window.location.search.includes('debug');
  
  // Ukryj w produkcji jeśli nie ma debug flag
  if (!isDev && !showDebug) return null;
  
  // Załaduj zapisany motyw przy starcie
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);
  
  // Zmień motyw
  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    // W prawdziwej aplikacji tutaj użyłbyś Context/Redux do zmiany motywu
    // Na razie tylko zapisujemy do localStorage
    console.log(`Theme changed to: ${theme}`);
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-[9999] group">
      <div 
        className={`absolute bottom-0 right-0 transition-all duration-500 bg-black/90 backdrop-blur-xl rounded-full p-5 shadow-2xl border border-white/20 mb-20 w-max ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex gap-3 flex-wrap justify-center">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key as ThemeName)}
              className={`w-11 h-11 rounded-full transition-all hover:scale-125 hover:shadow-2xl ${
                currentTheme === key ? 'ring-4 ring-white/80 scale-125' : 'ring-2 ring-white/40'
              } bg-gradient-to-br ${theme.gradient}`}
              title={theme.name}
            />
          ))}
        </div>
        <p className="text-white/70 text-xs text-center mt-4 font-light tracking-wider">
          {themes[currentTheme].name}
        </p>
      </div>
      
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 shadow-2xl cursor-pointer border-4 border-white/30 hover:scale-110 transition-all"
        title="Toggle theme switcher"
      />
    </div>
  );
}