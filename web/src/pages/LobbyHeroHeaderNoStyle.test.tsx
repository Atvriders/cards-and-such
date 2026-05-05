import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2164 — the LobbyPage hero `<header className="lobby-hero">` element
 * (rendered around line 1846 of LobbyPage.tsx, wrapping the decorative
 * orbs, eyebrow, `<h1>` title, subheading, and `.lobby-hero-stats` row)
 * MUST NOT carry an inline `style` attribute.
 *
 * Sibling pins on this same hero header:
 *   - W1888 / LobbyHeroHeaderClass.test.tsx pins `className === "lobby-hero"`
 *     exactly (no modifier suffixes / state tokens / trailing whitespace).
 *   - W2090 / LobbyHeroHeaderNoId.test.tsx pins the absence of an `id`
 *     attribute on the same `<header>`.
 *   - W1420 / LobbyHeroOrbs.test.tsx pins the two decorative orb children.
 *   - W1223 / LobbyHeroPulse.test.tsx pins the eyebrow pulse dot.
 *
 * What none of those cover is the ABSENCE of an inline `style` attribute
 * on the outer hero `<header>` element. The hero's gradient, radius, and
 * layout are entirely owned by `LobbyPage.css` keyed off the
 * `.lobby-hero` className. A future refactor that introduced an inline
 * style (e.g. `style={{ background: ... }}` driven by a runtime token,
 * or a `style={{ "--hero-tint": ... } as React.CSSProperties}` custom
 * property) would silently:
 *   1. Bypass the stylesheet's specificity, defeating theme overrides
 *      and dark-mode media queries that target `.lobby-hero` from CSS.
 *   2. Couple the hero's chrome to JS state, making SSR/hydration
 *      mismatches possible if the inline value is computed from
 *      browser-only APIs (matchMedia, window.innerWidth, Date.now()).
 *   3. Make Content-Security-Policy `style-src 'self'` configurations
 *      reject the page unless `'unsafe-inline'` is added to the policy
 *      — a security regression that would not surface in unit tests.
 *
 * One focused assertion: the hero `<header className="lobby-hero">` MUST
 * NOT carry a `style` attribute. If a future change deliberately needs
 * one, it should add the inline style AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 / W2090 pattern so the test shares
 * the `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — hero header has no inline style attribute (W2164)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the <header.lobby-hero> element does NOT carry a style attribute", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via tag + stable className. The className itself is
    // independent of the attribute under test (and is separately pinned
    // by W1888 / LobbyHeroHeaderClass), so this lookup remains valid
    // even if the className contract were to evolve.
    const hero = container.querySelector<HTMLElement>("header.lobby-hero");
    expect(hero).not.toBeNull();

    // Sanity: confirm we pinned the actual hero `<header>` and not, say,
    // a `.lobby-hero-stats` row or a nested `.lobby-hero-eyebrow` div
    // that happens to share a prefix. Without this guard a future
    // restructure that hoisted the className onto a different element
    // could pass this assertion vacuously.
    expect(hero!.tagName).toBe("HEADER");

    // The actual contract: no inline `style` attribute on the hero
    // header. Use `hasAttribute` rather than checking
    // `style.length === 0` — an explicit `style=""` would still be a
    // (broken) public surface that future code or CSP audits could
    // come to depend on, and only `hasAttribute` distinguishes the
    // never-set case from the set-to-empty case.
    expect(hero!.hasAttribute("style")).toBe(false);
  });
});
