/**
 * Local-only analytics ring buffer.
 *
 * PRIVACY GUARANTEE: This module performs ZERO network calls. Events are
 * appended to an in-memory ring buffer (capped at RING_CAPACITY) and
 * mirrored to localStorage under the key `cards-events`. Nothing is ever
 * sent off-device — no fetch(), no XHR, no beacon, no image pings, no
 * WebSocket. Strictly a developer-debugging tool surfaced via the
 * Settings → Data "Show event log" affordance.
 *
 * Shape of a stored event:
 *     { ts: 1714694400000, name: "game.start", props: { gameId: "klondike" } }
 *
 * The buffer holds the last RING_CAPACITY events. On overflow the oldest
 * entry is dropped. Tolerates missing localStorage (SSR / private mode)
 * by no-oping any persistence step while keeping the in-memory ring
 * authoritative.
 */

export const ANALYTICS_STORAGE_KEY = "cards-events";
export const RING_CAPACITY = 100;

export interface AnalyticsEvent {
  /** Unix epoch ms — always Date.now() at time of `track()`. */
  ts: number;
  /** Dotted event name, e.g. `app.boot`, `game.win`, `route.change`. */
  name: string;
  /** Optional caller-supplied bag. Kept as a plain JSON-safe shape. */
  props?: Record<string, unknown>;
}

// In-memory ring. Authoritative — localStorage is purely a mirror so the
// dev panel can survive a reload. Module-level state intentionally; we
// never run more than one app instance per tab.
let buffer: AnalyticsEvent[] = loadFromStorage();

function loadFromStorage(): AnalyticsEvent[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Filter for shape so a corrupt blob doesn't crash the dev panel.
    const cleaned: AnalyticsEvent[] = [];
    for (const entry of parsed) {
      if (
        entry != null
        && typeof entry === "object"
        && typeof (entry as AnalyticsEvent).ts === "number"
        && typeof (entry as AnalyticsEvent).name === "string"
      ) {
        cleaned.push(entry as AnalyticsEvent);
      }
    }
    // Trim to capacity in case the persisted blob is older / larger.
    return cleaned.slice(-RING_CAPACITY);
  } catch {
    return [];
  }
}

function persist(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(buffer));
  } catch {
    /* ignore quota / private mode — in-memory ring still works */
  }
}

/**
 * Record an event. Local-only: appended to the ring buffer and mirrored to
 * `localStorage["cards-events"]`. Never makes a network request.
 *
 * Pass a stable `eventName` (dotted, lower-case is convention here) and an
 * optional plain-object `props` bag. Anything not JSON-serialisable is
 * dropped silently.
 */
export function track(eventName: string, props?: Record<string, unknown>): void {
  // Defensively coerce away non-serialisable props (functions, DOM nodes,
  // circular refs) without throwing — analytics must never break a caller.
  let safeProps: Record<string, unknown> | undefined;
  if (props && Object.keys(props).length > 0) {
    try {
      safeProps = JSON.parse(JSON.stringify(props)) as Record<string, unknown>;
    } catch {
      safeProps = undefined;
    }
  }
  const evt: AnalyticsEvent = {
    ts: Date.now(),
    name: eventName,
    ...(safeProps ? { props: safeProps } : {}),
  };
  buffer.push(evt);
  if (buffer.length > RING_CAPACITY) {
    buffer = buffer.slice(buffer.length - RING_CAPACITY);
  }
  persist();
}

/** Return a snapshot of the most recent events (newest last). */
export function getEvents(): AnalyticsEvent[] {
  return buffer.slice();
}

/** Erase the ring buffer + persisted mirror. */
export function clearEvents(): void {
  buffer = [];
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

/** Test-only: re-read from storage. Exposed for unit tests. */
export function _reloadFromStorage(): void {
  buffer = loadFromStorage();
}
