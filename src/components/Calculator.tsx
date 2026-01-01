import { API } from '@/lib/config';
import { useEffect, useMemo, useState } from 'react';
import { fetchWithRetry } from '../lib/auto-healing';
import { useComponentHealth } from '../lib/component-health-monitor';
import { OFFERS } from '../lib/content';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

interface CalculatorConfig {
  promoDiscount: number;
  pricePerExtraGuest: {
    basic: number;
    premium: number;
    exclusive: number;
    kids: number;
    family: number;
    business: number;
  };
  addons: {
    fountain: { perGuest: number; min: number; max: number };
    keg: { pricePerKeg: number; guestsPerKeg: number };
    extraBarman: number;
    lemonade: { base: number; blockGuests: number };
    hockery: number;
    ledLighting: number;
  };
  shoppingList: {
    vodkaRumGinBottles: number;
    liqueurBottles: number;
    aperolBottles: number;
    proseccoBottles: number;
    syrupsLiters: number;
    iceKg: number;
  };
}

export type CalculatorSnapshot = {
  offerName: string;
  guests: number;
  totalAfterDiscount: number;
  pricePerGuest: number;
  estimatedCocktails: number;
  estimatedShots: number;
  addons: {
    fountain: boolean;
    keg: boolean;
    lemonade: boolean;
    hockery: boolean;
    ledLighting: boolean;
  };
};

type CalculatorProps = {
  onCalculate?: (snapshot: CalculatorSnapshot) => void;
};

function Calculator({ onCalculate }: CalculatorProps) {
  useComponentHealth('Calculator');

  const [selectedOfferId, setSelectedOfferId] =
    useState<keyof typeof OFFERS>('family');
  const [guests, setGuests] = useState(50);
  const [addons, setAddons] = useState({
    fountain: false,
    keg: false,
    lemonade: false,
    hockery: false,
    ledLighting: false,
  });
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_CONFIG: CalculatorConfig = {
    promoDiscount: 0,
    pricePerExtraGuest: {
      basic: 40,
      premium: 50,
      exclusive: 60,
      kids: 30,
      family: 35,
      business: 60,
    },
    addons: {
      fountain: { perGuest: 10, min: 600, max: 1200 },
      keg: { pricePerKeg: 500, guestsPerKeg: 50 },
      extraBarman: 400,
      lemonade: { base: 300, blockGuests: 60 },
      hockery: 200,
      ledLighting: 500,
    },
    shoppingList: {
      vodkaRumGinBottles: 5,
      liqueurBottles: 2,
      aperolBottles: 2,
      proseccoBottles: 5,
      syrupsLiters: 12,
      iceKg: 8,
    },
  };

  const fetchConfig = async () => {
    try {
      const response = await fetchWithRetry(
        API.calculatorConfig,
        undefined,
        { maxRetries: 2 }
      );

      const raw = await response.text();

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("Invalid JSON from /config:", raw);
        setConfig(DEFAULT_CONFIG);
        setLoading(false);
        return;
      }

      if (!data || !data.config) {
        console.warn("Missing config in API response");
        setConfig(DEFAULT_CONFIG);
        setLoading(false);
        return;
      }

      setConfig(data.config);

    } catch (error) {
      console.error("Failed to fetch calculator config:", error);
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const offer = OFFERS[selectedOfferId];
    if (guests < offer.minGuests) setGuests(offer.minGuests);
    if (guests > offer.maxGuests) setGuests(offer.maxGuests);
  }, [selectedOfferId]);

  // 🔥 USE EFFECTIVE CONFIG (fallback to defaults) — NO CONDITIONAL RETURNS BEFORE HOOKS
  const effectiveConfig = config ?? DEFAULT_CONFIG;

  // --- OBLICZENIA (używamy effectiveConfig zamiast config) ---

  const offer = OFFERS[selectedOfferId];
  const promoDiscount = effectiveConfig.promoDiscount;
  const isKidsOffer = offer.id === 'kids';

  const fountainCost = addons.fountain
    ? (() => {
        const { perGuest, min, max } = effectiveConfig.addons.fountain;
        const value = guests * perGuest;
        return Math.min(max, Math.max(min, value));
      })()
    : 0;

  const kegSelected = !isKidsOffer && addons.keg;

  const kegCost = kegSelected
    ? (() => {
        const { pricePerKeg, guestsPerKeg } = effectiveConfig.addons.keg;
        const kegs = Math.max(1, Math.ceil(guests / guestsPerKeg));
        return pricePerKeg * kegs;
      })()
    : 0;

  const extraBarmanCost = kegSelected ? (effectiveConfig.addons.extraBarman || 0) : 0;

  const lemonadeCost = addons.lemonade
    ? (() => {
        const { base, blockGuests } = effectiveConfig.addons.lemonade;
        const blocks = Math.max(1, Math.ceil(guests / blockGuests));
        return base * blocks;
      })()
    : 0;

  const hockeryCost = addons.hockery ? effectiveConfig.addons.hockery : 0;
  const ledLightingCost = addons.ledLighting ? effectiveConfig.addons.ledLighting : 0;

  const addonsPrice =
    fountainCost + kegCost + extraBarmanCost + lemonadeCost + hockeryCost + ledLightingCost;

  const basePackagePrice = offer.price;

  const totalBeforeDiscount = basePackagePrice + addonsPrice;
  const totalAfterDiscount = Math.round(totalBeforeDiscount * (1 - promoDiscount));

  const pricePerGuest = totalAfterDiscount / guests;
  const pricePerHour = totalAfterDiscount / offer.hours;

  const estimatedCocktails = Math.round(guests * offer.drinksPerGuest);
  const estimatedShots = isKidsOffer ? 0 : Math.round(guests * (offer.shotsPerGuest ?? 0.5));

  const scale50 = guests / 50;

  const vodkaRumGinBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil(effectiveConfig.shoppingList.vodkaRumGinBottles * scale50));
  const liqueurBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil(effectiveConfig.shoppingList.liqueurBottles * scale50));
  const aperolBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil(effectiveConfig.shoppingList.aperolBottles * scale50));
  const proseccoBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil(effectiveConfig.shoppingList.proseccoBottles * scale50));
  const syrupsLiters = Math.max(1, Math.ceil(effectiveConfig.shoppingList.syrupsLiters * scale50));
  const iceKg = Math.max(4, Math.ceil(effectiveConfig.shoppingList.iceKg * scale50));

  const calculatorSnapshot: CalculatorSnapshot = useMemo(() => ({
    offerName: OFFERS[selectedOfferId].name,
    guests,
    totalAfterDiscount,
    pricePerGuest,
    estimatedCocktails,
    estimatedShots,
    addons,
  }), [selectedOfferId, guests, totalAfterDiscount, pricePerGuest, estimatedCocktails, estimatedShots, addons]);

  useEffect(() => {
    if (onCalculate) onCalculate(calculatorSnapshot);
  }, [calculatorSnapshot, onCalculate]);

  // --- LOADER W JSX (zamiast warunkowych returnów) ---
  if (loading) {
    return (
      <Section id="kalkulator" className="bg-black border-t border-white/10">
        <Container>
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
            <p className="text-white/60 mt-4">Ładowanie kalkulatora...</p>
          </div>
        </Container>
      </Section>
    );
  }

  // --- UI ---
  return (
    <Section id="kalkulator" className="bg-black border-t border-white/10">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Kalkulator kosztów</h2>
            <p className="text-white/60">Sprawdź szacunkowy koszt imprezy</p>
          </div>

          <div className="bg-neutral-900 rounded-xl p-8 border border-white/10">
            {/* Package Selection */}
            <div className="mb-8">
              <label className="block text-white mb-4 font-semibold">Wybierz pakiet:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(OFFERS).map(([key, offer]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedOfferId(key as keyof typeof OFFERS)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedOfferId === key
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-white font-semibold mb-1">{offer.name}</div>
                    <div className="text-amber-400 text-sm">{offer.price.toLocaleString('pl-PL')} PLN</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="mb-8">
              <label className="block text-white mb-4 font-semibold">
                Liczba gości: <span className="text-amber-400">{guests}</span>
              </label>
              <input
                type="range"
                min={offer.minGuests}
                max={offer.maxGuests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-white/40 text-sm mt-2">
                <span>{offer.minGuests}</span>
                <span>{offer.maxGuests}</span>
              </div>
            </div>

            {/* Addons */}
            <div className="mb-8">
              <label className="block text-white mb-4 font-semibold">Dodatki:</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addons.fountain}
                    onChange={(e) => setAddons({ ...addons, fountain: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Fontanna alkoholowa ({fountainCost} PLN)</span>
                </label>
                {!isKidsOffer && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.keg}
                      onChange={(e) => setAddons({ ...addons, keg: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-white">Beczka piwa ({kegCost} PLN)</span>
                  </label>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addons.lemonade}
                    onChange={(e) => setAddons({ ...addons, lemonade: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Lemoniada ({lemonadeCost} PLN)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addons.hockery}
                    onChange={(e) => setAddons({ ...addons, hockery: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Hokery ({hockeryCost} PLN)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addons.ledLighting}
                    onChange={(e) => setAddons({ ...addons, ledLighting: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Oświetlenie LED ({ledLightingCost} PLN)</span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-black/50 rounded-lg p-6 border border-amber-400/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/60">Koszt całkowity:</span>
                <span className="text-3xl font-bold text-amber-400">
                  {totalAfterDiscount.toLocaleString('pl-PL')} PLN
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Cena za osobę:</span>
                <span className="text-white">
                  {Math.round(pricePerGuest).toLocaleString('pl-PL')} PLN
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-white/60">Szacowana liczba drinków:</span>
                <span className="text-white">{estimatedCocktails}</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default Calculator;
