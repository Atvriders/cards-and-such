import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2038 — the hero stats wrapper (`<div class="lobby-hero-stats">`) is
 * a presentational grouping of category-count buttons that lives
 * directly under the page-level `<h1>`. It carries an `aria-label`
 * ("Catalog breakdown") and a stable className, but it has no `id`
 * attribute and is not itself the target of any in-page anchor link,
 * `aria-labelledby`/`aria-controls` reference, or `:target` styling.
 *
 * Why this absence is worth pinning:
 *  - A regression that adds an `id` (e.g. for a future "skip to
 *    catalog" anchor or for a CSS hook) would silently couple this
 *    wrapper to whatever else references the new id, expanding its
 *    contract beyond a presentational stats row.
 *  - Sibling tests pin the wrapper's className and aria-label values,
 *    but none assert the *absence* of the id attribute, so the
 *    invariant is currently untested.
 *
 * Sibling-file placement mirrors LobbyHeroStatsAria.test.tsx (W1165)
 * and the broader LobbyDrawerAsideNoId.test.tsx pattern so this test
 * shares the `src/pages/Lobby` vitest filter without colliding with
 * concurrent edits to LobbyPage.test.tsx.
 */
describe("LobbyPage — hero stats wrapper has no id (W2038)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the .lobby-hero-stats wrapper without an id attribute", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the wrapper via the stable className so the lookup is
    // independent of the attribute under test.
    const wrap = document.querySelector<HTMLElement>(".lobby-hero-stats");
    expect(wrap).not.toBeNull();

    // Pin the negative: the wrapper must not carry an id attribute.
    expect(wrap!.hasAttribute("id")).toBe(false);
  });
});
