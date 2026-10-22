import type { Attribution, LeadContext } from './types';
export const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export function readAttribution(search: string, pathname: string, referrer: string): Attribution {
  const params = new URLSearchParams(search);
  let referrerHost = null;
  try { referrerHost = new URL(referrer).hostname; } catch { /* no referrer */ }
  return { ...Object.fromEntries(utmKeys.map(key => [key, params.get(key)?.slice(0, 160) || null])), landingPath: pathname, referrerHost } as Attribution;
}
type EventName = 'page_view' | 'cta_click' | 'project_open' | 'form_open' | 'form_error' | 'demo_submit_success';
type SafeProperties = Partial<LeadContext> & { field?: string };
export function createDemoAnalytics(attribution: Attribution, sessionId: string) {
  const events: { name: EventName; properties: object }[] = [];
  return {
    track(name: EventName, properties: SafeProperties = {}) {
      // Explicit projection: accidental extra payload fields cannot enter the buffer.
      const { leadType, projectId, placement, field } = properties;
      events.push({ name, properties: { anonymousSessionId: sessionId, ...attribution, leadType, projectId, placement, ...(field ? { field } : {}) } });
    },
    snapshot: () => structuredClone(events),
  };
}
export const attribution = readAttribution(typeof location !== 'undefined' ? location.search : '', typeof location !== 'undefined' ? location.pathname : '/', typeof document !== 'undefined' ? document.referrer : '');
const adapter = createDemoAnalytics(attribution, crypto.randomUUID());
export const trackEvent = adapter.track;
// Kept in module memory only. No console, storage, URL changes or telemetry endpoints.
export const getDemoEvents = adapter.snapshot;
