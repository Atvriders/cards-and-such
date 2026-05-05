import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1931 — the desktop category drawer's outer `<aside>` element MUST
 * NOT carry an explicit `role` attribute. The HTML `<aside>` element
 * already maps to the implicit ARIA landmark role `"complementary"`,
 * so adding e.g. `role="complementary"` would be redundant, and
 * adding `role="navigation"` / `role="region"` would silently change
 * the landmark category that screen-reader users iterate with their
 * landmark / rotor shortcuts.
 *
 * Sibling pins on this same `<aside>`:
 *   - W1167 / LobbyDrawerAside.test.tsx pins `tagName === "ASIDE"`
 *     and `aria-label === "Lobby categories"`.
 *   - LobbyDrawerAsideClass.test.tsx pins the `lobby-drawer` class.
 *
 * What none of those cover is the ABSENCE of a `role` attribute. A
 * well-meaning refactor — for example, "let's be explicit and add
 * role='complementary'", or worse "let's promote this to
 * role='navigation' since it has nav inside" — would not break any
 * existing assertion but WOULD change how the landmark surfaces in
 * AT. This file pins exactly that contract: the aside relies on its
 * implicit role and carries no explicit override.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established pattern in this directory and avoid merge churn on the
 * mega-file.
 */
describe("LobbyPage — drawer aside has no explicit role attribute (W1931)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1167 / W1134
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

  it("the outer drawer aside has no explicit role attribute (relies on implicit complementary)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the stable testid — see W1167's note for why this is
    // the right anchor for assertions about the aside's attributes.
    const aside = screen.getByTestId("lobby-drawer");

    // Sanity-check that we DID find the right element — without this
    // a future refactor that moved the testid onto a `<div>` would
    // make the role-absence assertion vacuously true.
    expect(aside.tagName).toBe("ASIDE");

    // The actual contract: no explicit role override.
    expect(aside.hasAttribute("role")).toBe(false);
  });
});
