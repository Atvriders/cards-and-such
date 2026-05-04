import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1541 — the Recommended strip's
 * `<section className="lobby-recommended">` landmark contains exactly
 * two element children rendered in this order:
 *
 *   1. an `<h2>` heading (sparkle span + "Recommended for you" copy)
 *   2. a `<div className="lobby-grid lobby-grid--featured">` carrying
 *      the recommendation tile children
 *
 * Why this needs its own pin (mirrors W1527 for Featured):
 *  - W1482 (LobbyRecommendedAria.test.tsx) pins the section's aria-label
 *    and className/data-testid; W1493 (LobbyRecommendedSpark.test.tsx)
 *    pins the inner sparkle span inside the h2; W1503
 *    (LobbyRecommendedHeadingText.test.tsx) pins the trailing
 *    "Recommended for you" text. None of those pins assert that the
 *    heading precedes the grid, nor that the section's immediate child
 *    count is exactly two.
 *  - A regression that injected an unintended sibling (e.g. a "See all"
 *    link, an explanatory blurb about why something was recommended, or
 *    a dev-only debug badge) between the h2 and the grid div — or that
 *    re-ordered them so the grid rendered before the heading — would
 *    leave the existing pins green while breaking the visual contract
 *    that a heading introduces the strip and sighted users encounter
 *    the grid below it.
 *
 * The Recommended strip only renders when `query` is empty, `filter`
 * is "all", and `recommendations.length > 0`. Default lobby state
 * satisfies the first two conditions; the third depends on the pure
 * recommender's output for an empty-localStorage user, so the
 * assertion is conditional on the section being present (matching
 * W1482's pattern).
 */
describe("LobbyPage — Recommended strip h2/grid element ordering (W1541)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the h2 heading as the first element child and the lobby-grid--featured div as the last", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    const recommended = document.querySelector<HTMLElement>(
      'section[data-testid="lobby-recommended"]',
    );

    if (recommended === null) {
      // No recommendations under the default empty-history state — the
      // strip is not rendered, which is a valid lobby branch. Confirm
      // the absence is consistent (no stray sibling carrying the same
      // landmark identity) and stop.
      expect(
        document.querySelector('section[aria-label="Recommended for you"]'),
      ).toBeNull();
      return;
    }

    // Exactly two ELEMENT children — guards against an accidental
    // injection of a third sibling (header-row chrome, footer link,
    // debug pill, etc.) that would silently slip past the existing
    // W1482/W1493/W1503 pins on the section's metadata, h2, and
    // sparkle span.
    expect(recommended.childElementCount).toBe(2);

    // First element child: the h2 heading. Pinning via tagName rather
    // than a class selector keeps this test honest about the semantic
    // ordering — a regression that swapped the h2 for a styled <div>
    // would still trip this assertion.
    const first = recommended.firstElementChild;
    expect(first).not.toBeNull();
    expect(first!.tagName).toBe("H2");

    // Last element child: the recommendation grid wrapper. The
    // `lobby-grid` base class is shared with the main grid further
    // down the page and with the Featured strip, so we additionally
    // require the `lobby-grid--featured` modifier — that combo is the
    // load-bearing CSS hook for the recommended strip's tile layout
    // (it intentionally reuses the Featured grid's column rules).
    const last = recommended.lastElementChild;
    expect(last).not.toBeNull();
    expect(last!.tagName).toBe("DIV");
    expect(last!.classList.contains("lobby-grid")).toBe(true);
    expect(last!.classList.contains("lobby-grid--featured")).toBe(true);

    // Belt-and-braces: the heading must immediately precede the grid
    // (no intervening element sibling). Implied by
    // `childElementCount === 2` plus the first/last assertions above,
    // but stating it explicitly catches a future regression where the
    // child count is preserved but a wrapper layer is inserted between
    // them (which would shift `nextElementSibling` to a new node).
    expect(first!.nextElementSibling).toBe(last);
  });
});
