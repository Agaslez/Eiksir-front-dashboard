import { Container } from './layout/Container';
import { Section } from './layout/Section';

const menuItems = [
  {
    name: 'Classic Mojito',
    description: 'Biały rum, limonka, mięta, cukier trzcinowy, soda',
    price: '32 zł',
    category: 'Klasyczne',
  },
  {
    name: 'Espresso Martini',
    description: 'Wódka, espresso, likier kawowy, syrop cukrowy',
    price: '36 zł',
    category: 'Premium',
  },
  {
    name: 'Aperol Spritz',
    description: 'Prosecco, Aperol, soda, pomarańcza',
    price: '30 zł',
    category: 'Lekkie',
  },
  {
    name: 'Old Fashioned',
    description: 'Bourbon, cukier, bitters, skórka pomarańczy',
    price: '38 zł',
    category: 'Klasyczne',
  },
];

export const Menu = () => {
  return (
    <Section id="menu" className="bg-gradient-to-b from-eliksir-dark to-black">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-accent mb-2">
            Nasza Karta
          </h2>
          <p className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-gold">Menu</span> Koktajli
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Odkryj naszą kolekcję wyjątkowych koktajli, od klasycznych po
            autorskie kompozycje. Każdy drink to dzieło sztuki barmańskiej.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuItems.map((item) => (
            <div
              key={item.name}
              className="bg-eliksir-gray border border-eliksir-gold/20 rounded-xl p-6 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  <span className="inline-block mt-1 text-sm bg-accent/20 text-accent-light px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gradient-gold">
                  {item.price}
                </p>
              </div>

              <p className="text-white/70 mb-6">{item.description}</p>

              <div className="flex items-center justify-between">
                <button className="text-sm text-accent hover:text-accent-light font-medium flex items-center gap-2">
                  <span>Więcej informacji</span>
                  <span>→</span>
                </button>
                <button className="bg-gradient-to-r from-accent to-accent-dark text-white font-semibold px-6 py-2 rounded-lg hover:from-accent-light hover:to-accent transition-all duration-300 hover:scale-105 active:scale-95">
                  Dodaj do zamówienia
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            className="border-2 border-accent text-accent font-semibold px-8 py-3 rounded-lg hover:bg-accent hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => {
              const element = document.getElementById('oferta');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Zobacz pełne menu koktajli
          </button>
        </div>
      </Container>
    </Section>
  );
};
