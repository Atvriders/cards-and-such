import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2090 — the LobbyPage hero `<header className="lobby-hero">` element
 * (rendered around line 1846 of LobbyPage.tsx, wrapping the eyebrow,
 * `<h1>` title, subheading, and `.lobby-hero-stats` row) MUST NOT carry
 * an `id` attribute.
 *
 * Sibling pins on this same hero header:
 *   - W1888 / LobbyHeroHeaderClass.test.tsx pins `className === "lobby-hero"`
 *     exactly (no modifier suffixes / state tokens / trailing whitespace).
 *   - W1420 / LobbyHeroOrbs.test.tsx pins the two `.lobby-hero-orb` children.
 *   - W1223 / LobbyHeroPulse.test.tsx pins the eyebrow pulse dot.
 *   - W1212 / W1202 / W1180 cover eyebrow / title / subheading text.
 *   - LobbyHeroStatsNoId.test.tsx pins `id` absence on the stats *row*,
 *     NOT on the wrapping `<header>` itself.
 *
 * What none of those cover is the ABSENCE of an `id` attribute on the
 * outer hero `<header>` element. A future refactor that introduced
 * e.g. `id="lobby-hero"` would silently:
 *   1. Create a stable URL fragment target (`/#lobby-hero`) that external
 *      links, anchors, and bookmarks could come to depend on, making it
 *      an undeclared part of the page's public contract.
 *   2. Enable `aria-controls` / `aria-labelledby` from elsewhere on the
 *      page (or from sibling routes) to point at the header, coupling
 *      unrelated components to an attribute this codebase has
 *      deliberately not advertised.
 *   3. Risk colliding with any other `id` on the page — jsdom and
 *      browsers tolerate duplicate ids at render time, but
 *      `getElementById` and fragment-based scrolling break in subtle
 *      ways that won't surface in unit tests.
 *
 * One focused assertion: the hero `<header className="lobby-hero">` MUST
 * NOT carry an `id` attribute. If a future change deliberately needs
 * one, it should add the new `id` AND update this pin in the same
 * commit, making the trade-off explicit.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) following the
 * established W1150 / W1908 / W2036 pattern so the test shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — hero header has no id attribute (W2090)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("the <header.lobby-hero> element does NOT carry an id attribute", () => {
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

    // The actual contract: no `id` attribute on the hero header.
    // Use `hasAttribute` rather than checking for an empty string —
    // an `id=""` would still be a (broken) public surface that future
    // code could come to depend on.
    expect(hero!.hasAttribute("id")).toBe(false);
  });
});
