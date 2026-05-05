import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1892 — desktop drawer category row (`DrawerLink`) computes its
 * `aria-current` attribute as `active ? "true" : undefined`
 * (LobbyPage.tsx ~L2517). React's JSX semantics treat an `undefined`
 * attribute as "do not render the attribute at all" — so on the
 * default render only the active row ("all") carries an
 * `aria-current` attribute, and every other drawer-link button has NO
 * `aria-current` attribute on the DOM node (NOT `aria-current="false"`,
 * NOT `aria-current=""`, the attribute is simply absent).
 *
 * Why this matters: the CSS rule on `[aria-current="true"]` paints
 * the active-row highlight (see comment at LobbyPage.tsx ~L2509), and
 * assistive tech relies on `aria-current` being absent on the
 * non-current items to announce the selection correctly. A refactor
 * that:
 *   - emitted `aria-current="false"` on inactive rows, or
 *   - emitted `aria-current="page"` (a valid token, but not the one
 *     the CSS selector matches), or
 *   - dropped the active stamp entirely and relied solely on the
 *     `aria-selected` pair,
 * would silently break the drawer's announce/paint contract while
 * the existing sibling pins still passed.
 *
 * Existing sibling pins for the drawer:
 *   - W1875 / LobbyDrawerLinkClass.test.tsx — exact `className` per row,
 *     including the `is-active` suffix on the active row.
 *   - W625  / LobbyPage.test.tsx ~L519     — aria-current="true" stamp
 *     after a click flips the active row.
 *   - W812 / W908 / LobbyDrawerEnter.test.tsx — Space/Enter activation
 *     also stamps aria-current="true" on the focused row.
 *
 * What none of those pin: that on the DEFAULT render, the eight
 * NON-active drawer rows DO NOT carry an `aria-current` attribute at
 * all. Every existing aria-current pin only checks the positive ("true"
 * after activation) case. This file fills exactly that gap by asserting
 * BOTH halves of the conditional in `aria-current={active ? "true" :
 * undefined}` on the same render: the "all" row has aria-current="true",
 * and each of the other 8 rows has `hasAttribute("aria-current") ===
 * false`.
 */
describe("LobbyPage — drawer-link aria-current attribute (W1892)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1875 / W908 / W812
    // sibling drawer tests: widen jsdom's innerWidth above the
    // breakpoint AND stub matchMedia so the lobby's
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

  it("active drawer-link has aria-current=\"true\"; every inactive drawer-link has NO aria-current attribute on the DOM node", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Default render: localStorage is empty so `readPersistedFilter()`
    // resolves "all" — the "all" row is the sole active drawer-link.
    // The other 8 rows (5 categories + 3 status) must therefore all
    // emit `aria-current=undefined`, which React renders as the
    // attribute being absent on the DOM node.
    const activeRow = screen.getByTestId("lobby-drawer-cat-all");
    expect(activeRow).toHaveAttribute("aria-current", "true");

    const inactiveIds = [
      "solitaire",
      "cards",
      "dice",
      "board",
      "arcade",
      "favorites",
      "top-rated",
      "recently-played",
    ] as const;

    for (const id of inactiveIds) {
      const link = screen.getByTestId(`lobby-drawer-cat-${id}`);
      // `hasAttribute` (not `getAttribute === null`) so a regression
      // that emits `aria-current=""` or `aria-current="false"` still
      // fails — both of those would round-trip through getAttribute as
      // a non-null string but would equally break the CSS selector
      // `[aria-current="true"]` that paints the active highlight.
      expect(link.hasAttribute("aria-current")).toBe(false);
    }
  });
});
