import { motion } from 'framer-motion';
import { Cherry, Citrus, Flame, Leaf, Sparkles, Wine } from 'lucide-react';
import { useState } from 'react';
import { useComponentHealth } from '../lib/component-health-monitor';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

const categories = [
  {
    key: 'klasyczne',
    name: 'Klasyczne',
    emoji: '🍸',
    icon: Wine,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    key: 'owocowe',
    name: 'Owocowe',
    emoji: '🍹',
    icon: Citrus,
    color: 'from-pink-500 to-rose-400',
  },
  {
    key: 'bezalkoholowe',
    name: 'Bezalkoholowe',
    emoji: '🥤',
    icon: Cherry,
    color: 'from-green-500 to-emerald-400',
  },
  {
    key: 'premium',
    name: 'Premium',
    emoji: '🥃',
    icon: Flame,
    color: 'from-amber-500 to-yellow-400',
  },
  {
    key: 'sezonowe',
    name: 'Sezonowe',
    emoji: '🍁',
    icon: Leaf,
    color: 'from-purple-500 to-violet-400',
  },
  {
    key: 'sygnaturowe',
    name: 'Sygnaturowe',
    emoji: '✨',
    icon: Sparkles,
    color: 'from-eliksir-gold to-eliksir-gold-light',
  },
];

const cocktailsData = {
  klasyczne: [
    {
      name: 'Old Fashioned',
      price: '35 zł',
      description: 'Bourbon, cukier, bitters, skórka pomarańczy',
      ingredients: [
        'Bourbon',
        'Cukier trzcinowy',
        'Angostura bitters',
        'Pomarańcza',
      ],
    },
    {
      name: 'Martini',
      price: '32 zł',
      description: 'Gin, wermut, oliwka',
      ingredients: ['Gin', 'Wermut suchy', 'Oliwka'],
    },
    {
      name: 'Negroni',
      price: '34 zł',
      description: 'Gin, Campari, czerwony wermut',
      ingredients: ['Gin', 'Campari', 'Czerwony wermut'],
    },
    {
      name: 'Manhattan',
      price: '36 zł',
      description: 'Whisky, czerwony wermut, bitters',
      ingredients: ['Whisky rye', 'Czerwony wermut', 'Angostura bitters'],
    },
    {
      name: 'Mojito',
      price: '30 zł',
      description: 'Biały rum, limonka, mięta, cukier',
      ingredients: ['Biały rum', 'Limonka', 'Mięta', 'Cukier trzcinowy'],
    },
  ],
  owocowe: [
    {
      name: 'Pina Colada',
      price: '32 zł',
      description: 'Rum, sok ananasowy, mleko kokosowe',
      ingredients: ['Rum', 'Sok ananasowy', 'Mleko kokosowe', 'Lód'],
    },
    {
      name: 'Strawberry Daiquiri',
      price: '31 zł',
      description: 'Rum, truskawki, limonka, cukier',
      ingredients: ['Biały rum', 'Truskawki', 'Limonka', 'Cukier'],
    },
    {
      name: 'Mango Tango',
      price: '33 zł',
      description: 'Wódka, mango, marakuja, limonka',
      ingredients: ['Wódka', 'Mango', 'Marakuja', 'Limonka'],
    },
    {
      name: 'Blue Lagoon',
      price: '29 zł',
      description: 'Wódka, Blue Curaçao, sprite, limonka',
      ingredients: ['Wódka', 'Blue Curaçao', 'Sprite', 'Limonka'],
    },
  ],
  bezalkoholowe: [
    {
      name: 'Virgin Mojito',
      price: '22 zł',
      description: 'Limonka, mięta, cukier, soda',
      ingredients: ['Limonka', 'Mięta', 'Cukier', 'Soda'],
    },
    {
      name: 'Berry Blast',
      price: '24 zł',
      description: 'Mieszanka jagód, limonka, mięta',
      ingredients: ['Jagody', 'Maliny', 'Limonka', 'Mięta'],
    },
    {
      name: 'Tropical Sunrise',
      price: '26 zł',
      description: 'Sok pomarańczowy, grenadyna, ananas',
      ingredients: ['Sok pomarańczowy', 'Grenadyna', 'Ananas', 'Lód'],
    },
    {
      name: 'Cucumber Cooler',
      price: '23 zł',
      description: 'Ogórek, limonka, mięta, soda',
      ingredients: ['Ogórek', 'Limonka', 'Mięta', 'Soda'],
    },
  ],
  premium: [
    {
      name: 'Gold Fashioned',
      price: '55 zł',
      description: 'Premium bourbon, złoty syrop, bitters',
      ingredients: [
        'Premium bourbon',
        'Złoty syrop',
        'Bitters',
        'Skórka cytryny',
      ],
    },
    {
      name: 'Truffle Martini',
      price: '58 zł',
      description: 'Gin truflowy, wermut, oliwka truflowa',
      ingredients: ['Gin truflowy', 'Wermut', 'Oliwka truflowa'],
    },
    {
      name: 'Caviar Fizz',
      price: '65 zł',
      description: 'Wódka, kawior, cytryna, prosecco',
      ingredients: ['Premium wódka', 'Kawior', 'Cytryna', 'Prosecco'],
    },
  ],
  sezonowe: [
    {
      name: 'Pumpkin Spice',
      price: '34 zł',
      description: 'Rum, dynia, cynamon, gałka muszkatołowa',
      ingredients: ['Ciemny rum', 'Dynia', 'Cynamon', 'Gałka muszkatołowa'],
    },
    {
      name: 'Winter Berry',
      price: '36 zł',
      description: 'Gin, jagody, rozmaryn, cytryna',
      ingredients: ['Gin', 'Jagody', 'Rozmaryn', 'Cytryna'],
    },
    {
      name: 'Summer Breeze',
      price: '32 zł',
      description: 'Wódka, arbuz, bazylia, limonka',
      ingredients: ['Wódka', 'Arbuz', 'Bazylia', 'Limonka'],
    },
  ],
  sygnaturowe: [
    {
      name: 'Eliksir Gold',
      price: '45 zł',
      description: 'Nasz flagowy koktajl z płatkami złota',
      ingredients: [
        'Premium gin',
        'Syrop miodowy',
        'Angostura bitters',
        'Płatki złota',
      ],
    },
    {
      name: 'Midnight Magic',
      price: '42 zł',
      description: 'Ciemny rum, czarna porzeczka, wanilia',
      ingredients: ['Ciemny rum', 'Czarna porzeczka', 'Wanilia', 'Bitters'],
    },
    {
      name: 'Phoenix Flame',
      price: '48 zł',
      description: 'Tequila, chili, mango, limonka',
      ingredients: ['Tequila reposado', 'Chili', 'Mango', 'Limonka'],
    },
    {
      name: 'Starlight',
      price: '50 zł',
      description: 'Wódka, kwiat hibiskusa, cytryna, szampan',
      ingredients: ['Wódka', 'Hibiskus', 'Cytryna', 'Szampan'],
    },
  ],
};

export default function OfertaEliksir() {
  useComponentHealth('OfertaEliksir');
  const [activeCategory, setActiveCategory] = useState('sygnaturowe');
  const [selectedCocktail, setSelectedCocktail] = useState<any>(null);

  return (
    <Section id="oferta" className="bg-eliksir-dark">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Nasza{' '}
            <span className="bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent">
              Oferta
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Odkryj naszą kolekcję wyjątkowych koktajli, od klasycznych po
            autorskie kompozycje. Każdy drink to dzieło sztuki barmańskiej.
          </p>
        </motion.div>

        {/* Kategorie */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category.key
                    ? `bg-gradient-to-r ${category.color} text-black`
                    : 'bg-eliksir-gray text-white hover:bg-eliksir-gray-light'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Koktajle */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cocktailsData[activeCategory as keyof typeof cocktailsData].map(
            (cocktail, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-eliksir-gray border border-eliksir-gold/20 rounded-xl p-6 hover:border-eliksir-gold/40 transition-colors cursor-pointer"
                onClick={() => setSelectedCocktail(cocktail)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-eliksir-gold to-eliksir-gold-light bg-clip-text text-transparent">
                    {cocktail.name}
                  </h3>
                  <span className="text-lg font-bold bg-gradient-to-r from-eliksir-gold to-eliksir-gold-dark text-transparent bg-clip-text">
                    {cocktail.price}
                  </span>
                </div>

                <p className="text-white/70 mb-4">{cocktail.description}</p>

                <div className="mb-6">
                  <p className="text-sm text-white/50 mb-2">Składniki:</p>
                  <div className="flex flex-wrap gap-2">
                    {cocktail.ingredients.map((ingredient, i) => (
                      <span
                        key={i}
                        className="text-xs bg-eliksir-gray-light text-white/70 px-3 py-1 rounded-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full bg-gradient-to-r from-eliksir-gold to-eliksir-gold-dark text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Tutaj logika dodania do zamówienia
                  }}
                >
                  Dodaj do zamówienia
                </button>
              </motion.div>
            )
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-eliksir-gray/50 backdrop-blur-sm border border-eliksir-gold/30 rounded-xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent mb-4">
              Potrzebujesz spersonalizowanej oferty?
            </h3>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Skontaktuj się z nami, aby omówić szczegóły Twojego wydarzenia.
              Przygotujemy indywidualną ofertę dopasowaną do Twoich potrzeb.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const element = document.getElementById('kontakt');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-eliksir-gold to-eliksir-gold-dark text-black font-semibold px-10 py-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Skontaktuj się
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('kalkulator');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-transparent border border-eliksir-gold text-eliksir-gold font-semibold px-10 py-4 rounded-lg hover:bg-eliksir-gold/10 transition-colors"
              >
                Oblicz koszt
              </button>
            </div>
          </div>
        </motion.div>
      </Container>

      {/* Modal z detalami koktajlu */}
      {selectedCocktail && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCocktail(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-eliksir-gray border border-eliksir-gold/30 rounded-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCocktail(null)}
              className="absolute top-4 right-4 text-white hover:text-eliksir-gold text-2xl"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold bg-gradient-to-r from-eliksir-gold to-eliksir-gold-light bg-clip-text text-transparent mb-2">
              {selectedCocktail.name}
            </h3>
            <div className="text-xl font-bold text-eliksir-gold mb-4">
              {selectedCocktail.price}
            </div>

            <p className="text-white/70 mb-6">{selectedCocktail.description}</p>

            <div className="mb-6">
              <h4 className="font-bold text-white mb-3">Składniki:</h4>
              <ul className="space-y-2">
                {selectedCocktail.ingredients.map(
                  (ingredient: string, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-eliksir-gold rounded-full"></span>
                      <span className="text-white/80">{ingredient}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <button className="w-full bg-gradient-to-r from-eliksir-gold to-eliksir-gold-dark text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
              Dodaj do zamówienia
            </button>
          </motion.div>
        </div>
      )}
    </Section>
  );
}
