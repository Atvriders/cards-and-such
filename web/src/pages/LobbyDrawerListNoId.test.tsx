import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2425 — the desktop category drawer's inner category-list element
 * (the `<nav role="tablist" class="lobby-drawer-nav">` wrapping every
 * `lobby-drawer-cat-*` button) MUST NOT carry an `id` attribute. This
 * inner nav is the navigational surface that DrawerLink rows live in;
 * it is reached externally only via DOM traversal from the outer
 * aside's stable `data-testid="lobby-drawer"` and via its
 * accessible-name `aria-label="Filter by category (drawer)"` — there
 * is no fragment-link target, no `aria-labelledby` pointer, and no
 * skip-link that depends on a known id.
 *
 * Sibling pins on this same inner `<nav>`:
 *   - W1311 / LobbyDrawerNavClass.test.tsx pins `tagName === "NAV"`
 *     and `classList.contains("lobby-drawer-nav")`.
 *   - W1385 / LobbyDrawerNavMulti.test.tsx pins ABSENCE of
 *     `aria-multiselectable` (single-select tablist semantics).
 *   - LobbyPage.test.tsx queries the nav via
 *     `getByRole("tablist", { name: /Filter by category \(drawer\)/i })`
 *     so its `role="tablist"` and `aria-label` are pinned by the
 *     keyboard / focus-traversal tests there.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on
 * this inner nav. A future refactor that introduced e.g.
 * `id="lobby-drawer-nav"` would silently:
 *   1. Create a stable URL fragment target (`/#lobby-drawer-nav`)
 *      that external links and bookmarks could come to depend on,
 *      making it an undeclared part of the public contract.
 *   2. Enable `aria-labelledby` / `aria-controls` from elsewhere on
 *      the page to point at the drawer's tablist, coupling sibling
 *      components to an attribute this codebase has deliberately not
 *      advertised — the nav is currently named via direct
 *      `aria-label` ONLY.
 *   3. Risk an id collision with the sibling chip-strip tablist (which
 *      shares `role="tablist"` but lives outside the drawer aside) or
 *      with any of the per-row `lobby-drawer-cat-*` testids, which
 *      jsdom / browsers tolerate at render time but which breaks
 *      `getElementById` and fragment scrolling.
 *
 * One focused assertion: the inner drawer category-list nav MUST NOT
 * carry an `id` attribute. If a future change deliberately needs one,
 * that change should add the new `id` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) to follow the
 * established pattern in this directory and avoid merge churn on the
 * mega-file.
 */
describe("LobbyPage — drawer category-list nav has no id attribute (W2425)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Drawer is desktop-only (>=1024px). Mirror the W1311 / W1385
    // siblings: widen jsdom's innerWidth above the breakpoint AND
    // stub matchMedia so the lobby's `(min-width: 1024px)` query
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

  it("the inner drawer category-list <nav> does NOT carry an id attribute", () => {
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
    // descendant carried the role="tablist" could pass the id
    // assertion vacuously on a different element.
    expect(nav.tagName).toBe("NAV");
    expect(nav.classList.contains("lobby-drawer-nav")).toBe(true);

    // The actual contract: no `id` attribute on the inner drawer
    // category-list nav. Use `hasAttribute` rather than checking for
    // empty string — an `id=""` would still be a (broken) public
    // surface, and `getAttribute` would return "" (falsy) and let
    // such a regression slip through.
    expect(nav.hasAttribute("id")).toBe(false);
  });
});
