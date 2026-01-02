import { config } from '@/lib/config';
import { Calculator as CalcIcon, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CalculatorConfig {
  promoDiscount: number; // 0-1 (0.2 = 20%)
  pricePerExtraGuest: {
    basic: number;
    premium: number;
    exclusive: number;
    kids: number;
    family: number;
    business: number;
  };
  addons: {
    fountain: {
      perGuest: number;
      min: number;
      max: number;
    };
    keg: {
      pricePerKeg: number;
      guestsPerKeg: number;
    };
    lemonade: {
      base: number;
      blockGuests: number;
    };
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

export default function CalculatorSettings() {
  const [configData, setConfigData] = useState<CalculatorConfig>({
    promoDiscount: 0.2,
    pricePerExtraGuest: {
      basic: 40,
      premium: 50,
      exclusive: 60,
      kids: 30,
      family: 35,
      business: 45,
    },
    addons: {
      fountain: {
        perGuest: 10,
        min: 600,
        max: 1200,
      },
      keg: {
        pricePerKeg: 550,
        guestsPerKeg: 50,
      },
      lemonade: {
        base: 250,
        blockGuests: 60,
      },
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
  });

  const [saving, setSaving] = useState(false);
  const API_URL = config.apiUrl;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/calculator/config`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success && data.config) {
        setConfigData(data.config);
      }
    } catch (error) {
      console.error('Error fetching calculator config:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/calculator/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
        body: JSON.stringify(configData),
      });

      if (response.ok) {
        alert('Konfiguracja została zapisana!');
        await fetchConfig();
        
        // Notify frontend to refresh calculator
        window.dispatchEvent(new CustomEvent('data:refresh', {
          detail: { type: 'calculator', timestamp: new Date().toISOString() }
        }));
        // ARCHITECT_APPROVED: Debug log for admin panel refresh events - essential for troubleshooting cache sync - 2026-01-02 - Stefan
        console.log('🔔 Calculator refresh event dispatched');
      } else {
        alert('Błąd podczas zapisywania konfiguracji');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Błąd podczas zapisywania konfiguracji');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string[], value: number) => {
    setConfigData((prev) => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-3xl text-amber-500 font-bold flex items-center gap-3">
            <CalcIcon size={32} />
            Konfiguracja Kalkulatora
          </h2>
          <p className="text-white/60 mt-2">
            Zarządzaj cenami, dodatkami i listą zakupów
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-neutral-900 font-semibold rounded-lg hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
        </button>
      </div>

      {/* Promo Discount */}
      <div className="bg-neutral-800/50 p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Promocyjny Rabat</h3>
        <div>
          <label className="block text-sm text-white/70 mb-2">
            Promo Discount (0-1)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={configData.promoDiscount}
            onChange={(e) => updateConfig(['promoDiscount'], parseFloat(e.target.value))}
            className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
          />
        </div>
      </div>

      {/* Price Per Guest */}
      <div className="bg-neutral-800/50 p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Ceny Za Gościa</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(configData.pricePerExtraGuest).map((packageName) => (
            <div key={packageName}>
              <label className="block text-sm text-white/70 mb-2 capitalize">
                {packageName === 'kids' ? 'Kids' :
                 packageName === 'family' ? 'Family & Seniors' :
                 packageName === 'business' ? 'Business & Luxury' :
                 packageName.charAt(0).toUpperCase() + packageName.slice(1)}
              </label>
              <input
                type="number"
                step="5"
                min="0"
                value={configData.pricePerExtraGuest[packageName as keyof typeof configData.pricePerExtraGuest]}
                onChange={(e) => updateConfig(['pricePerExtraGuest', packageName], parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Addons Configuration */}
      <div className="bg-neutral-800/50 p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Dodatki</h3>
        <div className="space-y-6">
          {/* Fountain */}
          <div>
            <h4 className="text-white font-semibold mb-3">Fontanna Alkoholowa</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Per Guest</label>
                <input
                  type="number"
                  value={configData.addons.fountain.perGuest}
                  onChange={(e) => updateConfig(['addons', 'fountain', 'perGuest'], parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Min</label>
                <input
                  type="number"
                  value={configData.addons.fountain.min}
                  onChange={(e) => updateConfig(['addons', 'fountain', 'min'], parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Max</label>
                <input
                  type="number"
                  value={configData.addons.fountain.max}
                  onChange={(e) => updateConfig(['addons', 'fountain', 'max'], parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
                />
              </div>
            </div>
          </div>

          {/* Keg */}
          <div>
            <h4 className="text-white font-semibold mb-3">Beczkowe Piwo</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Price Per Keg</label>
                <input
                  type="number"
                  value={configData.addons.keg.pricePerKeg}
                  onChange={(e) => updateConfig(['addons', 'keg', 'pricePerKeg'], parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Guests Per Keg</label>
                <input
                  type="number"
                  value={configData.addons.keg.guestsPerKeg}
                  onChange={(e) => updateConfig(['addons', 'keg', 'guestsPerKeg'], parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
                />
              </div>
            </div>
          </div>

          {/* Lemonade */}
          <div>
            <h4 className="text-white font-semibold mb-3">Świeża Lemoniada</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Base Price</label>
                <input
                  type="number"
                  value={configData.addons.lemonade.base}
                  onChange={(e) => updateConfig(['addons', 'lemonade', 'base'], parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Block Guests</label>
                <input
                  type="number"
                  value={configData.addons.lemonade.blockGuests}
                  onChange={(e) => updateConfig(['addons', 'lemonade', 'blockGuests'], parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
                />
              </div>
            </div>
          </div>

          {/* Fixed Price Addons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Hokery Barowe</label>
              <input
                type="number"
                value={configData.addons.hockery}
                onChange={(e) => updateConfig(['addons', 'hockery'], parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Oświetlenie LED</label>
              <input
                type="number"
                value={configData.addons.ledLighting}
                onChange={(e) => updateConfig(['addons', 'ledLighting'], parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shopping List */}
      <div className="bg-neutral-800/50 p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Lista Zakupów</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(configData.shoppingList).map((item) => (
            <div key={item}>
              <label className="block text-sm text-white/70 mb-2 capitalize">
                {item
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim()}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={configData.shoppingList[item as keyof typeof configData.shoppingList]}
                onChange={(e) => updateConfig(['shoppingList', item], parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
