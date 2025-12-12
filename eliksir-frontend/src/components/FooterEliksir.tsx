import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Container } from './layout/Container';

export default function FooterEliksir() {
  const menuLinks = [
    { name: 'Strona Główna', href: '#hero' },
    { name: 'Oferta', href: '#oferta' },
    { name: 'Kalkulator', href: '#kalkulator' },
    { name: 'Galeria', href: '#galeria' },
  ];

  const serviceLinks = [
    { name: 'Wesela', href: '#wesela' },
    { name: 'Eventy Firmowe', href: '#eventy' },
    { name: 'Imprezy Prywatne', href: '#imprezy' },
    { name: 'Koktajle na Zamówienie', href: '#koktajle' },
  ];

  const contactInfo = [
    { icon: Phone, text: '+48 123 456 789', href: 'tel:+48123456789' },
    { icon: Mail, text: 'eliksir@bar.pl', href: 'mailto:eliksir@bar.pl' },
    { icon: MapPin, text: 'Cała Polska', href: '#' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-eliksir-dark border-t border-eliksir-gold/20">
      {/* UŻYJEMY CONTAINER Z WŁASNYMI PADDINGAMI DLA STOPKI */}
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="text-center mb-6">
              <div className="text-4xl font-playfair font-bold inline-block">
                <span className="bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent">
                  ELIKSIR
                </span>
              </div>
            </div>
            <p className="text-white/70 mb-6 max-w-md mx-auto text-center">
              Eliksir Bar to mobilny bar koktajlowy, który tworzy wyjątkowe
              doświadczenia na każdą okazję. Profesjonalizm, kreatywność i
              niezrównana klasa w każdym drinku.
            </p>

            {/* Social */}
            <div className="flex gap-4 mb-8 justify-center">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-eliksir-dark/50 backdrop-blur-sm border border-white/10 rounded-eliksir-lg p-3 hover:border-eliksir-gold transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 text-eliksir-gold" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-playfair text-xl font-bold text-eliksir-gold mb-6 text-center">
              Menu
            </h4>
            <ul className="space-y-3">
              {menuLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-eliksir-gold transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-eliksir-gold rounded-full"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Usługi */}
          <div>
            <h4 className="font-playfair text-xl font-bold text-eliksir-gold mb-6 text-center">
              Usługi
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-eliksir-gold transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-eliksir-gold rounded-full"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="font-playfair text-xl font-bold text-eliksir-gold mb-6 text-center">
              Kontakt
            </h4>
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <a
                    key={index}
                    href={info.href}
                    className="flex items-center gap-3 text-white/70 hover:text-eliksir-gold transition-colors"
                  >
                    <Icon className="w-5 h-5 text-eliksir-gold" />
                    <span>{info.text}</span>
                  </a>
                );
              })}
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-sm text-white/60 mb-3 text-center">
                Zapisz się do newslettera
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Twój email"
                  className="flex-1 bg-eliksir-gray border border-eliksir-gold/30 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:border-eliksir-gold"
                />
                <button
                  type="button"
                  className="bg-eliksir-gold text-black font-semibold px-4 py-2 rounded-r-lg hover:bg-eliksir-gold-light transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-eliksir-gold/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Eliksir Bar Mobilny. Wszelkie
              prawa zastrzeżone.
            </p>

            <div className="flex gap-6 text-sm text-white/60">
              <a
                href="#regulamin"
                className="hover:text-eliksir-gold transition-colors"
              >
                Regulamin
              </a>
              <a
                href="#polityka"
                className="hover:text-eliksir-gold transition-colors"
              >
                Polityka prywatności
              </a>
              <a
                href="/admin"
                className="hover:text-eliksir-gold transition-colors text-xs opacity-50"
              >
                Panel Admin
              </a>
            </div>
          </div>

          {/* Made with love */}
          <div className="text-center mt-6">
            <p className="text-xs text-white/40">
              Stworzone z ❤️ dla miłośników wyjątkowych koktajli
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
