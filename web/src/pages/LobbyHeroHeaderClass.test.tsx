import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1888 — the lobby hero header element itself (the top-of-page
 * `<header>` that wraps the eyebrow, h1 title, subheading, and
 * `.lobby-hero-stats` row) carries the exact className `"lobby-hero"`
 * with no extra tokens, modifier suffixes, or stray whitespace.
 *
 * Why this needs its own pin:
 *  - W1420 (LobbyHeroOrbs) pins the two decorative orb children of the
 *    hero, W1223 (LobbyHeroPulse) pins the eyebrow pulse dot, W1212 /
 *    W1202 / W1180 cover eyebrow/title/subheading text content, and
 *    W1879 (LobbyHeroStatButtonClass) pins one stat-button className —
 *    but none of them pin the *root hero header element's* className.
 *  - The hero header is what `LobbyPage.css` keys most of its hero
 *    layout / gradient / radius rules off of; a regression that
 *    appended a state modifier (e.g. `"lobby-hero is-loading"`),
 *    swapped to a BEM-style `"lobby__hero"`, or dropped the class
 *    entirely in favor of a data-attribute would silently demolish the
 *    hero's visual chrome without failing any existing assertion.
 *
 * Sibling-file placement keeps the test under the `src/pages/Lobby`
 * vitest path filter without colliding with concurrent edits to
 * LobbyPage.test.tsx or other LobbyHero* tests.
 */
describe("LobbyPage — hero header element className (W1888)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders <header> with className exactly 'lobby-hero'", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the hero header via its tag + stable class so the lookup
    // does not itself depend on the exact className string we are about
    // to assert equality on.
    const hero = container.querySelector<HTMLElement>("header.lobby-hero");
    expect(hero).not.toBeNull();
    expect(hero!.tagName).toBe("HEADER");

    // Pin the literal className string. No modifier suffixes, no
    // additional layout tokens, no trailing whitespace.
    expect(hero!.className).toBe("lobby-hero");
  });
});
