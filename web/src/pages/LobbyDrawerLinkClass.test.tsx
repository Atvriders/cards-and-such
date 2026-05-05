import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1875 — every desktop drawer category row (`DrawerLink`) renders a
 * `<button>` whose `className` is computed from a single template
 * literal: ``lobby-drawer-link${active ? " is-active" : ""}``. The
 * stylesheet (`web/src/pages/LobbyPage.css`) attaches the row's
 * padding, glyph/label/count grid, and active-state highlight to
 * these EXACT class strings — `.lobby-drawer-link` for layout, the
 * `.is-active` modifier for the selected-row treatment. A refactor
 * that:
 *   - swapped the base hook (`lobby-drawer-row`, `drawer-link`, …),
 *   - or appended an extra incidental class (`"lobby-drawer-link "
 *     + "lobby-drawer-link-collapsed"`),
 *   - or tacked the active modifier on as a separate prefix
 *     (`"is-active lobby-drawer-link"`),
 * would all silently break the drawer's visual contract while every
 * existing sibling assertion (testid, role, aria-label, glyph span)
 * still passed.
 *
 * Existing sibling pins for the drawer:
 *   - W1311 / LobbyDrawerNavClass     — outer `<nav>` `lobby-drawer-nav`.
 *   - W1167 / LobbyDrawerAside        — outer `<aside>` aria-label.
 *   - W1239 / LobbyDrawerSep          — decorative separator.
 *   - W1348 / LobbyDrawerLinkGlyph    — inner glyph span aria-hidden.
 *   - W625  / LobbyPage.test.tsx      — aria-selected / aria-current swap.
 *
 * What none of those pin: the OUTER drawer-row button's exact full
 * `className` string — including the conditional `" is-active"`
 * suffix on the currently-selected row. This file fills exactly that
 * gap with strict `===` equality on every drawer-link in the default
 * (filter === "all") render: 1 "all" row + 5 categories
 * (solitaire / cards / dice / board / arcade) + 3 status rows
 * (favorites / top-rated / recently-played) = 9 links total. The
 * "all" row is active by default (no persisted filter in
 * localStorage → `readPersistedFilter()` returns "all"), so its
 * className must include the `is-active` suffix; every other row
 * must be the bare base class.
 */
describe("LobbyPage — drawer-link className exact equality (W1875)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1311 / W1348 /
    // W1167 siblings: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer
    // aside (and its rows) would never mount and the test would fail
    // for the wrong reason.
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

  it("every drawer-link button renders with the exact computed className (active = \"lobby-drawer-link is-active\", inactive = \"lobby-drawer-link\")", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // The drawer renders 9 rows in this order; pinning the order also
    // guards against accidental reorderings that would shift the
    // active row away from "all".
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
      // `.className` (not `.classList`) so the assertion catches any
      // extra/missing class, ordering swap, or stray whitespace —
      // exactly the contract the JSX template literal produces.
      const expected = id === "all"
        ? "lobby-drawer-link is-active"
        : "lobby-drawer-link";
      expect(link.className).toBe(expected);
    }
  });
});
