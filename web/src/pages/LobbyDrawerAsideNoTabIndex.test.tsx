import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2192 — the desktop category drawer's outer `<aside>` element MUST
 * NOT carry an explicit `tabindex` attribute. The aside is a static
 * landmark wrapper; focus management lives on its descendants — the
 * `.lobby-drawer-toggle` button and the `[role=tab]` DrawerLink
 * children — which already coordinate roving `tabIndex={0|-1}` through
 * the `drawerFocusIdx` state.
 *
 * If somebody added `tabIndex={-1}` to the aside (to programmatically
 * focus it from outside) or `tabIndex={0}` (to make the landmark
 * itself a tab stop), keyboard users would suddenly find an extra
 * "empty" tab stop on the wrapper before reaching the actual roving
 * targets. None of the existing aside-attribute pins catch that:
 *
 *   - W1167 / LobbyDrawerAside.test.tsx pins `tagName === "ASIDE"`
 *     and `aria-label === "Lobby categories"`.
 *   - W1931 / LobbyDrawerAsideNoRole.test.tsx pins absence of `role`.
 *   - LobbyDrawerAsideNoId.test.tsx pins absence of `id`.
 *   - LobbyDrawerAsideNoStyle.test.tsx pins absence of inline `style`.
 *   - LobbyDrawerAsideAriaLabelledBy.test.tsx pins absence of
 *     `aria-labelledby` (so the direct `aria-label` wins).
 *   - LobbyDrawerAsideClass.test.tsx pins exact `className === "lobby-drawer"`.
 *   - W625 / LobbyPage.test.tsx pins the `data-collapsed` initial
 *     value and click-to-toggle behavior.
 *
 * What none of those cover is the ABSENCE of a `tabindex` attribute.
 * This file pins exactly that contract: the aside is not a tab stop
 * and never receives a programmatic-focus override on the wrapper.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established pattern in this directory and avoid merge churn on the
 * mega-file.
 */
describe("LobbyPage — drawer aside has no explicit tabindex attribute (W2192)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Match the W1167 / W1931 /
    // W1134 siblings: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
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

  it("the outer drawer aside has no explicit tabindex attribute (not itself a tab stop)", () => {
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
    // make the tabindex-absence assertion vacuously true (and would
    // also tell us nothing about the aside's keyboard contract).
    expect(aside.tagName).toBe("ASIDE");

    // The actual contract: no explicit tabindex override on the
    // wrapper. Roving focus is implemented on the descendant
    // `[role=tab]` DrawerLink elements via `drawerFocusIdx`, not on
    // the aside itself.
    expect(aside.hasAttribute("tabindex")).toBe(false);
  });
});
