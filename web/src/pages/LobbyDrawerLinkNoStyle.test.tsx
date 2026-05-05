import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2159 — every desktop drawer category row (`DrawerLink`) MUST NOT
 * carry an inline `style` attribute. The `<button>` element produced
 * by `DrawerLink` in `web/src/pages/LobbyPage.tsx` is intentionally
 * styled exclusively via the `lobby-drawer-link` className (and its
 * `is-active` modifier). The stylesheet at
 * `web/src/pages/LobbyPage.css` owns the row's visual contract.
 *
 * Sibling pins on this same per-row `<button>`:
 *   - W1978 / LobbyDrawerLinkTag.test.tsx pins `tagName === "BUTTON"`.
 *   - W1875 / LobbyDrawerLinkClass.test.tsx pins exact `className`.
 *   - W2032 / LobbyDrawerLinkNoId.test.tsx pins absence of `id`.
 *   - LobbyDrawerLinkAriaCurrent.test.tsx pins `aria-current` swap.
 *   - LobbyDrawerLinkCount.test.tsx pins the count child span and
 *     the queried node count of 9.
 *   - LobbyDrawerLinkGlyph.test.tsx pins the glyph child span.
 *   - LobbyDrawerRowAriaLabel.test.tsx pins `aria-label` text.
 *
 * What none of those cover is the ABSENCE of an inline `style`
 * attribute on the per-row button. A future refactor that introduced
 * e.g. `style={{ color: ... }}` or a CSS-variable inline override
 * would silently:
 *   1. Bypass the central `lobby-drawer-link` stylesheet contract,
 *      meaning theming / dark-mode tweaks via CSS no longer reach
 *      the row consistently across all 9 entries.
 *   2. Defeat any `!important`-free CSS specificity ordering elsewhere
 *      in the cascade (inline styles win against external rules
 *      lacking `!important`), making future style fixes harder to
 *      reason about.
 *   3. Couple per-row visuals to JS-time computed values rather than
 *      the static stylesheet, fracturing the lobby's "presentation
 *      lives in CSS" architectural rule that LobbyChipStripNoStyle,
 *      LobbyChipAllNoStyle, and LobbyDrawerAsideNoStyle pin for
 *      sibling DOM nodes.
 *
 * One focused assertion per row: each drawer-cat-* button MUST NOT
 * carry an inline `style` attribute. Mirrors the
 * LobbyDrawerAsideNoStyle.test.tsx pattern but applied per-row across
 * all 9 drawer rows.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established pattern in this directory and avoid merge churn on the
 * mega-file.
 */
describe("LobbyPage — drawer-link rows have no inline style attribute (W2159)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W2032 / W1978 /
    // W2023 siblings: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer
    // aside (and its rows) would never mount and the test would
    // fail for the wrong reason.
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: /min-width:\s*1024/.test(query),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("every `[data-testid^=\"lobby-drawer-cat-\"]` button has hasAttribute(\"style\") === false", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Pin the full set explicitly (mirrors W2032 / W1978's enumeration)
    // so a future row rename or reordering doesn't silently shrink
    // this assertion. Order mirrors the visual render order in
    // LobbyPage.tsx: 1 "all" + 5 categories + 3 status rows = 9.
    const ids = [
      "all",
      "solitaire",
      "cards",
      "dice",
      "board",
      "arcade",
      "favorites",
      "top-rated",
      "recently-played",
    ] as const;

    for (const id of ids) {
      const link = screen.getByTestId(`lobby-drawer-cat-${id}`);
      // Sanity: confirm we pinned the actual <button> row (matches
      // the W1978 tag pin) so a future restructure that moved the
      // testid onto a non-button wrapper can't pass this assertion
      // vacuously against, e.g., a wrapping <div>.
      expect(link.tagName).toBe("BUTTON");
      // The actual contract: no inline `style` attribute on the
      // per-row button. Use `hasAttribute` rather than reading
      // `.style` — `HTMLElement.style` is always a non-null
      // CSSStyleDeclaration even when the attribute is absent, so
      // a `.style` truthiness check would be vacuously true. An
      // empty `style=""` would still be a (broken) inline-style
      // surface and must trip this pin.
      expect(link.hasAttribute("style")).toBe(false);
    }
  });
});
