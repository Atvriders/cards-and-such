/**
 * Shared Playwright fixtures for the cards-and-such e2e suite.
 *
 * Re-exports `test` from `@playwright/test` with the default `page` fixture
 * extended so every test starts with the first-run welcome carousel
 * pre-dismissed. The welcome backdrop intercepts pointer events and broke
 * dozens of click-based smoke tests after W170 landed; rather than dismiss
 * the carousel in every spec, we pre-seed the `cards-tutorial-seen` blob
 * via `addInitScript` so the carousel never mounts in the first place.
 *
 * Tests that explicitly need to exercise the welcome tutorial
 * (onboarding-flows.spec.ts, lobby-flows.spec.ts "welcome tutorial appears…")
 * can opt out by importing from `@playwright/test` directly, or by calling
 * `await page.evaluate(() => localStorage.clear())` after navigation.
 *
 * Key/value mirrors web/src/platform/tutorials.ts:
 *   STORAGE_KEY  = "cards-tutorial-seen"
 *   WELCOME_KEY  = "__welcome__"
 */
import { test as base, expect } from "@playwright/test";

export const test = base.extend<Record<string, never>>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        const raw = window.localStorage.getItem("cards-tutorial-seen");
        const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
        map["__welcome__"] = true;
        window.localStorage.setItem("cards-tutorial-seen", JSON.stringify(map));
      } catch {
        /* localStorage may be unavailable on the initial about:blank context */
      }
    });
    await use(page);
  },
});

export { expect };
