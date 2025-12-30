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
    extraBarman: number;
    lemonade: {
      base: number;
      blockGuests: number;
    };
    hockery: number;
    ledLighting: number;
  };
  shoppingList: {
    vodkaRumGinBottles: number; // dla 50 osób
    liqueurBottles: number;
    aperolBottles: number;
    proseccoBottles: number;
    syrupsLiters: number;
    iceKg: number;
  };
}

export default function CalculatorSettingsNew() {
  const [config, setConfig] = useState<CalculatorConfig>({
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
      fountain: {
        perGuest: 10,
        min: 600,
        max: 1200,
      },
      keg: {
        pricePerKeg: 800,
        guestsPerKeg: 50,
      },
      extraBarman: 400,
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
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
        setConfig(data.config);
        // Set checkbox based on whether discount is active
        setDiscountEnabled(data.config.promoDiscount > 0);
      }
    } catch (error) {
      console.error('Error fetching calculator config:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If discount not enabled, force it to 0
      const configToSave = {
        ...config,
        promoDiscount: discountEnabled ? config.promoDiscount : 0,
      };

      console.log('🔍 Wysyłam config:', JSON.stringify(configToSave, null, 2));

      const response = await fetch(`${API_URL}/api/calculator/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
        body: JSON.stringify(configToSave),
      });

      if (response.ok) {
        alert('✅ Konfiguracja kalkulatora zapisana!');
        // Refresh config to show updated values
        fetchConfig();
      } else {
        const errorData = await response.json();
        console.error('❌ Backend error:', errorData);
        alert(`❌ Błąd podczas zapisywania: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('❌ Błąd podczas zapisywania');
    } finally {
      setSaving(false);
    }
  };

  const updatePricePerGuest = (offerId: keyof typeof config.pricePerExtraGuest, value: number) => {
    setConfig({
      ...config,
      pricePerExtraGuest: {
        ...config.pricePerExtraGuest,
        [offerId]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-3xl text-amber-500 font-bold flex items-center gap-3">
            <CalcIcon size={32} />
            Konfiguracja Kalkulatora
          </h2>
          <p className="text-white/60 mt-2">
            Zarządzaj cenami, dodatkami i listą zakupów używanymi w kalkulatorze na stronie głównej
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-amber-500 text-black font-semibold rounded hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={20} />
          {saving ? 'Zapisuję...' : 'Zapisz'}
        </button>
      </div>

      {/* Zniżka promocyjna */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Zniżka Promocyjna</h3>
        <div className="grid gap-4">
          {/* Checkbox - włącz/wyłącz rabat */}
          <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded border border-white/5">
            <input
              type="checkbox"
              id="discount-enabled"
              checked={discountEnabled}
              onChange={(e) => {
                setDiscountEnabled(e.target.checked);
                // If disabling, set discount to 0
                if (!e.target.checked) {
                  setConfig({ ...config, promoDiscount: 0 });
                }
              }}
              className="w-5 h-5 text-amber-500 bg-neutral-700 border-white/20 rounded focus:ring-amber-500 focus:ring-2"
            />
            <label htmlFor="discount-enabled" className="text-white font-medium cursor-pointer">
              Włącz rabat promocyjny
            </label>
          </div>

          {/* Pole numeryczne - aktywne tylko gdy checkbox zaznaczony */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              Rabat (%) - wyświetlany jako -20% itp.
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              disabled={!discountEnabled}
              value={discountEnabled ? (isNaN(config.promoDiscount * 100) ? 0 : config.promoDiscount * 100) : 0}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setConfig({ 
                  ...config, 
                  promoDiscount: isNaN(value) ? 0 : value / 100 
                });
              }}
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-white/50 mt-1">
              {discountEnabled 
                ? `Aktualna wartość: ${isNaN(config.promoDiscount) ? 0 : (config.promoDiscount * 100).toFixed(0)}%`
                : 'Rabat wyłączony - użytkownicy nie zobaczą zniżki'}
            </p>
          </div>
        </div>
      </div>

      {/* Ceny za dodatkowego gościa */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Cena za Dodatkowego Gościa (zł)</h3>
        <p className="text-sm text-white/60 mb-4">
          Koszt dodawany za każdego gościa powyżej minimum pakietu
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(config.pricePerExtraGuest).map(([offerId, price]) => (
            <div key={offerId}>
              <label className="block text-sm text-white/70 mb-2 capitalize">
                {offerId === 'basic' && 'Basic Bartending'}
                {offerId === 'premium' && 'Premium Mix'}
                {offerId === 'exclusive' && 'Exclusive Experience'}
                {offerId === 'kids' && 'Kids Party 0%'}
                {offerId === 'family' && 'Family & Seniors'}
                {offerId === 'business' && 'Business & Luxury'}
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={price}
                onChange={(e) =>
                  updatePricePerGuest(
                    offerId as keyof typeof config.pricePerExtraGuest,
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dodatki - Fontanna */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">🍾 Fontanna Szampańska</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Cena za gościa (zł)</label>
            <input
              type="number"
              min="0"
              value={config.addons.fountain.perGuest}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: {
                    ...config.addons,
                    fountain: { ...config.addons.fountain, perGuest: parseInt(e.target.value) || 0 },
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Minimalna cena (zł)</label>
            <input
              type="number"
              min="0"
              value={config.addons.fountain.min}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: {
                    ...config.addons,
                    fountain: { ...config.addons.fountain, min: parseInt(e.target.value) || 0 },
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Maksymalna cena (zł)</label>
            <input
              type="number"
              min="0"
              value={config.addons.fountain.max}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: {
                    ...config.addons,
                    fountain: { ...config.addons.fountain, max: parseInt(e.target.value) || 0 },
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
        </div>
        <p className="text-xs text-white/50 mt-2">
          Formuła: min({config.addons.fountain.max}, max({config.addons.fountain.min}, goście ×{' '}
          {config.addons.fountain.perGuest}))
        </p>
      </div>

      {/* Dodatki - Keg */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">🍺 Beczka (Keg)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Cena za beczkę (zł)</label>
            <input
              type="number"
              min="0"
              value={config.addons.keg.pricePerKeg}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: {
                    ...config.addons,
                    keg: { ...config.addons.keg, pricePerKeg: parseInt(e.target.value) || 0 },
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Gości na beczkę</label>
            <input
              type="number"
              min="1"
              value={config.addons.keg.guestsPerKeg}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: {
                    ...config.addons,
                    keg: { ...config.addons.keg, guestsPerKeg: parseInt(e.target.value) || 50 },
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
        </div>
        <p className="text-xs text-white/50 mt-2">
          Liczba beczek: ceil(goście / {config.addons.keg.guestsPerKeg}) × {config.addons.keg.pricePerKeg} zł
        </p>
      </div>

      {/* Dodatki - Extra Barman (KEG) */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">👨‍🍳 Dodatkowy barman (KEG)</h3>
        <div>
          <label className="block text-sm text-white/70 mb-2">Koszt stały (zł)</label>
          <input
            type="number"
            min="0"
            value={config.addons.extraBarman}
            onChange={(e) =>
              setConfig({
                ...config,
                addons: {
                  ...config.addons,
                  extraBarman: parseInt(e.target.value) || 0,
                },
              })
            }
            className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
          />
        </div>
        <p className="text-xs text-white/50 mt-2">
          ⚠️ Obowiązkowy dodatkowy barman gdy zaznaczony KEG piwa. Koszt dodawany automatycznie.
        </p>
      </div>

      {/* Dodatki - Lemonade */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">🍹 Lemoniada/Soki</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Cena bazowa (zł)</label>
            <input
              type="number"
              min="0"
              value={config.addons.lemonade.base}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: {
                    ...config.addons,
                    lemonade: { ...config.addons.lemonade, base: parseInt(e.target.value) || 0 },
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Gości na blok</label>
            <input
              type="number"
              min="1"
              value={config.addons.lemonade.blockGuests}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: {
                    ...config.addons,
                    lemonade: { ...config.addons.lemonade, blockGuests: parseInt(e.target.value) || 60 },
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
        </div>
        <p className="text-xs text-white/50 mt-2">
          Cena: ceil(goście / {config.addons.lemonade.blockGuests}) × {config.addons.lemonade.base} zł
        </p>
      </div>

      {/* Dodatki - Stałe */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Dodatki o Stałej Cenie</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">🎯 Hokery (zł)</label>
            <input
              type="number"
              min="0"
              value={config.addons.hockery}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: { ...config.addons, hockery: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">💡 Oświetlenie LED (zł)</label>
            <input
              type="number"
              min="0"
              value={config.addons.ledLighting}
              onChange={(e) =>
                setConfig({
                  ...config,
                  addons: { ...config.addons, ledLighting: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
        </div>
      </div>

      {/* Lista zakupów */}
      <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">📋 Lista Zakupów (dla 50 osób)</h3>
        <p className="text-sm text-white/60 mb-4">
          Wartości bazowe które będą skalowane proporcjonalnie do liczby gości
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Wódka/Rum/Gin (but. 0.7L)</label>
            <input
              type="number"
              min="0"
              value={config.shoppingList.vodkaRumGinBottles}
              onChange={(e) =>
                setConfig({
                  ...config,
                  shoppingList: {
                    ...config.shoppingList,
                    vodkaRumGinBottles: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Likiery (but. 0.7L)</label>
            <input
              type="number"
              min="0"
              value={config.shoppingList.liqueurBottles}
              onChange={(e) =>
                setConfig({
                  ...config,
                  shoppingList: { ...config.shoppingList, liqueurBottles: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Aperol (but. 0.7L)</label>
            <input
              type="number"
              min="0"
              value={config.shoppingList.aperolBottles}
              onChange={(e) =>
                setConfig({
                  ...config,
                  shoppingList: { ...config.shoppingList, aperolBottles: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Prosecco (but. 0.75L)</label>
            <input
              type="number"
              min="0"
              value={config.shoppingList.proseccoBottles}
              onChange={(e) =>
                setConfig({
                  ...config,
                  shoppingList: { ...config.shoppingList, proseccoBottles: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Syropy (L)</label>
            <input
              type="number"
              min="0"
              value={config.shoppingList.syrupsLiters}
              onChange={(e) =>
                setConfig({
                  ...config,
                  shoppingList: { ...config.shoppingList, syrupsLiters: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Lód (kg)</label>
            <input
              type="number"
              min="0"
              value={config.shoppingList.iceKg}
              onChange={(e) =>
                setConfig({
                  ...config,
                  shoppingList: { ...config.shoppingList, iceKg: parseInt(e.target.value) || 0 },
                })
              }
              className="w-full px-4 py-2 bg-neutral-800 text-white border border-white/10 rounded"
            />
          </div>
        </div>
      </div>

      {/* Save button (bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-amber-500 text-black font-semibold rounded hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={20} />
          {saving ? 'Zapisuję...' : 'Zapisz Wszystkie Zmiany'}
        </button>
      </div>
    </div>
  );
}
