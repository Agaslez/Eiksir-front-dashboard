import { Clock, Facebook, Instagram, MapPin, Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { trackEvent } from '../lib/error-monitoring';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Oferta', href: '#oferta' },
    { label: 'Kalkulator', href: '#kalkulator' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Kontakt', href: '#kontakt' },
    { label: 'Panel Admina', href: '/admin/login', admin: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-amber-500/20">
      {/* Top bar */}
      <div className="hidden md:block bg-gradient-to-r from-amber-900/30 to-black">
        <div className="max-w-6xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-amber-300">
                <Phone className="w-4 h-4 mr-2" />
                <span>517-616-618</span>
              </div>
              <div className="flex items-center text-amber-300">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Bełchatów i okolice</span>
              </div>
              <div className="flex items-center text-amber-300">
                <Clock className="w-4 h-4 mr-2" />
                <span>Rezerwacje 24/7</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-400"
                onClick={() => trackEvent('social_click', { platform: 'instagram' })}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-amber-400"
                onClick={() => trackEvent('social_click', { platform: 'facebook' })}
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-black text-xl">EB</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Eliksir <span className="text-amber-400">Bar</span>
              </h1>
              <p className="text-xs text-amber-300">Mobilny Bar Koktajlowy</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`font-medium transition-colors ${
                  item.admin 
                    ? 'text-amber-400 hover:text-amber-300 border border-amber-500/50 px-4 py-2 rounded-lg'
                    : 'text-gray-300 hover:text-amber-400'
                }`}
                onClick={() => trackEvent('nav_click', { item: item.label })}
              >
                {item.label}
              </a>
            ))}
            <button 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-6 py-3 rounded-full transition-all"
              onClick={() => {
                trackEvent('cta_click', { location: 'header' });
                document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Wyceń swoją imprezę
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`font-medium py-2 ${
                    item.admin 
                      ? 'text-amber-400 border border-amber-500/50 px-4 rounded-lg'
                      : 'text-gray-300 hover:text-amber-400'
                  }`}
                  onClick={() => {
                    trackEvent('mobile_nav_click', { item: item.label });
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </a>
              ))}
              <button 
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-6 py-3 rounded-full mt-4"
                onClick={() => {
                  trackEvent('mobile_cta_click');
                  setIsMenuOpen(false);
                  document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Wyceń swoją imprezę
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;