import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2442 — the desktop category drawer's inner navigation element
 * (the `<nav role="tablist" class="lobby-drawer-nav">` wrapping every
 * `lobby-drawer-cat-*` button) MUST NOT carry an inline `style`
 * attribute. All visual presentation for this nav (the vertical
 * stacking layout, the gap between drawer rows, the collapsed-rail
 * width transitions) is owned by the `.lobby-drawer-nav` selector in
 * `web/src/pages/LobbyPage.css`. An inline style attribute on this
 * element would:
 *   1. Break the CSS-only theme contract by hard-coding presentation
 *      tokens that bypass the cascade — overriding any user agent /
 *      high-contrast / forced-colors stylesheet that targets the class.
 *   2. Silently shadow future stylesheet edits, since inline styles
 *      win against author rules without `!important`, making CSS
 *      refactors land "no-op" in jsdom-rendered output.
 *   3. Risk leaking per-render computed values (e.g. dynamic widths
 *      from JS measurements) into a snapshot-stable surface that this
 *      project's test suite treats as static.
 *
 * Sibling pins on this same inner `<nav>` element:
 *   - W1311 / LobbyDrawerNavClass.test.tsx pins `tagName === "NAV"`
 *     and `classList.contains("lobby-drawer-nav")`.
 *   - W1385 / LobbyDrawerNavMulti.test.tsx pins ABSENCE of
 *     `aria-multiselectable` (single-select tablist semantics).
 *   - W2425 / LobbyDrawerListNoId.test.tsx pins ABSENCE of `id`.
 *   - LobbyPage.test.tsx queries the nav via
 *     `getByRole("tablist", { name: /Filter by category \(drawer\)/i })`
 *     so its `role="tablist"` and `aria-label` are pinned by the
 *     keyboard / focus-traversal tests there.
 *
 * What none of those cover is the ABSENCE of a `style` attribute on
 * this inner nav. A future refactor that introduced inline styles
 * here (e.g. for collapsed-rail width transitions driven from JS)
 * would slip through every existing assertion. This file fills exactly
 * that gap with one focused assertion.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established convention in this directory and avoid merge churn on
 * the mega-file.
 */
describe("LobbyPage — drawer category-list nav has no inline style (W2442)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Mirror the W1311 / W1385 /
    // W2425 siblings: widen jsdom's innerWidth above the breakpoint
    // AND stub matchMedia so the lobby's `(min-width: 1024px)` query
    // resolves "desktop" before render — without this the drawer
    // aside (and its nav child) would never mount and the test would
    // fail for the wrong reason.
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

  it("the inner drawer category-list <nav> does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Anchor on the outer aside via its stable testid (W1167), then
    // drill into the single nav[role="tablist"] child. Scoping inside
    // the aside disambiguates from the sibling chip-strip tablist,
    // which is NOT inside the drawer aside and which carries its own
    // distinct aria-label.
    const aside = screen.getByTestId("lobby-drawer");
    const nav = aside.querySelector('nav[role="tablist"]') as HTMLElement | null;
    expect(nav).not.toBeNull();
    if (!nav) return;

    // Sanity: confirm we pinned the EXPECTED inner nav element — the
    // category-list wrapper carrying the lobby-drawer-nav class hook.
    // Without this guard, a future restructure that swapped which
    // descendant carried the role="tablist" could pass the style
    // assertion vacuously on a different element.
    expect(nav.tagName).toBe("NAV");
    expect(nav.classList.contains("lobby-drawer-nav")).toBe(true);

    // The actual contract: no `style` attribute on the inner drawer
    // category-list nav. Use `hasAttribute` rather than checking for
    // empty string — a `style=""` (which jsdom can produce when React
    // is handed an empty style prop) would still be a (broken) public
    // surface, and `getAttribute` would return "" (falsy) and let such
    // a regression slip through.
    expect(nav.hasAttribute("style")).toBe(false);
    expect(nav.getAttribute("style")).toBeNull();
  });
});
