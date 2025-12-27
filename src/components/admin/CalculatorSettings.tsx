import { Calculator as CalcIcon, DollarSign, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ELIKSIR_STYLES } from '../../lib/styles';

interface PricingSettings {
  basePrice: number;
  drinkTypes: Array<{ id: string; name: string; multiplier: number }>;
  eventTypes: Array<{ id: string; name: string; multiplier: number }>;
  serviceOptions: Array<{ id: string; name: string; price: number }>;
  discounts: Array<{ minGuests: number; discount: number }>;
}

export default function CalculatorSettings() {
  const [settings, setSettings] = useState<PricingSettings>({
    basePrice: 150,
    drinkTypes: [
      { id: 'beer', name: 'Piwo', multiplier: 1.0 },
      { id: 'wine', name: 'Wino', multiplier: 1.3 },
      { id: 'whiskey', name: 'Whiskey', multiplier: 1.6 },
      { id: 'cocktails', name: 'Koktajle Premium', multiplier: 2.0 },
    ],
    eventTypes: [
      { id: 'corporate', name: 'Impreza Firmowa', multiplier: 1.2 },
      { id: 'wedding', name: 'Wesele', multiplier: 1.5 },
      { id: 'birthday', name: 'Urodziny', multiplier: 1.0 },
      { id: 'other', name: 'Inne', multiplier: 1.0 },
    ],
    serviceOptions: [
      { id: 'bartender', name: 'Barman (4h)', price: 800 },
      { id: 'dj', name: 'DJ (4h)', price: 1200 },
      { id: 'catering', name: 'Catering', price: 2000 },
    ],
    discounts: [
      { minGuests: 50, discount: 5 },
      { minGuests: 100, discount: 10 },
      { minGuests: 200, discount: 15 },
    ],
  });

  const [testCalculation, setTestCalculation] = useState({
    guests: 100,
    drinkType: 'beer',
    eventType: 'corporate',
    services: [] as string[],
    totalPrice: 0,
  });

  const [saving, setSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    calculateTestPrice();
  }, [testCalculation.guests, testCalculation.drinkType, testCalculation.eventType, testCalculation.services, settings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/calculator/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const calculateTestPrice = () => {
    const drinkMultiplier = settings.drinkTypes.find(d => d.id === testCalculation.drinkType)?.multiplier || 1;
    const eventMultiplier = settings.eventTypes.find(e => e.id === testCalculation.eventType)?.multiplier || 1;
    
    const baseTotal = settings.basePrice * testCalculation.guests * drinkMultiplier * eventMultiplier;
    
    const servicesTotal = testCalculation.services.reduce((sum, serviceId) => {
      const service = settings.serviceOptions.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);

    const discount = settings.discounts
      .filter(d => testCalculation.guests >= d.minGuests)
      .reduce((max, d) => Math.max(max, d.discount), 0);

    const total = (baseTotal + servicesTotal) * (1 - discount / 100);
    
    setTestCalculation(prev => ({ ...prev, totalPrice: Math.round(total) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/calculator/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('✅ Ustawienia zapisane!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Błąd podczas zapisywania');
    } finally {
      setSaving(false);
    }
  };

  const updateDrinkType = (id: string, field: 'name' | 'multiplier', value: string | number) => {
    setSettings({
      ...settings,
      drinkTypes: settings.drinkTypes.map(d =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    });
  };

  const updateEventType = (id: string, field: 'name' | 'multiplier', value: string | number) => {
    setSettings({
      ...settings,
      eventTypes: settings.eventTypes.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const updateService = (id: string, field: 'name' | 'price', value: string | number) => {
    setSettings({
      ...settings,
      serviceOptions: settings.serviceOptions.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-3xl text-eliksir-gold font-bold">
            Kalkulator Cenowy
          </h2>
          <p className="text-white/60 mt-1">
            Zarządzaj cenami i mnożnikami kalkulatora
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`${ELIKSIR_STYLES.buttonPrimary} flex items-center space-x-2`}
        >
          <Save size={20} />
          <span>{saving ? 'Zapisywanie...' : 'Zapisz Wszystko'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Column */}
        <div className="space-y-6">
          {/* Base Price */}
          <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
              Cena Bazowa
            </h3>
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Cena za osobę (PLN)
              </label>
              <input
                type="number"
                value={settings.basePrice}
                onChange={(e) => setSettings({ ...settings, basePrice: parseFloat(e.target.value) })}
                className={ELIKSIR_STYLES.input}
                step="10"
              />
            </div>
          </div>

          {/* Drink Types */}
          <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
              Rodzaje Napojów
            </h3>
            <div className="space-y-3">
              {settings.drinkTypes.map((drink) => (
                <div key={drink.id} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={drink.name}
                    onChange={(e) => updateDrinkType(drink.id, 'name', e.target.value)}
                    className={`${ELIKSIR_STYLES.input} flex-1`}
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">×</span>
                    <input
                      type="number"
                      value={drink.multiplier}
                      onChange={(e) => updateDrinkType(drink.id, 'multiplier', parseFloat(e.target.value))}
                      className={`${ELIKSIR_STYLES.input} w-20`}
                      step="0.1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Types */}
          <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
              Rodzaje Wydarzeń
            </h3>
            <div className="space-y-3">
              {settings.eventTypes.map((event) => (
                <div key={event.id} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={event.name}
                    onChange={(e) => updateEventType(event.id, 'name', e.target.value)}
                    className={`${ELIKSIR_STYLES.input} flex-1`}
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">×</span>
                    <input
                      type="number"
                      value={event.multiplier}
                      onChange={(e) => updateEventType(event.id, 'multiplier', parseFloat(e.target.value))}
                      className={`${ELIKSIR_STYLES.input} w-20`}
                      step="0.1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
              Dodatkowe Usługi
            </h3>
            <div className="space-y-3">
              {settings.serviceOptions.map((service) => (
                <div key={service.id} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                    className={`${ELIKSIR_STYLES.input} flex-1`}
                  />
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-white/60" />
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value))}
                      className={`${ELIKSIR_STYLES.input} w-28`}
                      step="100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Calculator Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-eliksir-gold/20 to-eliksir-gold-dark/20 rounded-eliksir border border-eliksir-gold/30 p-6 sticky top-6">
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4 flex items-center space-x-2">
              <CalcIcon size={24} />
              <span>Podgląd na Żywo</span>
            </h3>

            <div className="space-y-4">
              {/* Guests */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Liczba Gości: {testCalculation.guests}
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={testCalculation.guests}
                  onChange={(e) => setTestCalculation({ ...testCalculation, guests: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Drink Type */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Rodzaj Napojów
                </label>
                <select
                  value={testCalculation.drinkType}
                  onChange={(e) => setTestCalculation({ ...testCalculation, drinkType: e.target.value })}
                  className={ELIKSIR_STYLES.input}
                >
                  {settings.drinkTypes.map((drink) => (
                    <option key={drink.id} value={drink.id}>
                      {drink.name} (×{drink.multiplier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Rodzaj Wydarzenia
                </label>
                <select
                  value={testCalculation.eventType}
                  onChange={(e) => setTestCalculation({ ...testCalculation, eventType: e.target.value })}
                  className={ELIKSIR_STYLES.input}
                >
                  {settings.eventTypes.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} (×{event.multiplier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Services */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Dodatkowe Usługi
                </label>
                <div className="space-y-2">
                  {settings.serviceOptions.map((service) => (
                    <label key={service.id} className="flex items-center space-x-2 text-white/70">
                      <input
                        type="checkbox"
                        checked={testCalculation.services.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTestCalculation({
                              ...testCalculation,
                              services: [...testCalculation.services, service.id],
                            });
                          } else {
                            setTestCalculation({
                              ...testCalculation,
                              services: testCalculation.services.filter(s => s !== service.id),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span>{service.name} (+{service.price} PLN)</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-1">Szacowana Cena</p>
                  <p className="text-4xl font-bold text-eliksir-gold">
                    {testCalculation.totalPrice.toLocaleString('pl-PL')} PLN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
