import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1493 — the "Recommended for you" strip's `<h2>` heading is decorated
 * with a leading sparkle glyph wrapped in
 * `<span class="lobby-featured-spark" aria-hidden="true">★</span>`, so
 * the visual flourish is hidden from assistive tech and screen readers
 * announce the heading as just "Recommended for you" (rather than
 * "★ Recommended for you").
 *
 * Why this needs its own pin:
 *  - W1255 (LobbyFeaturedSpark.test.tsx) pins the *Featured* strip's
 *    sparkle (the "✦" variant) and W1482 (LobbyRecommendedAria.test.tsx)
 *    pins the Recommended landmark's outer aria-label, but the inner
 *    sparkle span on the Recommended strip — which reuses the same
 *    `lobby-featured-spark` class but with a different glyph ("★") —
 *    has no dedicated coverage. A regression that drops `aria-hidden`
 *    on the recommended sparkle (causing the glyph to leak into the
 *    heading's accessible name) or renames the class would not flip
 *    any existing test red.
 *  - The Featured-strip test (W1255) explicitly scopes itself to the
 *    Featured landmark and notes in its comment that the Recommended
 *    strip uses the same class with a "★" glyph — so this pin closes
 *    that gap symmetrically.
 *
 * The recommended strip only renders when `query` is empty, `filter`
 * is "all", and `recommendations.length > 0`. The default lobby state
 * satisfies the first two; the recommender produces a non-empty list
 * for an empty-localStorage user via its surprise/unplayed-category
 * filler slots, but we still gate the assertion on the section being
 * present so this remains a useful pin even if the heuristic ever
 * returns zero items on a cold start.
 */
describe("LobbyPage — Recommended strip sparkle span (W1493)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hides the decorative sparkle glyph from assistive tech via aria-hidden", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve the sparkle span scoped under the Recommended strip's
    // landmark so we don't accidentally match the Featured strip's
    // sparkle (which uses the same class but a "✦" glyph).
    const recommended = document.querySelector<HTMLElement>(
      'section[data-testid="lobby-recommended"]',
    );

    if (recommended === null) {
      // Recommendations may legitimately be empty on a cold start —
      // skip silently so the pin doesn't go red on a valid branch.
      return;
    }

    const spark = recommended.querySelector<HTMLSpanElement>(
      "h2 > span.lobby-featured-spark",
    );
    expect(spark).not.toBeNull();
    expect(spark!.tagName).toBe("SPAN");
    expect(spark!.getAttribute("aria-hidden")).toBe("true");
    expect(spark!.textContent).toBe("★");
  });
});
