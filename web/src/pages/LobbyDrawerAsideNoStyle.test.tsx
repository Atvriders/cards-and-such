import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2122 — the LobbyPage drawer `<aside data-testid="lobby-drawer">`
 * (LobbyPage.tsx ~L1752) MUST NOT carry an inline `style` attribute.
 * Its visual presentation — width, position, collapsed state — is owned
 * entirely by the `.lobby-drawer` stylesheet rules and the public
 * `data-collapsed` attribute hook, not by any inline style prop.
 *
 * Sibling pins on this same drawer aside cover other surface attributes:
 *   - LobbyDrawerAsideClass.test.tsx     pins exact className string
 *   - LobbyDrawerAsideNoId.test.tsx      pins absence of `id`
 *   - LobbyDrawerAsideNoRole.test.tsx    pins absence of `role`
 *   - LobbyDrawerAsideAriaLabelledBy.test.tsx pins absence of aria-labelledby
 *   - LobbyDrawerWidth.test.tsx          pins `style.width` reflection only
 *
 * Critically, LobbyDrawerWidth.test.tsx inspects the `.style.width`
 * DOM reflection (which yields "" when the attribute is absent OR when
 * the attribute exists but doesn't set width). It does NOT pin absence
 * of the `style` attribute itself. A regression that added e.g.
 * `style={{ "--drawer-bg": "var(--surface)" }}` or
 * `style={{ transform: "translateX(0)" }}` for animation would slip past
 * every existing drawer-aside guard while still:
 *
 *   1. Bypassing the established stylesheet contract for the drawer,
 *      making theme/dark-mode/print overrides in CSS impossible to
 *      apply without `!important` workarounds.
 *   2. Coupling render output to per-render JS measurement (e.g. reading
 *      `window.innerWidth` during render to inline a width), reintroducing
 *      layout-thrash patterns the current persisted-width design avoids
 *      via a one-shot localStorage seed.
 *   3. Defeating CSP `style-src 'self'` policies that disallow inline
 *      styles, which this app is free to adopt today precisely because
 *      the drawer aside carries no inline style.
 *
 * One focused assertion: `aside.hasAttribute("style") === false`. If a
 * future change deliberately needs an inline style on the drawer (e.g.
 * JS-driven resize handle wiring `style.width`), it should add the new
 * attribute AND update this pin in the same commit, making the trade-off
 * explicit.
 *
 * Lives in a NEW SIBLING file following the established
 * LobbyChipStripNoStyle / LobbyDrawerAside* pattern so it shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the LobbyPage mega-file.
 */
describe("LobbyPage — drawer aside has no inline style attribute (W2122)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the lobby-drawer aside does NOT carry a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the stable testid hook. getByTestId throws on miss,
    // so we get a clear failure if the drawer aside is renamed or
    // removed entirely (which would invalidate this pin's premise).
    const aside = screen.getByTestId("lobby-drawer");

    // Sanity: confirm we pinned the actual <aside> element and not
    // a descendant that happens to share the testid via DOM cloning
    // or a wrapper rename. Without this guard a future restructure
    // that moved the testid onto a `<div>` could pass this assertion
    // while silently changing the semantic landmark contract.
    expect(aside.tagName).toBe("ASIDE");

    // The actual contract: no `style` attribute on the drawer aside.
    // Use `hasAttribute` rather than inspecting `.style.cssText` or
    // `.style.width` — an empty `style=""` (or one that sets only a
    // CSS custom property) would still be a public surface that future
    // code or CSP-violation reporters could come to depend on, and the
    // existing `LobbyDrawerWidth.test.tsx` already covers the `.style.width`
    // reflection narrowly. This pin covers the attribute itself.
    expect(aside.hasAttribute("style")).toBe(false);
  });
});
