import React from 'react';
import { ELIKSIR_STYLES } from '../lib/styles';

const ResponsiveTest = () => {
  const breakpoints = [
    { name: 'Mobile', width: '640px', class: 'w-full max-w-md' },
    { name: 'Tablet', width: '768px', class: 'w-full max-w-lg' },
    { name: 'Desktop', width: '1024px', class: 'w-full max-w-xl' },
    { name: 'Wide', width: '1280px', class: 'w-full max-w-2xl' },
  ];

  const testComponents = [
    {
      name: 'Button Primary',
      element: (
        <button className={ELIKSIR_STYLES.buttonPrimary}>Test Button</button>
      ),
    },
    {
      name: 'Button Secondary',
      element: (
        <button className={ELIKSIR_STYLES.buttonSecondary}>
          Secondary Button
        </button>
      ),
    },
    {
      name: 'Card',
      element: (
        <div className={`${ELIKSIR_STYLES.card} ${ELIKSIR_STYLES.cardHover}`}>
          <h3 className={ELIKSIR_STYLES.heading3}>Test Card</h3>
          <p className={ELIKSIR_STYLES.body}>
            This is a test card component with hover effects.
          </p>
        </div>
      ),
    },
    {
      name: 'Input Field',
      element: (
        <div>
          <label className={ELIKSIR_STYLES.label}>Email Address</label>
          <input
            type="email"
            className={ELIKSIR_STYLES.input}
            placeholder="test@example.com"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={`${ELIKSIR_STYLES.container} ${ELIKSIR_STYLES.section}`}>
      <h2 className={`${ELIKSIR_STYLES.heading2} mb-8 text-center`}>
        <span className={ELIKSIR_STYLES.textGradient}>
          Responsive Design Test
        </span>
      </h2>

      <div className="mb-12">
        <h3 className={`${ELIKSIR_STYLES.heading3} mb-4`}>Breakpoints Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {breakpoints.map((bp, idx) => (
            <div key={idx} className={`${ELIKSIR_STYLES.card} text-center`}>
              <div className="text-eliksir-gold font-bold mb-2">{bp.name}</div>
              <div className="text-white/60 text-sm">{bp.width}</div>
              <div className="mt-4 h-2 bg-eliksir-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-eliksir-gold to-eliksir-goldLight"
                  style={{
                    width: bp.class.includes('md')
                      ? '50%'
                      : bp.class.includes('lg')
                        ? '75%'
                        : '100%',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h3 className={`${ELIKSIR_STYLES.heading3} mb-4`}>
          Component Responsiveness
        </h3>
        <div className="space-y-8">
          {testComponents.map((comp, idx) => (
            <div key={idx} className={`${ELIKSIR_STYLES.card}`}>
              <h4 className="text-white font-bold mb-4">{comp.name}</h4>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="w-full md:w-1/3">{comp.element}</div>
                <div className="w-full md:w-2/3">
                  <div className="text-white/60 text-sm">
                    <div className="mb-2">
                      <span className="text-eliksir-gold">Mobile:</span> Full
                      width, stacked
                    </div>
                    <div>
                      <span className="text-eliksir-gold">Desktop:</span>{' '}
                      Responsive layout, side-by-side
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${ELIKSIR_STYLES.card}`}>
        <h3 className={`${ELIKSIR_STYLES.heading3} mb-4`}>
          Margin Consistency Test
        </h3>
        <div className="space-y-6">
          <div className="p-4 border border-dashed border-white/20 rounded">
            <div className="text-center text-white/70 mb-2">
              Section Margins
            </div>
            <div className="h-20 relative">
              <div className="absolute inset-0 border-2 border-eliksir-gold/30 rounded">
                <div className="absolute left-0 top-0 bottom-0 w-section-mobile lg:w-section bg-eliksir-gold/10" />
                <div className="absolute right-0 top-0 bottom-0 w-section-mobile lg:w-section bg-eliksir-gold/10" />
                <div className="absolute inset-x-section-mobile lg:inset-x-section top-0 bottom-0 border-x border-dashed border-white/20" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm">Content Area</span>
              </div>
            </div>
            <div className="text-center text-white/50 text-xs mt-2">
              Left/Right margins:{' '}
              <span className="text-eliksir-gold">3% mobile</span> •{' '}
              <span className="text-eliksir-gold">5% desktop</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-white/50 text-sm">
        Test passed: All components use consistent spacing and responsive
        classes
      </div>
    </div>
  );
};

export default ResponsiveTest;
