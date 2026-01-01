// src/components/Pricing.tsx
import { motion } from 'framer-motion';
import { useComponentHealth } from '../lib/component-health-monitor';
import { OFFERS } from '../lib/content';

type PricingProps = {
  selectedOfferId: string;
  onSelectOffer: (id: string) => void;
};

export default function Pricing({
  selectedOfferId,
  onSelectOffer,
}: PricingProps) {
  useComponentHealth('Pricing');
  const offersArray = Object.values(OFFERS);

  const handleClick = (offerId: string) => {
    onSelectOffer(offerId);
    const el = document.getElementById('kalkulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="oferta" className="py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-xs md:text-sm mb-3">
            Pakiety
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Wybierz swój pakiet
          </h2>
          <p className="text-white/50 text-sm md:text-base max-w-2xl mx-auto">
            Pakiety dopasowane do wesel, eventów firmowych oraz imprez
            prywatnych.
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-6" />
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {offersArray.map((offer, idx) => {
            const isActive = offer.id === selectedOfferId;
            return (
              <motion.div
                key={offer.id}
                className="relative group h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
              >
                {offer.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <span className="px-5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[11px] font-semibold uppercase tracking-[0.2em] shadow-lg">
                      Najpopularniejszy
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col h-full bg-gradient-to-b from-neutral-900 to-neutral-950 border transition-all duration-300 ${
                    isActive
                      ? 'border-amber-400/70 shadow-2xl shadow-amber-500/15 scale-[1.01]'
                      : offer.popular
                        ? 'border-amber-400/40'
                        : 'border-white/5 hover:border-white/25'
                  }`}
                >
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />

                  <div className="p-7 md:p-8 flex flex-col flex-1">
                    <h3 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-2">
                      {offer.name}
                    </h3>
                    <p className="text-white/55 text-sm mb-5 min-h-[3rem]">
                      {offer.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="font-playfair text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                          {offer.price.toLocaleString('pl-PL')}
                        </span>
                        <span className="text-white/50 text-sm">PLN</span>
                      </div>
                      <p className="text-white/40 text-xs mt-1">
                        20–120 gości · ok. {offer.hours}h serwisu
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1 text-sm">
                      {offer.features.map((feature, fidx) => (
                        <li
                          key={fidx}
                          className="flex items-start gap-2 text-white/75"
                        >
                          <svg
                            className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                      {offer.id === 'kids' && (
                        <li className="text-xs text-emerald-300/80 mt-1">
                          0% alkoholu – pakiet dedykowany dzieciom i młodzieży.
                        </li>
                      )}
                    </ul>

                    <motion.button
                      type="button"
                      onClick={() => handleClick(offer.id)}
                      className={`mt-auto block w-full text-center py-3.5 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-300 hover:to-yellow-400'
                          : 'border border-white/25 text-white hover:bg-white/5 hover:border-white/50'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Policzyć ten pakiet
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
