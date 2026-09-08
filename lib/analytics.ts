type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, parameters?: AnalyticsParameters) => void;
  }
}

/** Sends non-identifying product-usage events when GA4 is configured. */
export function trackAnalyticsEvent(name: string, parameters: AnalyticsParameters = {}) {
  window.gtag?.("event", name, parameters);
}
