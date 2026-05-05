import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2032 — every desktop drawer category row (`DrawerLink`) MUST NOT
 * carry an `id` attribute. The `<button>` element produced by
 * `DrawerLink` in `web/src/pages/LobbyPage.tsx` is intentionally
 * anchored externally only by `data-testid="lobby-drawer-cat-<id>"`
 * (used by W1978's tag pin, the W1875 className pin, the keyboard
 * roving-tabindex walker, and the click→aria-selected flow). It has
 * NO `id` attribute today.
 *
 * Sibling pins on this same per-row `<button>`:
 *   - W1978 / LobbyDrawerLinkTag.test.tsx pins `tagName === "BUTTON"`
 *     for all 9 rows.
 *   - W1875 / LobbyDrawerLinkClass.test.tsx pins exact `className`.
 *   - LobbyDrawerLinkAriaCurrent.test.tsx pins `aria-current` swap.
 *   - LobbyDrawerLinkCount.test.tsx pins the count child span and
 *     the queried node count of 9.
 *   - LobbyDrawerLinkGlyph.test.tsx pins the glyph child span.
 *   - LobbyDrawerRowAriaLabel.test.tsx pins `aria-label` text.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on
 * the per-row button. A future refactor that introduced e.g.
 * `id={`drawer-cat-${id}`}` would silently:
 *   1. Create stable URL-fragment targets (`/#drawer-cat-solitaire`,
 *      etc.) that external links / bookmarks could come to depend
 *      on, making them an undeclared part of the public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from elsewhere
 *      on the page to point at individual drawer rows, coupling
 *      sibling components to per-row identifiers this codebase has
 *      deliberately not advertised.
 *   3. Risk id collisions across the 9 rows (e.g. duplicate `id`
 *      values from a copy-paste bug), which jsdom / browsers tolerate
 *      at render time but which break `getElementById`.
 *
 * One focused assertion per row: each drawer-cat-* button MUST NOT
 * carry an `id` attribute. Mirrors the W2023 pattern from
 * LobbyDrawerAsideNoId.test.tsx but applied per-row across all 9.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established pattern in this directory and avoid merge churn on the
 * mega-file.
 */
describe("LobbyPage — drawer-link rows have no id attribute (W2032)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1978 / W2023
    // siblings: widen jsdom's innerWidth above the breakpoint AND
    // stub matchMedia so the lobby's `(min-width: 1024px)` query
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

  it("every `[data-testid^=\"lobby-drawer-cat-\"]` button has hasAttribute(\"id\") === false", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Pin the full set explicitly (mirrors W1978's enumeration) so a
    // future row rename or reordering doesn't silently shrink this
    // assertion. Order mirrors the visual render order in
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
      // The actual contract: no `id` attribute on the per-row
      // button. Use `hasAttribute` rather than checking for empty
      // string — an `id=""` would still be a (broken) public
      // surface and must trip this pin.
      expect(link.hasAttribute("id")).toBe(false);
    }
  });
});
