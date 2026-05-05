import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2393 — the LobbyPage hero `<header className="lobby-hero">` element
 * (rendered around line 1846 of LobbyPage.tsx, wrapping the decorative
 * orbs, eyebrow, `<h1>` title, subheading, and `.lobby-hero-stats` row)
 * MUST NOT carry an explicit `role` attribute.
 *
 * Sibling pins on this same hero header:
 *   - W1888 / LobbyHeroHeaderClass.test.tsx pins `className === "lobby-hero"`
 *     exactly (no modifier suffixes / state tokens / trailing whitespace).
 *   - W2090 / LobbyHeroHeaderNoId.test.tsx pins `id` absence on the hero
 *     header.
 *   - W2164 / LobbyHeroHeaderNoStyle.test.tsx pins `style` absence on the
 *     hero header.
 *   - W2236 / LobbyHeroHeaderNoTabindex.test.tsx pins `tabindex` absence
 *     on the hero header.
 *   - W1420 / LobbyHeroOrbs.test.tsx pins the two `.lobby-hero-orb` children.
 *   - W1223 / LobbyHeroPulse.test.tsx pins the eyebrow pulse dot.
 *
 * What none of those cover is the ABSENCE of an explicit `role`
 * attribute on the outer hero `<header>` element. A future refactor
 * that introduced e.g. `role="banner"` (the implicit ARIA role of a
 * `<header>` that is not a descendant of `<article>`, `<aside>`,
 * `<main>`, `<nav>`, or `<section>`), `role="region"`, or
 * `role="presentation"` would silently:
 *   1. Override the user-agent's implicit role inference. Even when the
 *      explicit role matches the implicit one (e.g. `role="banner"` on
 *      a top-level `<header>`), redundant roles are an accessibility
 *      anti-pattern flagged by axe-core, eslint-plugin-jsx-a11y, and
 *      Lighthouse — pinning absence prevents this drift.
 *   2. Promote the hero into a landmark region exposed to assistive
 *      technology in a way that this codebase has deliberately not
 *      advertised. Screen readers expose landmarks via rotor / quick-nav
 *      lists, so adding one is a public-API change that should be
 *      explicit.
 *   3. Risk role conflicts. A hero header that is the descendant of a
 *      future `<main>` or `<section>` wrapper would lose its implicit
 *      `banner` role automatically, but an explicit `role="banner"`
 *      hard-coded into the JSX would persist incorrectly, producing
 *      duplicate or misplaced banner landmarks.
 *
 * One focused assertion: the hero `<header className="lobby-hero">` MUST
 * NOT carry a `role` attribute. If a future change deliberately needs
 * one (e.g. to satisfy a specific assistive-tech contract), it should
 * add the new `role` AND update this pin in the same commit, making
 * the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 / W2090 / W2164 / W2236 pattern so
 * the test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — hero header has no role attribute (W2393)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the <header.lobby-hero> element does NOT carry a role attribute", () => {
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

    // The actual contract: no explicit `role` attribute on the hero
    // header. Use `hasAttribute` rather than checking
    // `getAttribute("role") === null` — both correctly distinguish the
    // never-set case from a `role=""` regression, but `hasAttribute` is
    // the canonical idiom used by sibling pins in this directory.
    expect(hero!.hasAttribute("role")).toBe(false);
  });
});
