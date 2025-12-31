/**
 * Facebook Pixel Tracking
 * Events: PageView, Lead, ViewContent, Contact
 * 
 * CONVERSION EVENTS:
 * - Lead: Contact form submission
 * - ViewContent: User scrolls to Oferta section
 * - Contact: Click on phone/email/WhatsApp
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, any>
    ) => void;
  }
}

/**
 * Check if Facebook Pixel is loaded
 */
export function isPixelLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/**
 * Track PageView (automatically tracked on page load)
 */
export function trackPageView(): void {
  if (isPixelLoaded()) {
    window.fbq!('track', 'PageView');
    console.log('📊 FB Pixel: PageView');
  }
}

/**
 * Track Lead - Contact form submission
 * @param data Form data (optional metadata)
 */
export function trackLead(data?: {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}): void {
  if (isPixelLoaded()) {
    window.fbq!('track', 'Lead', {
      content_name: data?.content_name || 'Contact Form',
      content_category: data?.content_category || 'Event Inquiry',
      value: data?.value || 0,
      currency: data?.currency || 'PLN',
    });
    console.log('📊 FB Pixel: Lead', data);
  } else {
    console.warn('FB Pixel not loaded - Lead event not tracked');
  }
}

/**
 * Track ViewContent - User views offers/packages
 * @param data Content metadata
 */
export function trackViewContent(data?: {
  content_name?: string;
  content_type?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}): void {
  if (isPixelLoaded()) {
    window.fbq!('track', 'ViewContent', {
      content_name: data?.content_name || 'Offer Section',
      content_type: data?.content_type || 'product',
      content_ids: data?.content_ids || ['calculator'],
      value: data?.value || 0,
      currency: data?.currency || 'PLN',
    });
    console.log('📊 FB Pixel: ViewContent', data);
  } else {
    console.warn('FB Pixel not loaded - ViewContent event not tracked');
  }
}

/**
 * Track Contact - User clicks phone/email/WhatsApp
 * @param method Contact method used
 */
export function trackContact(method: 'phone' | 'email' | 'whatsapp' | 'facebook' | 'instagram'): void {
  if (isPixelLoaded()) {
    window.fbq!('track', 'Contact', {
      content_name: 'Contact Click',
      content_category: method,
    });
    console.log(`📊 FB Pixel: Contact (${method})`);
  } else {
    console.warn('FB Pixel not loaded - Contact event not tracked');
  }
}

/**
 * Track AddToCart - User adds item to calculator/quote
 * @param data Item data
 */
export function trackAddToCart(data: {
  content_name: string;
  content_type?: string;
  content_ids?: string[];
  value: number;
  currency?: string;
}): void {
  if (isPixelLoaded()) {
    window.fbq!('track', 'AddToCart', {
      content_name: data.content_name,
      content_type: data.content_type || 'product',
      content_ids: data.content_ids || [],
      value: data.value,
      currency: data.currency || 'PLN',
    });
    console.log('📊 FB Pixel: AddToCart', data);
  }
}

/**
 * Track InitiateCheckout - User starts booking/inquiry process
 * @param data Checkout data
 */
export function trackInitiateCheckout(data?: {
  content_name?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}): void {
  if (isPixelLoaded()) {
    window.fbq!('track', 'InitiateCheckout', {
      content_name: data?.content_name || 'Event Booking',
      value: data?.value || 0,
      currency: data?.currency || 'PLN',
      num_items: data?.num_items || 1,
    });
    console.log('📊 FB Pixel: InitiateCheckout', data);
  }
}

/**
 * Track custom event
 * @param eventName Custom event name
 * @param data Event parameters
 */
export function trackCustomEvent(
  eventName: string,
  data?: Record<string, any>
): void {
  if (isPixelLoaded()) {
    window.fbq!('trackCustom', eventName, data || {});
    console.log(`📊 FB Pixel: ${eventName}`, data);
  }
}
