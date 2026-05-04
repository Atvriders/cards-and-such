import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1527 — the Featured strip's `<section className="lobby-featured">`
 * landmark contains exactly two element children rendered in this
 * order:
 *
 *   1. an `<h2>` heading (sparkle span + "Featured" copy)
 *   2. a `<div className="lobby-grid lobby-grid--featured">` carrying
 *      the FeaturedTile children
 *
 * Why this needs its own pin:
 *  - W1255 (LobbyFeaturedSpark.test.tsx) pins the inner sparkle span
 *    inside the h2; W1515 (LobbyFeaturedHeadingText.test.tsx) pins the
 *    trailing "Featured" text node; W735 (LobbyPage.test.tsx) pins the
 *    section's aria-label/className gating. None of those pins assert
 *    that the heading precedes the grid, nor that the section's
 *    immediate child count is exactly two.
 *  - A regression that injected an unintended sibling (e.g. a "See all"
 *    link, a description blurb, or a dev-only badge) between the h2 and
 *    the grid div — or that re-ordered them so the grid rendered before
 *    the heading — would leave the existing pins green while breaking
 *    the visual contract that a heading introduces the strip and
 *    sighted users encounter the grid below it.
 *
 * Pinning the structure via `firstElementChild` / `lastElementChild`
 * (rather than a generic `children[i]` index lookup) survives
 * pure-text-node insertions (e.g. whitespace) and matches the
 * semantics CSS sibling selectors rely on for spacing rules in
 * LobbyPage.css.
 */
describe("LobbyPage — Featured strip h2/grid element ordering (W1527)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the h2 heading as the first element child and the lobby-grid--featured div as the last", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const featured = document.querySelector<HTMLElement>(
      'section.lobby-featured[aria-label="Featured games"]',
    );
    expect(featured).not.toBeNull();

    // Exactly two ELEMENT children — guards against an accidental
    // injection of a third sibling (header-row chrome, footer link,
    // etc.) that would silently slip past the existing W735/W1255/W1515
    // pins on the section's metadata, h2, and sparkle span.
    expect(featured!.childElementCount).toBe(2);

    // First element child: the h2 heading. Pinning via tagName rather
    // than a class selector keeps this test honest about the semantic
    // ordering — a regression that swapped the h2 for a styled <div>
    // would still trip this assertion.
    const first = featured!.firstElementChild;
    expect(first).not.toBeNull();
    expect(first!.tagName).toBe("H2");

    // Last element child: the featured grid wrapper. The `lobby-grid`
    // base class is shared with the main grid further down the page,
    // so we additionally require the `lobby-grid--featured` modifier
    // to disambiguate — that combo is the load-bearing CSS hook for
    // the featured strip's tile layout.
    const last = featured!.lastElementChild;
    expect(last).not.toBeNull();
    expect(last!.tagName).toBe("DIV");
    expect(last!.classList.contains("lobby-grid")).toBe(true);
    expect(last!.classList.contains("lobby-grid--featured")).toBe(true);

    // Belt-and-braces: the heading must immediately precede the grid
    // (no intervening element sibling). This is implied by
    // `childElementCount === 2` plus the first/last assertions above,
    // but stating it explicitly catches a future regression where the
    // child count is preserved but a wrapper layer is inserted between
    // them (which would shift `nextElementSibling` to a new node).
    expect(first!.nextElementSibling).toBe(last);
  });
});
