import { motion } from 'framer-motion';
import { trackEvent } from '../lib/error-monitoring';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-black border-t border-white/5">
      <div className="container mx-auto px-6">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <span className="font-playfair text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
              ELIKSIR
            </span>
            <p className="text-white/40 text-sm mt-2">
              Mobilny Bar Koktajlowy · Bełchatów i okolice
            </p>
          </div>

          <p className="text-white/40 text-sm">
            {currentYear} Eliksir Bar Mobilny. Wszelkie prawa zastrzeżone.
          </p>

          <div className="flex gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-amber-400 transition-colors text-sm uppercase tracking-wider"
              onClick={() => trackEvent('footer_social_click', { platform: 'instagram' })}
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-amber-400 transition-colors text-sm uppercase tracking-wider"
              onClick={() => trackEvent('footer_social_click', { platform: 'facebook' })}
            >
              Facebook
            </a>
          </div>
        </motion.div>
        {/* Divider */}
        <div className="border-t border-white/5 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="text-white/60 uppercase tracking-wider mb-4">Kontakt</h4>
              <div className="space-y-2">
                <p className="text-white/40">517-616-618</p>
                <p className="text-white/40">eliksir@bar.pl</p>
                <p className="text-white/40">Bełchatów i okolice</p>
              </div>
            </div>
            <div>
              <h4 className="text-white/60 uppercase tracking-wider mb-4">Szybkie linki</h4>
              <div className="space-y-2">
                <a
                  href="#oferta"
                  className="block text-white/40 hover:text-amber-400 transition-colors"
                  onClick={() => trackEvent('footer_link_click', { link: 'oferta' })}
                >
                  Oferta i pakiety
                </a>
                <a
                  href="#kalkulator"
                  className="block text-white/40 hover:text-amber-400 transition-colors"
                  onClick={() => trackEvent('footer_link_click', { link: 'kalkulator' })}
                >
                  Kalkulator wyceny
                </a>
                <a
                  href="#galeria"
                  className="block text-white/40 hover:text-amber-400 transition-colors"
                  onClick={() => trackEvent('footer_link_click', { link: 'galeria' })}
                >
                  Galeria realizacji
                </a>
                <a
                  href="#kontakt"
                  className="block text-white/40 hover:text-amber-400 transition-colors"
                  onClick={() => trackEvent('footer_link_click', { link: 'kontakt' })}
                >
                  Formularz kontaktowy
                </a>
                <a
                  href="/admin/login"
                  className="block text-amber-400 hover:text-amber-300 transition-colors font-medium"
                  onClick={() => trackEvent('footer_link_click', { link: 'admin' })}
                >
                  Panel Admina
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white/60 uppercase tracking-wider mb-4">Informacje</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-white/40 hover:text-amber-400 transition-colors"
                  onClick={() => trackEvent('footer_legal_click', { link: 'privacy' })}
                >
                  Polityka prywatności
                </a>
                <a
                  href="#"
                  className="block text-white/40 hover:text-amber-400 transition-colors"
                  onClick={() => trackEvent('footer_legal_click', { link: 'terms' })}
                >
                  Regulamin
                </a>
                <a
                  href="#"
                  className="block text-white/40 hover:text-amber-400 transition-colors"
                  onClick={() => trackEvent('footer_legal_click', { link: 'cookies' })}
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Made with love */}
        <div className="text-center mt-8 pt-6 border-t border-white/5">
          <p className="text-white/30 text-xs">
            Stworzone z pasją dla najlepszych imprez w Polsce
          </p>
          <p className="text-white/20 text-xs mt-1">
            Wersja: 1.0.0 | Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;