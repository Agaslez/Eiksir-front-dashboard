import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";
import { COCKTAILS, GALLERY_IMAGES, OFFERS } from "./lib/content";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

function LogoSVG() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block mr-3"
    >
      {/* Cocktail glass */}
      <path
        d="M35 50L85 50L60 110L35 50Z"
        stroke="#D4AF37"
        strokeWidth="3"
        fill="none"
      />
      {/* Liquid wave */}
      <path
        d="M40 75Q50 70 60 75T80 75"
        stroke="#D4AF37"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      {/* Cherry */}
      <circle cx="65" cy="30" r="8" fill="#DC2626" />
      {/* Stem */}
      <path
        d="M65 30Q70 20 70 10"
        stroke="#000"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 50);
    });
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/90 backdrop-blur-xl py-4" : "bg-transparent py-6"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <a href="#" className="group flex items-center">
            <LogoSVG />
            <span className="font-playfair text-3xl font-bold tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              ELIKSIR
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {["Menu", "Oferta", "Galeria", "Kontakt"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white/70 hover:text-amber-300 transition-colors text-sm uppercase tracking-widest font-medium"
              >
                {item}
              </a>
            ))}
            <motion.a
              href="#kontakt"
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold text-sm uppercase tracking-wider rounded-none hover:from-amber-300 hover:to-yellow-400 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Rezerwuj
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto px-6"
        style={{ opacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <p className="text-amber-300/80 uppercase tracking-[0.4em] text-sm mb-8 font-medium">
            Mobilny Bar Koktajlowy
          </p>

          <h1 className="font-playfair text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-none">
            <span className="bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent">
              ELIKSIR
            </span>
          </h1>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8" />

          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Tworzymy wyjątkowe doświadczenia koktajlowe.
            <span className="text-white/80">
              {" "}
              Wesela, eventy, imprezy prywatne
            </span>{" "}
            — obsłużymy każdą okazję z niezrównaną klasą.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.a
              href="#kontakt"
              className="group relative px-10 py-5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold uppercase tracking-widest text-sm overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Otrzymaj wycenę</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.a>

            <motion.a
              href="#menu"
              className="px-10 py-5 border border-white/30 text-white font-medium uppercase tracking-widest text-sm hover:bg-white/10 hover:border-white/50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Odkryj menu
            </motion.a>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="w-px h-16 bg-gradient-to-b from-amber-400/50 to-transparent" />
      </motion.div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "500+", label: "Obsłużonych imprez" },
    { value: "50k+", label: "Zadowolonych gości" },
    { value: "6+", label: "Lat doświadczenia" },
    { value: "100%", label: "Satysfakcji" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black to-neutral-950">
      <div className="container mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="text-center"
              variants={fadeInUp}
            >
              <div className="font-playfair text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-white/50 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Menu() {
  const alcoholic = COCKTAILS.filter((c) => c.category === "alcoholic");
  const nonAlcoholic = COCKTAILS.filter((c) => c.category === "non-alcoholic");
  const shots = COCKTAILS.filter((c) => c.category === "shot");

  const categories = [
    {
      title: "Koktajle Signature",
      subtitle: "Klasyka w perfekcyjnym wykonaniu",
      items: alcoholic,
      accent: "from-amber-400 to-yellow-500",
    },
    {
      title: "Bezalkoholowe",
      subtitle: "Dla każdego gościa",
      items: nonAlcoholic,
      accent: "from-emerald-400 to-teal-500",
    },
    {
      title: "Shot Bar",
      subtitle: "Energia imprezy",
      items: shots,
      accent: "from-rose-400 to-pink-500",
    },
  ];

  return (
    <section id="menu" className="py-32 bg-neutral-950 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Nasza karta
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Menu Koktajli
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 hover:border-amber-400/30 transition-all duration-500"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
            >
              {/* Card header */}
              <div className={`h-1 bg-gradient-to-r ${category.accent}`} />

              <div className="p-8">
                <h3 className="font-playfair text-2xl font-bold text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-white/40 text-sm mb-8">
                  {category.subtitle}
                </p>

                <div className="space-y-6">
                  {category.items.map((cocktail, cidx) => (
                    <div key={cidx} className="group/item">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-white font-medium group-hover/item:text-amber-300 transition-colors">
                          {cocktail.name}
                        </h4>
                        <div className="flex-1 mx-3 border-b border-dotted border-white/10" />
                      </div>
                      <p className="text-white/40 text-sm leading-relaxed">
                        {cocktail.ingredients}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-white/40 mt-12 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Menu dostosowujemy do Twoich preferencji i charakteru imprezy
        </motion.p>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="oferta" className="py-32 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Pakiety
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Wybierz swój pakiet
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.values(OFFERS).map((offer, idx) => (
            <motion.div
              key={offer.id}
              className={`relative group ${
                offer.popular ? "lg:-mt-4 lg:mb-4" : ""
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              {offer.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold uppercase tracking-wider">
                    Najpopularniejszy
                  </span>
                </div>
              )}

              <div
                className={`h-full bg-gradient-to-b from-neutral-900 to-neutral-950 border transition-all duration-500 ${
                  offer.popular
                    ? "border-amber-400/50 shadow-2xl shadow-amber-500/10"
                    : "border-white/5 hover:border-white/20"
                }`}
              >
                <div className="p-8 md:p-10">
                  <h3 className="font-playfair text-2xl font-bold text-white mb-3">
                    {offer.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-6">
                    {offer.description}
                  </p>

                  <div className="mb-8">
                    <span className="font-playfair text-5xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                      {offer.price.toLocaleString("pl-PL")}
                    </span>
                    <span className="text-white/40 ml-2">PLN</span>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {offer.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
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
                        <span className="text-white/70 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <motion.a
                    href="#kontakt"
                    className={`block w-full text-center py-4 font-semibold uppercase tracking-wider text-sm transition-all ${
                      offer.popular
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-300 hover:to-yellow-400"
                        : "border border-white/20 text-white hover:bg-white/5 hover:border-white/40"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Zamów wycenę
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* === CALCULATOR – NOWA SEKCJA === */
function Calculator() {
  const offersArray = Object.values(OFFERS);

  // 👉 TUTAJ BĘDĄ TWOJE „PRAWDZIWE” ZAŁOŻENIA BIZNESOWE
  const DEFAULT_BASE_GUESTS = 60;          // referencyjna liczba gości
  const DEFAULT_BASE_HOURS = 6;            // referencyjna liczba godzin
  const DEFAULT_DRINKS_PER_PERSON = 4;     // ile koktajli na osobę
  const DEFAULT_SHOTS_PER_PERSON_BASIC = 0.5;
  const DEFAULT_SHOTS_PER_PERSON_PREMIUM = 1.5;

  const [selectedOfferId, setSelectedOfferId] = useState(
    offersArray[0]?.id,
  );
  const [guests, setGuests] = useState(60);
  const [hours, setHours] = useState(6);
  const [extras, setExtras] = useState<string[]>([]);

  const EXTRAS = [
    { id: "choco_fountain", label: "Fontanna czekolady", price: 600 },
    { id: "beer_keg", label: "KEG piwa 30L z podajnikiem", price: 550 },
    { id: "lemonade_dispenser", label: "Dystrybutor lemoniady 2×8L", price: 250 },
  ];

  const selectedOffer =
    offersArray.find((o) => o.id === selectedOfferId) ?? offersArray[0];

  // --- OBLICZENIA CENY ---
  const baseGuests = DEFAULT_BASE_GUESTS;
  const baseHours = DEFAULT_BASE_HOURS;

  const hoursFactor = hours / baseHours;
  const guestsFactor = guests / baseGuests;

  const packageBasePrice = selectedOffer?.price ?? 0;
  const packagePrice = packageBasePrice * guestsFactor * hoursFactor;

  const extrasTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce(
    (sum, e) => sum + e.price,
    0,
  );

  const totalPrice = Math.round(packagePrice + extrasTotal);
  const pricePerGuest = guests > 0 ? Math.round(totalPrice / guests) : 0;
  const pricePerHour = hours > 0 ? Math.round(totalPrice / hours) : 0;

  // --- ILOŚĆ PORCJI / LISTA ZAKUPÓW ---
  const drinksPerPerson = DEFAULT_DRINKS_PER_PERSON;
  const shotsPerPerson =
    selectedOffer?.id === "premium" || selectedOffer?.id === "exclusive"
      ? DEFAULT_SHOTS_PER_PERSON_PREMIUM
      : DEFAULT_SHOTS_PER_PERSON_BASIC;

  const totalDrinks = Math.ceil(guests * drinksPerPerson);
  const totalShots = Math.ceil(guests * shotsPerPerson);

  // Założenie: z 0.7L ~12 drinków
  const bottlesSpirit = Math.ceil((totalDrinks * 0.7) / 12);
  const litersMixers = Math.ceil(totalDrinks * 0.15);
  const iceKg = Math.ceil(totalDrinks * 0.1);

  return (
    <section
      id="kalkulator"
      className="py-32 bg-gradient-to-b from-neutral-950 to-black"
    >
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Kalkulator
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Szybka wycena &amp; lista zakupów
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          <p className="mt-4 text-sm text-white/60 max-w-2xl mx-auto">
            Wybierz pakiet, liczbę gości i dodatki – zobacz orientacyjną cenę oraz
            bezpieczną listę zakupów. Później dopracujemy parametry dokładnie
            pod Twoje stawki.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* FORMULARZ */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 p-8 md:p-10">
            {/* Pakiet */}
            <div className="mb-8">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                Pakiet
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {offersArray.map((offer) => (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => setSelectedOfferId(offer.id)}
                    className={`text-left border px-4 py-3 text-sm transition-all ${
                      selectedOfferId === offer.id
                        ? "border-amber-400 bg-amber-400/10 text-white"
                        : "border-white/15 text-white/70 hover:border-white/40"
                    }`}
                  >
                    <div className="font-semibold">{offer.name}</div>
                    <div className="text-xs text-white/50">
                      od {offer.price.toLocaleString("pl-PL")} zł
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Liczba gości */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  Liczba gości
                </p>
                <span className="text-white text-sm font-medium">
                  {guests} osób
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={150}
                step={5}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-[0.7rem] text-white/40 mt-1">
                <span>20</span>
                <span>80</span>
                <span>150</span>
              </div>
            </div>

            {/* Godziny */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  Godziny pracy baru
                </p>
                <span className="text-white text-sm font-medium">
                  {hours} h
                </span>
              </div>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-white/20 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-400"
              >
                <option value={4}>4 godziny</option>
                <option value={6}>6 godzin</option>
                <option value={8}>8 godzin</option>
              </select>
            </div>

            {/* Dodatki */}
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                Dodatki
              </p>
              <div className="space-y-3">
                {EXTRAS.map((extra) => {
                  const checked = extras.includes(extra.id);
                  return (
                    <label
                      key={extra.id}
                      className="flex items-center justify-between gap-3 text-sm cursor-pointer"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setExtras((prev) =>
                              checked
                                ? prev.filter((id) => id !== extra.id)
                                : [...prev, extra.id],
                            );
                          }}
                          className="accent-amber-400"
                        />
                        <span className="text-white/80">{extra.label}</span>
                      </span>
                      <span className="text-white/50 text-xs">
                        + {extra.price.toLocaleString("pl-PL")} zł
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PODSUMOWANIE */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-400/40 p-8 md:p-10">
            <h3 className="font-playfair text-2xl font-bold text-white mb-6">
              Podsumowanie wyceny
            </h3>

            <div className="mb-6">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Szacunkowa cena pakietu + dodatki
              </p>
              <div className="flex flex-wrap items-baseline gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-playfair text-5xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    {totalPrice.toLocaleString("pl-PL")}
                  </span>
                  <span className="text-white/50 text-sm">PLN brutto*</span>
                </div>
                <div className="flex flex-col text-xs text-white/60 gap-1">
                  <span>ok. {pricePerGuest.toLocaleString("pl-PL")} zł / osobę</span>
                  <span>ok. {pricePerHour.toLocaleString("pl-PL")} zł / godzinę baru</span>
                </div>
              </div>
              <p className="text-white/40 text-xs mt-2">
                *Kwota orientacyjna – dokładną wycenę potwierdzimy po kontakcie
                i doprecyzowaniu szczegółów.
              </p>
            </div>

            <div className="mb-6 border-t border-white/10 pt-6">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
                Szacowana liczba serwowanych pozycji
              </p>
              <ul className="space-y-1 text-sm text-white/80">
                <li>• Koktajle: ok. {totalDrinks} porcji</li>
                <li>• Shoty: ok. {totalShots} porcji</li>
              </ul>
              <p className="text-white/40 text-xs mt-2">
                Założenie kalkulacji: {drinksPerPerson} koktajle / osobę,
                {` `}
                {shotsPerPerson.toString().replace(".", ",")} shotu / osobę
                (dla tego pakietu).
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
                Lista zakupów (alkohol &amp; dodatki)
              </p>
              <ul className="space-y-1 text-sm text-white/80">
                <li>• Wódka / rum / gin: ok. {bottlesSpirit} × 0,7 L</li>
                <li>• Soki / mixery / syropy: ok. {litersMixers} L łącznie</li>
                <li>• Lód kostkowany / kruszony: ok. {iceKg} kg</li>
                {extras.includes("beer_keg") && (
                  <li>• KEG piwa 30 L + sprzęt do nalewania</li>
                )}
                {extras.includes("choco_fountain") && (
                  <li>• Czekolada kuwertura + owoce / przekąski do fontanny</li>
                )}
                {extras.includes("lemonade_dispenser") && (
                  <li>• Woda, cytrusy, mięta, cukier / syrop do lemoniady</li>
                )}
              </ul>
            </div>

            <p className="mt-6 text-white/40 text-xs">
              Po wysłaniu formularza kontaktowego możemy przesłać Ci tę listę
              w formie PDF – gotową do wydruku lub wysłania do hurtowni.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
/* === KONIEC KALKULATORA === */

function Gallery() {
  return (
    <section id="galeria" className="py-32 bg-neutral-950">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Portfolio
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Nasze realizacje
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY_IMAGES.map((src, idx) => (
            <motion.div
              key={idx}
              className={`relative overflow-hidden group ${
                idx === 0 || idx === 3 ? "md:row-span-2" : ""
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                className={`${
                  idx === 0 || idx === 3 ? "aspect-[3/4]" : "aspect-square"
                }`}
              >
                <img
                  src={src}
                  alt={`Realizacja ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      text: "ELIKSIR uświetnił nasze wesele! Goście do dziś wspominają niesamowite koktajle i profesjonalną obsługę. Polecamy z całego serca!",
      author: "Anna i Piotr",
      event: "Wesele, Łódź",
    },
    {
      text: "Współpraca na najwyższym poziomie. Bar LED zrobił niesamowite wrażenie, a barman świetnie bawił gości pokazami flair.",
      author: "Marta K.",
      event: "Urodziny 30",
    },
    {
      text: "Profesjonalizm i elastyczność - dokładnie to czego szukaliśmy dla naszego eventu firmowego. Na pewno wrócimy!",
      author: "Tomasz W.",
      event: "Event korporacyjny",
    },
  ];

  return (
    <section className="py-32 bg-black">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Opinie
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Co mówią klienci
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className="text-amber-400 text-4xl font-serif mb-4">"</div>
              <p className="text-white/70 leading-relaxed mb-6 italic">
                {item.text}
              </p>
              <div>
                <p className="text-white font-medium">{item.author}</p>
                <p className="text-white/40 text-sm">{item.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:kontakt@stefanogroup.club?subject=Zapytanie ELIKSIR - ${formData.name}&body=Imię: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0ATelefon: ${formData.phone}%0D%0AData imprezy: ${formData.date}%0D%0ALiczba gości: ${formData.guests}%0D%0A%0D%0AWiadomość:%0D%0A${formData.message}`;
    window.location.href = mailtoLink;
  };

  return (
    <section
      id="kontakt"
      className="py-32 bg-neutral-950 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Kontakt
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Zamów wycenę
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-playfair text-3xl font-bold text-white mb-8">
              Porozmawiajmy o Twojej imprezie
            </h3>

            <p className="text-white/60 leading-relaxed mb-10">
              Każde wydarzenie jest wyjątkowe. Opowiedz nam o swoich planach,
              a przygotujemy spersonalizowaną ofertę dopasowaną do Twoich
              potrzeb.
            </p>

            <div className="space-y-6">
              <a href="tel:+48517616618" className="flex items-center gap-4 group">
                <div className="w-14 h-14 border border-amber-400/30 flex items-center justify-center group-hover:bg-amber-400/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/40 text-sm uppercase tracking-wider">
                    Telefon
                  </p>
                  <p className="text-white text-lg group-hover:text-amber-300 transition-colors">
                    +48 517 616 618
                  </p>
                </div>
              </a>

              <a
                href="mailto:kontakt@stefanogroup.club"
                className="flex items-center gap-4 group"
              >
                <div className="w-14 h-14 border border-amber-400/30 flex items-center justify-center group-hover:bg-amber-400/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/40 text-sm uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-white text-lg group-hover:text-amber-300 transition-colors">
                    kontakt@stefanogroup.club
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 border border-amber-400/30 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/40 text-sm uppercase tracking-wider">
                    Lokalizacja
                  </p>
                  <p className="text-white text-lg">Kleszczów / Bełchatów</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 p-8 md:p-10"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <div>
                <label className="text-white/40 text-sm uppercase tracking-wider block mb-3">
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/40 text-sm uppercase tracking-wider block mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-sm uppercase tracking-wider block mb-3">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/40 text-sm uppercase tracking-wider block mb-3">
                    Data imprezy
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-sm uppercase tracking-wider block mb-3">
                    Liczba gości
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    value={formData.guests}
                    onChange={(e) =>
                      setFormData({ ...formData, guests: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/40 text-sm uppercase tracking-wider block mb-3">
                  Wiadomość
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:border-amber-400 focus:outline-none resize-none transition-colors"
                  placeholder="Opowiedz nam o swojej imprezie..."
                />
              </div>

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold py-4 uppercase tracking-wider text-sm mt-4 hover:from-amber-300 hover:to-yellow-400 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Wyślij zapytanie
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-black border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-playfair text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
              ELIKSIR
            </span>
          </div>

          <p className="text-white/40 text-sm">
            © 2025 ELIKSIR Mobile Bar. Wszystkie prawa zastrzeżone.
          </p>

          <div className="flex gap-6">
            <a
              href="#"
              className="text-white/40 hover:text-amber-400 transition-colors text-sm uppercase tracking-wider"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-white/40 hover:text-amber-400 transition-colors text-sm uppercase tracking-wider"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Navigation />
      <Hero />
      <Stats />
      <Menu />
      <Pricing />
      <Calculator />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
