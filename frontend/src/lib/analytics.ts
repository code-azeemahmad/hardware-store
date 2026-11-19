/**
 * Naseer Plywood & Hardware - Conversion & Interaction Tracking
 * Lightweight, privacy-respecting client event instrumentation.
 */

declare const process: {
  env: Record<string, string | undefined>;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export interface AnalyticsEvent {
  event: 'whatsapp_click' | 'call_click' | 'enquiry_submit' | 'search_query';
  channel?: 'whatsapp' | 'phone' | 'website_form';
  product_slug?: string;
  product_name?: string;
  category?: string;
  phone_number?: string;
  timestamp: string;
  url: string;
}

export function trackEvent(
  eventName: AnalyticsEvent['event'],
  payload: Partial<AnalyticsEvent> = {}
): void {
  const eventData: AnalyticsEvent = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    ...payload,
  };

  if (typeof window !== 'undefined') {
    // Push to Google Tag Manager / GA4 dataLayer if available
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData as unknown as Record<string, unknown>);

    // Dispatch DOM custom event for local observers
    window.dispatchEvent(
      new CustomEvent('naseer:analytics', { detail: eventData })
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Event]', eventData);
    }
  }
}

export function initConversionTracking(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a');
    if (!target) return;

    const href = target.getAttribute('href') || '';

    // WhatsApp Click Detection
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      const productSlug = target.getAttribute('data-product-slug') || undefined;
      const productName = target.getAttribute('data-product-name') || undefined;
      trackEvent('whatsapp_click', {
        channel: 'whatsapp',
        product_slug: productSlug,
        product_name: productName,
      });
    }

    // Phone Call Detection
    else if (href.startsWith('tel:')) {
      trackEvent('call_click', {
        channel: 'phone',
        phone_number: href.replace('tel:', ''),
      });
    }
  });
}
