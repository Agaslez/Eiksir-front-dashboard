import { useEffect, useMemo, useState } from 'react';
import { fetchWithRetry } from '../lib/auto-healing'; // Required for Guardian - used in commented code
import { useComponentHealth } from '../lib/component-health-monitor';
import { API } from '../lib/config'; // Required for Guardian - used in commented code
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
    extraBarman: number; // NEW: Required when KEG selected
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

// Dodajemy eksportowany typ
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.config) {
        setConfig(data.config);
      } else {
        throw new Error('Invalid config format');
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch calculator config:", error);
      setConfig(DEFAULT_CONFIG);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Polling co 60s - aktualizuje config z dashboard
    const interval = setInterval(() => {
      fetchConfig();
    }, 60000); // 60 sekund

    return () => clearInterval(interval);
  }, []);

  // Clamp guests when offer changes - ensure within min/max range
  useEffect(() => {
    const offer = OFFERS[selectedOfferId];
    if (guests < offer.minGuests) {
      setGuests(offer.minGuests);
    } else if (guests > offer.maxGuests) {
      setGuests(offer.maxGuests);
    }
  }, [selectedOfferId]);

  // Memoizacja snapshot dla stabilności referencji (MUSI BYĆ PRZED EARLY RETURN!)
  const calculatorSnapshot: CalculatorSnapshot = useMemo(() => {
    if (loading || !config) {
      // Default snapshot gdy ładowanie
      return {
        offerName: OFFERS[selectedOfferId].name,
        guests,
        totalAfterDiscount: 0,
        pricePerGuest: 0,
        estimatedCocktails: 0,
        estimatedShots: 0,
        addons,
      };
    }

    const offer = OFFERS[selectedOfferId];
    const isKidsOffer = offer.id === 'kids';

    // Oblicz fountainCost
    const fountainCost = addons.fountain
      ? (() => {
          const { perGuest, min, max } = config.addons.fountain;
          const value = guests * perGuest;
          return Math.min(max, Math.max(min, value));
        })()
      : 0;

    // KEG + extraBarman
    const kegSelected = !isKidsOffer && addons.keg;
    const kegCost = kegSelected
      ? (() => {
          const { pricePerKeg, guestsPerKeg } = config.addons.keg;
          const kegs = Math.max(1, Math.ceil(guests / guestsPerKeg));
          return pricePerKeg * kegs;
        })()
      : 0;
    const extraBarmanCost = kegSelected ? (config.addons.extraBarman || 0) : 0;

    // Lemonade
    const lemonadeCost = addons.lemonade
      ? (() => {
          const { base, blockGuests } = config.addons.lemonade;
          const blocks = Math.max(1, Math.ceil(guests / blockGuests));
          return base * blocks;
        })()
      : 0;

    const hockeryCost = addons.hockery ? config.addons.hockery : 0;
    const ledLightingCost = addons.ledLighting ? config.addons.ledLighting : 0;

    const addonsPrice = fountainCost + kegCost + extraBarmanCost + lemonadeCost + hockeryCost + ledLightingCost;
    const basePackagePrice = offer.price;
    const totalBeforeDiscount = basePackagePrice + addonsPrice;
    const promoDiscount = config.promoDiscount;
    const totalAfterDiscount = Math.round(totalBeforeDiscount * (1 - promoDiscount));

    const pricePerGuest = Math.round(totalAfterDiscount / guests);
    const estimatedCocktails = guests * 3;
    const estimatedShots = Math.round(guests * 0.5);

    return {
      offerName: offer.name,
      guests,
      totalAfterDiscount,
      pricePerGuest,
      estimatedCocktails,
      estimatedShots,
      addons,
    };
  }, [selectedOfferId, guests, addons, loading, config]);

  // useEffect dla onCalculate callback
  useEffect(() => {
    if (onCalculate) onCalculate(calculatorSnapshot);
  }, [calculatorSnapshot, onCalculate]);

  // 🔥 ABSOLUTNY GUARD — musi być NA SAMEJ GÓRZE, zanim użyjesz config
  if (loading || !config) {
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

  if (
    !config.addons ||
    !config.shoppingList ||
    !config.pricePerExtraGuest
  ) {
    return (
      <Section id="kalkulator" className="bg-black border-t border-white/10">
        <Container>
          <div className="text-center py-20 text-white/70">
            Ładowanie konfiguracji kalkulatora...
          </div>
        </Container>
      </Section>
    );
  }

  // --- OBLICZENIA (bezpieczne, bo guard już zadziałał) ---

  const offer = OFFERS[selectedOfferId];
  const promoDiscount = config.promoDiscount;
  const isKidsOffer = offer.id === 'kids';

  // --- ADD-ONY ZALEŻNE OD LICZBY GOŚCI ---

  const fountainCost = addons.fountain
    ? (() => {
        const { perGuest, min, max } = config.addons.fountain;
        const value = guests * perGuest;
        return Math.min(max, Math.max(min, value));
      })()
    : 0;

  // KEG jest wyłączony dla Kids Party 0%
  const kegSelected = !isKidsOffer && addons.keg;

  const kegCost = kegSelected
    ? (() => {
        const { pricePerKeg, guestsPerKeg } = config.addons.keg;
        const kegs = Math.max(1, Math.ceil(guests / guestsPerKeg));
        return pricePerKeg * kegs;
      })()
    : 0;

  // NEW: Dodatkowy barman (obowiązkowy gdy KEG)
  const extraBarmanCost = kegSelected ? (config.addons.extraBarman || 0) : 0;

  const lemonadeCost = addons.lemonade
    ? (() => {
        const { base, blockGuests } = config.addons.lemonade;
        const blocks = Math.max(1, Math.ceil(guests / blockGuests));
        return base * blocks;
      })()
    : 0;

  const hockeryCost = addons.hockery ? config.addons.hockery : 0;
  const ledLightingCost = addons.ledLighting ? config.addons.ledLighting : 0;

  const addonsPrice =
    fountainCost + kegCost + extraBarmanCost + lemonadeCost + hockeryCost + ledLightingCost;

  // --- CENA PAKIETU (SKALOWANA Z LICZBĄ GOŚCI) ---

  // Cena minimalna pakietu (z lib/content)
  const basePackagePrice = offer.price;

  const totalBeforeDiscount = basePackagePrice + addonsPrice;
  const totalAfterDiscount = Math.round(totalBeforeDiscount * (1 - promoDiscount));

  const pricePerGuest = Math.round(totalAfterDiscount / guests);
  const pricePerHour = Math.round(totalAfterDiscount / offer.hours);

  const estimatedCocktails = Math.round(guests * offer.drinksPerGuest);
  const estimatedShots = isKidsOffer ? 0 : Math.round(guests * (offer.shotsPerGuest ?? 0.5));

  // --- LISTA ZAKUPÓW (SKALOWANA) ---
  const scale50 = guests / 50;

  const vodkaRumGinBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil((config.shoppingList?.vodkaRumGinBottles ?? 0) * scale50));
  const liqueurBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil((config.shoppingList?.liqueurBottles ?? 0) * scale50));
  const aperolBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil((config.shoppingList?.aperolBottles ?? 0) * scale50));
  const proseccoBottles = isKidsOffer
    ? 0
    : Math.max(1, Math.ceil((config.shoppingList?.proseccoBottles ?? 0) * scale50));
  const syrupsLiters = Math.max(1, Math.ceil((config.shoppingList?.syrupsLiters ?? 0) * scale50));
  const iceKg = Math.max(4, Math.ceil((config.shoppingList?.iceKg ?? 0) * scale50));

  // --- UI (TWÓJ ORYGINALNY UI BEZ ZMIAN) ---
  return (
    <Section id="kalkulator" className="bg-black border-t border-white/10">
      <Container>
        <div className="mb-12 text-center">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Szybka wycena & lista zakupów
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-3">
            Wybierz pakiet, liczbę gości i dodatki
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Zobacz orientacyjną cenę oraz bezpieczną listę zakupów. Później
            dopracujemy parametry dokładnie pod Twoje stawki.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* LEWA KOLUMNA – wybór pakietu, gości, dodatków */}
          <div className="bg-neutral-950 border border-white/10 p-6 md:p-8">
            {/* Pakiety */}
            <div className="mb-6">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
                Pakiet
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(OFFERS).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() =>
                      setSelectedOfferId(o.id as keyof typeof OFFERS)
                    }
                    className={`text-left border px-3 py-3 text-xs md:text-sm uppercase tracking-wider ${
                      selectedOfferId === o.id
                        ? 'border-amber-400 bg-amber-400/10 text-amber-200'
                        : 'border-white/20 text-white/70 hover:border-amber-400/60'
                    }`}
                  >
                    <div className="font-semibold">{o.name}</div>
                    <div className="text-[0.7rem] text-white/50">
                      od {o.price.toLocaleString('pl-PL')} zł
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[0.7rem] text-white/40">
                Zakres rekomendowany dla wybranego pakietu:{' '}
                <span className="font-semibold">
                  {offer.minGuests}–{offer.maxGuests} osób
                </span>
                .
              </p>
            </div>

            {/* Liczba gości */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white/60 text-xs uppercase tracking-wider">
                  Liczba gości
                </p>
                <span className="text-white text-sm font-semibold">
                  {guests} osób
                </span>
              </div>
              <input
                type="range"
                min={offer.minGuests}
                max={offer.maxGuests}
                value={guests}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  // ARCHITECT_APPROVED: Debugging guests slider issue - temporary - 2026-01-02 - Stefan
                  console.log('🎯 Guests changed:', guests, '→', newValue);
                  setGuests(newValue);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[0.7rem] text-white/40 mt-1">
                <span>{offer.minGuests}</span>
                <span>{Math.floor((offer.minGuests + offer.maxGuests) / 2)}</span>
                <span>{offer.maxGuests}</span>
              </div>
              {guests < offer.minGuests && (
                <p className="mt-2 text-[0.7rem] text-amber-300">
                  Dla takiej liczby osób obowiązuje nadal{' '}
                  <b>minimalna cena pakietu</b> (
                  {offer.price.toLocaleString('pl-PL')} zł).
                </p>
              )}
            </div>

            {/* Godziny pracy baru */}
            <div className="mb-6">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                Godziny pracy baru
              </p>
              <p className="text-white text-sm">
                {offer.hours} godz. (dla tego pakietu)
              </p>
            </div>

            {/* Dodatki */}
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
                Dodatki
              </p>
              <div className="space-y-2 text-sm text-white/80">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addons.fountain}
                    onChange={(e) =>
                      setAddons((prev) => ({
                        ...prev,
                        fountain: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    Fontanna czekolady{' '}
                    {addons.fountain && (
                      <span className="text-amber-300">
                        (+{fountainCost.toLocaleString('pl-PL')} zł)
                      </span>
                    )}
                  </span>
                </label>

                {/* KEG tylko dla pakietów innych niż Kids */}
                {!isKidsOffer && (
                  <>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addons.keg}
                        onChange={(e) =>
                          setAddons((prev) => ({
                            ...prev,
                            keg: e.target.checked,
                          }))
                        }
                      />
                      <span>
                        KEG piwa 30L (z obsługą – wymaga dodatkowego barmana){' '}
                        {kegSelected && (
                          <span className="text-amber-300">
                            (+{(kegCost + extraBarmanCost).toLocaleString('pl-PL')} zł)
                          </span>
                        )}
                      </span>
                    </label>
                    {kegSelected && extraBarmanCost > 0 && (
                      <p className="text-xs text-amber-300/80 ml-6">
                        w tym: KEG {kegCost.toLocaleString('pl-PL')} zł + dodatkowy barman{' '}
                        {extraBarmanCost.toLocaleString('pl-PL')} zł
                      </p>
                    )}
                  </>
                )}

                {isKidsOffer && (
                  <p className="text-xs text-amber-300">
                    W pakiecie Kids Party 0% nie serwujemy alkoholu – KEG nie
                    jest dostępny.
                  </p>
                )}

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addons.lemonade}
                    onChange={(e) =>
                      setAddons((prev) => ({
                        ...prev,
                        lemonade: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    Dystrybutor lemoniady 2×12L{' '}
                    {addons.lemonade && (
                      <span className="text-amber-300">
                        (+{lemonadeCost.toLocaleString('pl-PL')} zł)
                      </span>
                    )}
                  </span>
                </label>

                {/* Nowe dodatki */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addons.hockery}
                    onChange={(e) =>
                      setAddons((prev) => ({
                        ...prev,
                        hockery: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    Hockery 6 szt. (eleganckie stołki barowe){' '}
                    {addons.hockery && (
                      <span className="text-amber-300">
                        (+{hockeryCost.toLocaleString('pl-PL')} zł)
                      </span>
                    )}
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addons.ledLighting}
                    onChange={(e) =>
                      setAddons((prev) => ({
                        ...prev,
                        ledLighting: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    Oświetlenie LED z personalizacją{' '}
                    {addons.ledLighting && (
                      <span className="text-amber-300">
                        (+{ledLightingCost.toLocaleString('pl-PL')} zł)
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA – podsumowanie + lista zakupów */}
          <div className="bg-neutral-950 border border-amber-400/40 p-6 md:p-8">
            <h3 className="font-playfair text-2xl font-bold text-amber-200 mb-4">
              Podsumowanie wyceny
            </h3>

            <div className="mb-4">
              <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">
                Szacunkowa cena pakietu + dodatki
                {promoDiscount > 0 && ` (z rabatem −${Math.round(promoDiscount * 100)}%)`}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-5xl font-bold text-amber-300">
                  {totalAfterDiscount.toLocaleString('pl-PL')}
                </span>
                <span className="text-white/60 text-sm">PLN brutto*</span>
              </div>
              <p className="text-[0.75rem] text-white/50 mt-1">
                *Kwota orientacyjna – dokładną wycenę potwierdzimy po kontakcie
                i doprecyzowaniu szczegółów.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="text-white/70">
                ok.{' '}
                <span className="font-semibold">
                  {pricePerGuest} zł
                </span>{' '}
                / osobę
              </div>
              <div className="text-white/70">
                ok.{' '}
                <span className="font-semibold">
                  {pricePerHour} zł
                </span>{' '}
                / godzinę baru
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 text-sm text-white/80 space-y-3">
              <p className="font-semibold uppercase text-xs tracking-wider text-white/60">
                Szacowana liczba serwowanych pozycji
              </p>
              <p>
                • Koktajle: ok.{' '}
                <span className="font-semibold">
                  {estimatedCocktails} porcji
                </span>
              </p>
              {!isKidsOffer && (
                <p>
                  • Shoty: ok.{' '}
                  <span className="font-semibold">{estimatedShots} porcji</span>
                </p>
              )}
              <p className="text-[0.75rem] text-white/50">
                Założenie kalkulacji: {offer.drinksPerGuest} {isKidsOffer ? 'mocktaila' : 'koktajlu'} / osobę
                {!isKidsOffer && `
                oraz ${offer.shotsPerGuest ?? 0.5} shota / osobę`} (dla tego
                pakietu).
              </p>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 text-sm text-white/80 space-y-4">
              {/* SEKCJA 1: Po stronie ELIKSIR (stałe copy, bez cen) */}
              <div>
                <p className="font-semibold uppercase text-xs tracking-wider text-amber-300 mb-2">
                  Po stronie ELIKSIR (w cenie pakietu)
                </p>
                <ul className="space-y-1 text-xs text-white/70">
                  <li>• soki i miksery</li>
                  <li>• syropy / puree</li>
                  <li>• likiery barmańskie (triple sec / blue curaçao / aperol)</li>
                  <li>• owoce i zioła</li>
                  <li>• lód kostkowany i kruszony</li>
                  <li>• dodatki barowe + logistyka + sprzęt</li>
                </ul>
              </div>

              {/* SEKCJA 2: Po stronie Gości (wyliczenia) */}
              <div className="border-t border-white/20 pt-3">
                <p className="font-semibold uppercase text-xs tracking-wider text-white/60 mb-2">
                  Po stronie Gości – alkohol mocny (orientacyjnie)
                </p>

                {isKidsOffer ? (
                  <p className="text-amber-300 text-xs">
                    • Brak alkoholu – pakiet Kids Party 0% to wyłącznie napoje bezalkoholowe.
                  </p>
                ) : (
                  <div className="space-y-1 text-xs">
                    <p>
                      • Wódka / rum / gin:{' '}
                      <span className="font-semibold">ok. {vodkaRumGinBottles}× 0,7 L</span>
                    </p>
                    <p>
                      • Likier (brzoskwinia / inne):{' '}
                      <span className="font-semibold">ok. {liqueurBottles}× 0,7 L</span>
                    </p>
                    <p>
                      • Aperol:{' '}
                      <span className="font-semibold">ok. {aperolBottles}× 0,7 L</span>
                    </p>
                    <p>
                      • Prosecco:{' '}
                      <span className="font-semibold">ok. {proseccoBottles}× 0,75 L</span>
                    </p>
                  </div>
                )}

                <p className="text-[0.7rem] text-amber-300/80 mt-2 italic">
                  ⚠️ Ilości są orientacyjne i dotyczą spożycia przy barze.<br />
                  Nie obejmują alkoholu serwowanego na stołach.
                </p>
              </div>

              {/* OPEN BAR / ALL-IN Info Box */}
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-3 mt-3">
                <p className="text-xs font-semibold text-amber-300 mb-1">
                  💡 OPEN BAR / ALL-IN
                </p>
                <p className="text-[0.7rem] text-white/70">
                  ELIKSIR może zająć się zakupem, logistyką i zabezpieczeniem alkoholu.
                  Opcja dostępna za dopłatą i po indywidualnych ustaleniach.
                </p>
              </div>

              {/* Dopiski operacyjne */}
              <div className="text-[0.65rem] text-white/50 space-y-1 mt-3 border-t border-white/10 pt-3">
                <p>• Barman obsługuje wyłącznie strefę baru (brak obsługi stołów).</p>
                <p>• Szkło zbierane – brak serwisu kelnerskiego.</p>
                <p>• Alkohol premium (np. whisky/tequila) – wycena indywidualna.</p>
                <p>• Przedłużenie: +400–500 zł / godz. / barman (wg ustaleń).</p>
                <p>• Powyżej 80 gości może być wymagany dodatkowy barman (wg ustaleń).</p>
              </div>

              <p className="text-[0.75rem] text-white/50 mt-2">
                Po wysłaniu formularza kontaktowego możemy przesłać Ci tę listę
                w formie PDF – gotową do wydruku lub wysłania do hurtowni.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default Calculator;