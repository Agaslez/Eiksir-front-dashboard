import { MagicSection } from '../components/layout/MagicSection';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

export default function TestMagic() {
  return (
    <div className="min-h-screen bg-black">
      <ThemeSwitcher />
      
      <MagicSection 
        title="Test MagicSection" 
        subtitle="Sprawdźmy działanie"
        theme="eliksir"
      >
        <div className="text-center text-white/70">
          <p className="mb-4">To jest test MagicSection z motywem 'eliksir'</p>
          <p>Przewiń w dół żeby zobaczyć animacje!</p>
        </div>
      </MagicSection>
      
      <MagicSection 
        title="Motyw Wedding" 
        subtitle="Dla wesel"
        theme="wedding"
      >
        <div className="text-center text-rose-900/70">
          <p>To jest sekcja z motywem 'wedding' - różowe tło</p>
          <p className="mt-4">Idealne na wesela i romantyczne imprezy</p>
        </div>
      </MagicSection>
      
      <MagicSection 
        title="Motyw Neon" 
        subtitle="Nowoczesny styl"
        theme="neon"
      >
        <div className="text-center text-white/70">
          <p>Neonowy motyw z gradientem cyan → purple</p>
          <p className="mt-4">Perfekcyjny na imprezy klubowe</p>
        </div>
      </MagicSection>
      
      <MagicSection 
        title="Bez tytułu"
        theme="gold"
      >
        <div className="text-center text-white/70">
          <p>Sekcja bez subtitle - tylko children</p>
          <p className="mt-4">Złoty motyw dla premium eventów</p>
        </div>
      </MagicSection>
      
      <div className="h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl mb-4">🎉 MagicSection działa!</h2>
          <p className="text-white/60">Przewiń do góry żeby zobaczyć animacje ponownie</p>
          <p className="text-white/40 text-sm mt-8">Sprawdź prawy dolny róg - ThemeSwitcher (tylko dev mode)</p>
        </div>
      </div>
    </div>
  );
}