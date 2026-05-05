import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2363 — every desktop drawer category row (`DrawerLink`) is rendered
 * as `<button type="button" …>` in `web/src/pages/LobbyPage.tsx`. The
 * explicit `type="button"` is load-bearing for two reasons:
 *
 *   1. A bare `<button>` inside a form defaults to `type="submit"`. The
 *      lobby is not currently inside a `<form>`, but the drawer is the
 *      kind of nav surface that often gets relocated; if a future
 *      refactor wraps any ancestor in a `<form>` (search, filter, etc.)
 *      AND the explicit `type` regresses, every drawer click would fire
 *      a phantom form submission alongside the filter change.
 *   2. The roving-tabindex / Enter-to-activate flow on the drawer
 *      assumes the row is a button that activates on Enter/Space
 *      without bubbling submission semantics.
 *
 * Existing sibling pins for the drawer-link element:
 *   - LobbyDrawerLinkTag.test.tsx (W1978)         — tagName === "BUTTON"
 *   - LobbyDrawerLinkClass.test.tsx (W1875)       — exact className
 *   - LobbyDrawerLinkAriaCurrent.test.tsx         — aria-current swap
 *   - LobbyDrawerLinkCount.test.tsx               — count-suffix span
 *   - LobbyDrawerLinkGlyph.test.tsx               — glyph aria-hidden
 *   - LobbyDrawerRowAriaLabel.test.tsx            — aria-label text
 *   - LobbyDrawerLinkNoId.test.tsx                — no `id` attribute
 *   - LobbyDrawerLinkNoStyle.test.tsx             — no inline style
 *   - LobbyPage.test.tsx (W644)                   — click → aria-selected
 *
 * What none of those pin: the row's `type` attribute. A `<button>` with
 * `tagName === "BUTTON"` and the right className still defaults to
 * `type="submit"` if the JSX `type="button"` prop is dropped. This file
 * fills exactly that gap with strict equality on `getAttribute("type")`
 * for all 9 drawer rows in the default render.
 */
describe("LobbyPage — drawer-link type=\"button\" (W2363)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the sibling drawer-link
    // pins: widen jsdom's innerWidth above the breakpoint AND stub
    // matchMedia so the lobby's `(min-width: 1024px)` query resolves
    // "desktop" before render — without this the drawer aside (and its
    // rows) would never mount and the test would fail for the wrong
    // reason.
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

  it("every `[data-testid^=\"lobby-drawer-cat-\"]` element has type=\"button\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Pin the full set explicitly (not just the queried node count) so
    // a future ID rename / reordering doesn't silently shrink the
    // assertion. Order mirrors the visual render order in
    // LobbyPage.tsx (categories first, then favorites/top-rated/
    // recently-played status rows).
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
      // Use getAttribute (not the .type IDL reflection) so a missing
      // attribute reads back as `null` instead of the spec-default
      // "submit" — this catches BOTH a regression that drops the
      // explicit prop AND one that mis-types it (e.g. type="reset").
      expect(link.getAttribute("type")).toBe("button");
    }
  });
});
