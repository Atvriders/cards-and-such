import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1385 — the desktop category drawer's inner `<nav role="tablist">`
 * is a SINGLE-selection tablist: at any given moment exactly one
 * category row carries `aria-selected="true"` (the active filter), and
 * clicking another row swaps the selection rather than adding to it.
 * The ARIA contract for that single-selection mode is communicated by
 * the ABSENCE of `aria-multiselectable` on the tablist container — a
 * tablist with `aria-multiselectable="true"` would tell assistive tech
 * that consumers can hold multiple tabs selected concurrently, which
 * would directly contradict the lobby's filter-state model (one
 * `filter` string, mutually-exclusive categories).
 *
 * Existing sibling pins:
 *   - W1167 / LobbyDrawerAside.test.tsx pins the OUTER `<aside>`'s
 *     `aria-label="Lobby categories"` and `tagName === "ASIDE"`.
 *   - W1311 / LobbyDrawerNavClass.test.tsx pins the inner nav's
 *     `tagName === "NAV"` and `className="lobby-drawer-nav"`.
 *   - LobbyPage.test.tsx pins the inner nav's
 *     `role="tablist"` and `aria-label="Filter by category (drawer)"`.
 *   - W1239 / LobbyDrawerSep.test.tsx pins the decorative separator.
 *
 * The single-selection invariant — i.e. the absence of
 * `aria-multiselectable` on the drawer tablist — has never been pinned.
 * A future refactor that introduces a "select multiple categories"
 * affordance and adds `aria-multiselectable="true"` to this nav would
 * silently change the announced semantics for every screen-reader user
 * walking the drawer with arrow keys, without tripping any other test.
 * This file fills exactly that gap with one focused assertion.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established convention in this directory.
 */
describe("LobbyPage — drawer tablist is single-select (W1385)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Mirror the W1311 sibling:
    // widen jsdom's innerWidth above the breakpoint AND stub
    // matchMedia so the lobby's `(min-width: 1024px)` query resolves
    // "desktop" before render — without this the drawer aside (and its
    // nav child) would never mount and the test would fail for the
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

  it("the drawer tablist nav does NOT carry aria-multiselectable", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the outer aside via the stable testid, then drill
    // into the single nav[role="tablist"] child. Scoping inside the
    // aside disambiguates from the sibling chip-strip tablist (which
    // is NOT inside the drawer aside and which carries its own
    // distinct aria-label).
    const aside = screen.getByTestId("lobby-drawer");
    const nav = aside.querySelector('nav[role="tablist"]') as HTMLElement | null;
    expect(nav).not.toBeNull();
    if (!nav) return;

    // The single-selection contract is communicated by the ABSENCE of
    // the attribute (per the W3C ARIA spec, default for
    // aria-multiselectable on a tablist is false). Pin BOTH the
    // hasAttribute() probe AND the explicit getAttribute() value so
    // that:
    //   - hasAttribute === false catches a refactor that adds the
    //     attribute at all (even with `false` or empty string),
    //   - getAttribute === null double-locks the same invariant via
    //     the standard DOM accessor (defence-in-depth).
    expect(nav.hasAttribute("aria-multiselectable")).toBe(false);
    expect(nav.getAttribute("aria-multiselectable")).toBeNull();
  });
});
