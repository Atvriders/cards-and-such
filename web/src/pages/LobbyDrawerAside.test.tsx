import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1167 — the desktop category drawer is rendered as a top-level
 * `<aside>` landmark element, and that aside carries an explicit
 * `aria-label="Lobby categories"` so AT users iterating landmarks
 * with rotor / "next region" shortcuts hear a meaningful name
 * instead of just "complementary region". Without this label the
 * drawer would still be a landmark (every `<aside>` is implicitly
 * `role="complementary"`), but it would be indistinguishable from
 * any other aside on a page that contained more than one — and on
 * smaller landing pages the aside is the FIRST landmark a screen
 * reader user encounters before the main hero, so a missing or
 * empty name there is the difference between "skip to the
 * categories" and "skip to … something?".
 *
 * Existing sibling pins:
 *   - W1134 / LobbyDrawerToggleLabel.test.tsx pins the toggle button's
 *     aria-label / title / glyph swap.
 *   - W1150 / LobbyChipStripAria.test.tsx pins the chip-strip tablist
 *     aria-label.
 *   - LobbyPage.test.tsx pins the inner `<nav role="tablist">`'s
 *     "Filter by category (drawer)" aria-label.
 *
 * The OUTER aside's own aria-label has never been pinned — a refactor
 * that moved the label down to the nav (or dropped it entirely under
 * the assumption that the nav covered it) would silently regress
 * landmark navigation without breaking any current test. This file
 * fills exactly that gap with a single focused assertion.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established pattern in this directory and avoid merge churn on the
 * mega-file.
 */
describe("LobbyPage — drawer aside aria-label (W1167)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1134 / W908
    // siblings: widen jsdom's innerWidth above the breakpoint AND
    // stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer
    // aside would not mount at all and the test would always fail
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

  it("the outer drawer aside carries aria-label=\"Lobby categories\"", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the stable testid rather than a role query: `<aside>`
    // resolves to role="complementary" implicitly, but the test must
    // not depend on that mapping (a future refactor could legitimately
    // move to role="navigation" without breaking the contract this
    // test pins, which is the *name* the landmark exposes).
    const aside = screen.getByTestId("lobby-drawer");

    // Confirm we really did pin the OUTER aside — not the inner nav,
    // which has its own (different) aria-label "Filter by category
    // (drawer)" already pinned by LobbyPage.test.tsx.
    expect(aside.tagName).toBe("ASIDE");
    expect(aside).toHaveAttribute("aria-label", "Lobby categories");
  });
});
