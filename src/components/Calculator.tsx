import { useState } from "react";
import { OFFERS } from "../lib/content";

function Calculator() {
  const [selectedOfferId, setSelectedOfferId] =
    useState<keyof typeof OFFERS>("family"); // start np. od Family & Seniors
  const [guests, setGuests] = useState(50);
  const [addons, setAddons] = useState({
    fountain: false,
    keg: false,
    lemonade: false,
  });

  const offer = OFFERS[selectedOfferId];
  const promoDiscount = 0.2; // -20%

  // --- ADD-ONY ZALEŻNE OD LICZBY GOŚCI ---

  const fountainCost = addons.fountain
    ? (() => {
        const perGuest = 10;
        const min = 600;
        const max = 1200;
        const value = guests * perGuest;
        return Math.min(max, Math.max(min, value));
      })()
    : 0;

  const kegCost = addons.keg
    ? (() => {
        const pricePerKeg = 550;
        const guestsPerKeg = 50;
        const kegs = Math.max(1, Math.ceil(guests / guestsPerKeg));
        return pricePerKeg * kegs;
      })()
    : 0;

  const lemonadeCost = addons.lemonade
    ? (() => {
        const base = 250;
        const blockGuests = 60;
        const blocks = Math.max(1, Math.ceil(guests / blockGuests));
        return base * blocks;
      })()
    : 0;

  const addonsPrice = fountainCost + kegCost + lemonadeCost;

  // --- CENA PAKIETU ---

  // minimalna cena = offer.price (nie spada poniżej)
  const baseServicePrice = offer.price;

  // rabat -20% na całość
  const totalBeforeDiscount = baseServicePrice + addonsPrice;
  const totalAfterDiscount = Math.round(
    totalBeforeDiscount * (1 - promoDiscount)
  );

  const pricePerGuest = guests
    ? Math.round((totalAfterDiscount / guests) * 100) / 100
    : 0;

  const pricePerHour = offer.hours
    ? Math.round((totalAfterDiscount / offer.hours) * 100) / 100
    : 0;

  // --- SZACOWANA LICZBA PORCJI ---

  const estimatedCocktails = Math.round(guests * offer.drinksPerGuest);
  const estimatedShots = Math.round(
    guests * (offer.shotsPerGuest ?? 0.5)
  );

  // --- LISTA ZAKUPÓW (skalowana z wzorca dla 50 osób) ---

  const scale50 = guests / 50;

  const vodkaRumGinBottles = Math.max(1, Math.ceil(5 * scale50)); // 5 but. 0.7L dla 50 os.
  const liqueurBottles = Math.max(1, Math.ceil(2 * scale50));
  const aperolBottles = Math.max(1, Math.ceil(2 * scale50));
  const proseccoBottles = Math.max(1, Math.ceil(5 * scale50));
  const syrupsLiters = Math.max(1, Math.ceil(12 * scale50));
  const iceKg = Math.max(4, Math.ceil(8 * scale50));

  return (
    <section
      id="kalkulator"
      className="bg-black py-24 border-t border-white/10"
    >
      <div className="max-w-6xl mx-auto px-6">
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
                        ? "border-amber-400 bg-amber-400/10 text-amber-200"
                        : "border-white/20 text-white/70 hover:border-amber-400/60"
                    }`}
                  >
                    <div className="font-semibold">{o.name}</div>
                    <div className="text-[0.7rem] text-white/50">
                      od {o.price.toLocaleString("pl-PL")} zł
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[0.7rem] text-white/40">
                Zakres rekomendowany dla wybranego pakietu:{" "}
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
                min={20}
                max={150}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[0.7rem] text-white/40 mt-1">
                <span>20</span>
                <span>80</span>
                <span>150</span>
              </div>
              {guests < offer.minGuests && (
                <p className="mt-2 text-[0.7rem] text-amber-300">
                  Dla takiej liczby osób obowiązuje nadal{" "}
                  <b>minimalna cena pakietu</b> (
                  {offer.price.toLocaleString("pl-PL")} zł).
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
                    Fontanna czekolady{" "}
                    {addons.fountain && (
                      <span className="text-amber-300">
                        (+{fountainCost.toLocaleString("pl-PL")} zł)
                      </span>
                    )}
                  </span>
                </label>

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
                    KEG piwa 30L z podajnikiem{" "}
                    {addons.keg && (
                      <span className="text-amber-300">
                        (+{kegCost.toLocaleString("pl-PL")} zł)
                      </span>
                    )}
                  </span>
                </label>

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
                    Dystrybutor lemoniady 2×8L{" "}
                    {addons.lemonade && (
                      <span className="text-amber-300">
                        (+{lemonadeCost.toLocaleString("pl-PL")} zł)
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
                Szacunkowa cena pakietu + dodatki (z rabatem −20%)
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-5xl font-bold text-amber-300">
                  {totalAfterDiscount.toLocaleString("pl-PL")}
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
                ok.{" "}
                <span className="font-semibold">
                  {pricePerGuest.toFixed(2)} zł
                </span>{" "}
                / osobę
              </div>
              <div className="text-white/70">
                ok.{" "}
                <span className="font-semibold">
                  {pricePerHour.toFixed(2)} zł
                </span>{" "}
                / godzinę baru
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 text-sm text-white/80 space-y-3">
              <p className="font-semibold uppercase text-xs tracking-wider text-white/60">
                Szacowana liczba serwowanych pozycji
              </p>
              <p>
                • Koktajle: ok.{" "}
                <span className="font-semibold">
                  {estimatedCocktails} porcji
                </span>
              </p>
              <p>
                • Shoty: ok.{" "}
                <span className="font-semibold">
                  {estimatedShots} porcji
                </span>
              </p>
              <p className="text-[0.75rem] text-white/50">
                Założenie kalkulacji: {offer.drinksPerGuest} koktajlu / osobę
                oraz {offer.shotsPerGuest ?? 0.5} shota / osobę (dla tego
                pakietu).
              </p>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 text-sm text-white/80 space-y-2">
              <p className="font-semibold uppercase text-xs tracking-wider text-white/60">
                Lista zakupów (alkohol + dodatki) – orientacyjnie
              </p>
              <p>
                • Wódka / rum / gin:{" "}
                <span className="font-semibold">
                  ok. {vodkaRumGinBottles}× 0,7 L
                </span>
              </p>
              <p>
                • Likier (brzoskwinia / inne):{" "}
                <span className="font-semibold">
                  ok. {liqueurBottles}× 0,7 L
                </span>
              </p>
              <p>
                • Aperol:{" "}
                <span className="font-semibold">
                  ok. {aperolBottles}× 0,7 L
                </span>
              </p>
              <p>
                • Prosecco:{" "}
                <span className="font-semibold">
                  ok. {proseccoBottles}× 0,75 L
                </span>
              </p>
              <p>
                • Soki / miksery / syropy:{" "}
                <span className="font-semibold">
                  ok. {syrupsLiters} L łącznie
                </span>
              </p>
              <p>
                • Lód kostkowany / kruszony:{" "}
                <span className="font-semibold">
                  ok. {iceKg} kg
                </span>
              </p>
              <p className="text-[0.75rem] text-white/50 mt-2">
                Po wysłaniu formularza kontaktowego możemy przesłać Ci tę listę
                w formie PDF – gotową do wydruku lub wysłania do hurtowni.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Calculator;
