import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1295 — every per-category row in the desktop left-drawer (`<DrawerLink>`)
 * MUST expose an `aria-label` of the exact form
 *   `${label} — ${count.toLocaleString()} games`
 * so screen-reader users hear both the category name AND the catalog count
 * when the row receives focus, even when the drawer is collapsed and the
 * visible label/count spans are clipped to icon-only.
 *
 * Sibling pins:
 *   - W1167 / LobbyDrawerAside.test.tsx pins the outer aside aria-label.
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the toggle's aria-label.
 *   - W1239 / LobbyDrawerSep.test.tsx pins the decorative separator.
 *   - LobbyPage.test.tsx pins the row's aria-selected / aria-current pair.
 *
 * The drawer-row aria-label format itself has never been pinned — a
 * refactor that swapped the em-dash for a hyphen, dropped " games", or
 * removed the digit grouping (`toLocaleString`) would silently regress
 * the AT contract without breaking any existing test. This file fills
 * exactly that gap by asserting the literal regex on the "all" row,
 * which has the most stable count (always GAMES.length).
 */
describe("LobbyPage — drawer row aria-label format (W1295)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Mirror the sibling drawer tests:
    // widen jsdom's innerWidth AND stub matchMedia so the lobby's
    // `(min-width: 1024px)` query resolves "desktop" before render —
    // without this the drawer aside (and its rows) would never mount.
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

  it("stamps `${label} — ${count.toLocaleString()} games` on the All row", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const all = screen.getByTestId("lobby-drawer-cat-all");
    const aria = all.getAttribute("aria-label") ?? "";

    // Pin the exact production format: "<label> — <localised-count> games".
    // The em-dash (U+2014) is part of the contract — a hyphen would be a
    // visual/AT regression. The count is `toLocaleString()`-formatted, so
    // a four-digit catalog renders as e.g. "1,234" not "1234". The trailing
    // " games" suffix gives the AT announcement a noun so the row reads
    // naturally instead of "All — 1,234".
    expect(aria).toMatch(/^.+ — [\d,]+ games$/);
    // And specifically: the leading segment is the All-games label, not
    // a category glyph or testid leak.
    expect(aria.startsWith("All games")).toBe(true);
    // Suffix is literal " games" (lowercase, single space) — not "Games"
    // or "items" or any other refactor drift.
    expect(aria.endsWith(" games")).toBe(true);
  });
});
