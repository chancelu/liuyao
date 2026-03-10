/**
 * Lightweight frontend analytics — console + localStorage.
 * Reserves a pluggable interface for future real analytics services.
 */

export type EventName =
  | 'page_view_home'
  | 'click_start_cast'
  | 'cast_complete'
  | 'page_view_result'
  | 'click_share'
  | 'click_share_image'
  | 'click_register';

interface AnalyticsEvent {
  name: EventName;
  timestamp: string;
  meta?: Record<string, string>;
}

const STORAGE_KEY = 'yaojing_analytics';
const MAX_EVENTS = 200;

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistEvents(events: AnalyticsEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // quota exceeded — silently drop
  }
}

/**
 * Track an analytics event.
 * Currently logs to console + localStorage.
 * Replace the body of this function to wire up a real service.
 */
export function track(name: EventName, meta?: Record<string, string>) {
  const event: AnalyticsEvent = {
    name,
    timestamp: new Date().toISOString(),
    meta,
  };

  // Console (dev only)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, meta ?? '');
  }

  // Persist
  const events = getStoredEvents();
  events.push(event);
  persistEvents(events);
}

/** Retrieve all stored events (for debugging / export). */
export function getEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

/** Clear stored events. */
export function clearEvents() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
