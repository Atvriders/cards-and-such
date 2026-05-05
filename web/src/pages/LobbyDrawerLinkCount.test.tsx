import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1952 — the desktop category drawer renders exactly NINE category
 * `<DrawerLink>` rows: the synthetic "all" entry, the five real game
 * categories declared in `CATEGORY_ORDER` (solitaire, cards, dice,
 * board, arcade), then a decorative `<div class="lobby-drawer-sep">`
 * separator, then the three "smart" rows (favorites, top-rated,
 * recently-played). Each row stamps a stable `data-testid` of the form
 * `lobby-drawer-cat-<id>`.
 *
 * Many sibling tests already query individual rows by their full
 * test-id (LobbyDrawerLinkClass, LobbyDrawerLinkAriaCurrent,
 * LobbyDrawerLinkGlyph, LobbyDrawerEnter, LobbyDrawerRowAriaLabel,
 * and the legacy assertions inside LobbyPage.test.tsx). What none of
 * them pin is the TOTAL COUNT — i.e. nothing currently catches a
 * refactor that silently adds a tenth row (e.g. a new "trending" or
 * "new" smart category) or drops one of the existing nine. The drawer
 * order is also mirrored by `drawerOrder` (consumed by
 * `onDrawerKeyDown` for ↑/↓ roving-tabindex traversal), so an
 * accidental count drift between the visible rows and the keyboard
 * order would corrupt drawer arrow-key navigation.
 *
 * This file fills exactly that gap with a single focused assertion:
 * `document.querySelectorAll('[data-testid^="lobby-drawer-cat-"]')`
 * must have `length === 9`. Lives in a NEW SIBLING file (not
 * LobbyPage.test.tsx) to follow the established convention in this
 * directory.
 */
describe("LobbyPage — drawer renders exactly 9 category links (W1952)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Widen jsdom's innerWidth
    // above the breakpoint AND stub matchMedia so the lobby's
    // `(min-width: 1024px)` query resolves "desktop" before render —
    // otherwise the drawer aside (and its nine `<DrawerLink>`
    // children) never mount and the count would be zero for the
    // wrong reason.
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

  it("queries `[data-testid^=\"lobby-drawer-cat-\"]` and finds exactly 9", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Scope to the drawer aside so we don't accidentally double-count
    // any future component that happens to reuse the same test-id
    // prefix outside the drawer. The aside is anchored by its stable
    // `lobby-drawer` testid (same anchor used by the
    // LobbyDrawerNavMulti / LobbyDrawerAside sibling tests).
    const aside = screen.getByTestId("lobby-drawer");
    const rows = aside.querySelectorAll<HTMLElement>(
      '[data-testid^="lobby-drawer-cat-"]',
    );
    expect(rows.length === 9).toBe(true);
  });
});
