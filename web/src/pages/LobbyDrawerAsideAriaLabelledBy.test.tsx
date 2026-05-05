import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1934 — pins the ABSENCE of `aria-labelledby` on the desktop drawer's
 * outer `<aside data-testid="lobby-drawer">` element.
 *
 * The drawer aside is currently named via a DIRECT `aria-label="Lobby
 * categories"` (covered by W1167 / LobbyDrawerAside.test.tsx). It does
 * NOT carry an `aria-labelledby` pointer to a heading id, and that
 * choice is intentional and load-bearing:
 *
 *   1. ARIA's name-computation precedence resolves `aria-labelledby`
 *      BEFORE `aria-label`. If a refactor adds an `aria-labelledby`
 *      pointing at, e.g., a heading whose id changes per route or which
 *      doesn't render in some viewport states, the aside's accessible
 *      name silently flips from the stable "Lobby categories" string
 *      to either the heading text or "" (if the referenced id is
 *      missing) — without breaking the W1167 aria-label assertion,
 *      because that test only checks the literal attribute, not the
 *      computed name.
 *
 *   2. The drawer has no associated visible heading element inside the
 *      aside (the nav's tablist label "Filter by category (drawer)" is
 *      not a heading and is not visually rendered as one). Adding an
 *      `aria-labelledby` here would either dangle (no target) or
 *      require introducing a new visible/SR-only heading — a much
 *      larger structural change that should be caught explicitly.
 *
 *   3. Sibling W1167 covers tagName + aria-label; W1917 covers
 *      className; W1927 noted aria-label is covered. None of these
 *      pin the absence of `aria-labelledby`, so a regression that
 *      adds the attribute (and thereby overrides the aria-label name
 *      computation) is currently invisible to the suite.
 *
 * One focused assertion: the outer drawer aside MUST NOT carry an
 * `aria-labelledby` attribute. If product later wants to switch to
 * a heading-driven name, this test should be updated *together with*
 * the new heading element and its id, making the trade-off explicit.
 */
describe("LobbyPage — drawer aside aria-labelledby absence (W1934)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Mirror the W1167 sibling so
    // jsdom resolves the `(min-width: 1024px)` media query as desktop
    // and the aside actually mounts — otherwise the test would fail
    // for the wrong reason (missing element, not missing attribute).
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

  it("the outer drawer aside does NOT carry an aria-labelledby attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const aside = screen.getByTestId("lobby-drawer");

    // Sanity: confirm we pinned the OUTER aside, same anchor as W1167.
    // Without this, a future restructure that renames the testid onto
    // a non-aside wrapper could pass this assertion vacuously.
    expect(aside.tagName).toBe("ASIDE");

    // The actual pin: aria-labelledby must be absent so the
    // direct aria-label="Lobby categories" remains the source of the
    // accessible name (ARIA name-computation order: labelledby > label).
    expect(aside.hasAttribute("aria-labelledby")).toBe(false);
  });
});
