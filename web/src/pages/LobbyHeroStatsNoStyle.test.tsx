import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2163 — the hero stats wrapper (`<div class="lobby-hero-stats">`) is
 * a presentational grouping of category-count buttons that lives
 * directly under the page-level `<h1>`. It carries an `aria-label`
 * ("Catalog breakdown") and a stable className, but it has no inline
 * `style` attribute: all visual layout is delegated to the stylesheet
 * via the `lobby-hero-stats` class hook.
 *
 * Why this absence is worth pinning:
 *  - A regression that adds an inline `style` (e.g. ad-hoc `display`,
 *    `gap`, or `gridTemplateColumns` overrides) would silently bypass
 *    the cascade, defeating themeability and making the layout
 *    invisible to the design-system stylesheet that owns this region.
 *  - Sibling tests pin the wrapper's className, aria-label, and the
 *    absence of an `id` (W2038), but none assert the absence of the
 *    `style` attribute, so the invariant is currently untested.
 *
 * Sibling-file placement mirrors LobbyHeroStatsNoId.test.tsx (W2038)
 * and the broader LobbyDrawerAsideNoStyle.test.tsx / LobbyChipStripNoStyle
 * pattern so this test shares the `src/pages/Lobby` vitest filter without
 * colliding with concurrent edits to LobbyPage.test.tsx.
 */
describe("LobbyPage — hero stats wrapper has no inline style (W2163)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the .lobby-hero-stats wrapper without a style attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the wrapper via the stable className so the lookup is
    // independent of the attribute under test.
    const wrap = document.querySelector<HTMLElement>(".lobby-hero-stats");
    expect(wrap).not.toBeNull();

    // Pin the negative: the wrapper must not carry an inline style attribute.
    expect(wrap!.hasAttribute("style")).toBe(false);
  });
});
