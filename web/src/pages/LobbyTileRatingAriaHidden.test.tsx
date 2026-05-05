import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2206 — the lobby tile-rating widget's wrapper <span> carries NO
 * `aria-hidden` attribute.
 *
 * Sibling tests pin adjacent attributes of the SAME wrapper element:
 *   - W682  (LobbyPage.test.tsx): wrapper aria-label copy.
 *   - W965  (LobbyTileRatingNone.test.tsx): the gate-off case.
 *   - W1370 (LobbyTileRatingTag.test.tsx): wrapper tagName + className.
 *   - W1556 (LobbyTileRatingStarGlyphAria.test.tsx): inner per-star SVG
 *     `aria-hidden="true"` — a strict cousin which proves that
 *     `aria-hidden` IS used in the subtree, but on the decorative SVG
 *     glyph layer, NOT on the wrapper span itself.
 *   - W1611 (LobbyTileRatingReadOnlyClass.test.tsx): inner radiogroup
 *     classes.
 *   - W1618 (LobbyTileRatingWrapStyle.test.tsx): wrapper has no inline
 *     `style` attribute.
 *
 * None of those siblings forbid the WRAPPER span from acquiring its own
 * `aria-hidden` attribute. That matters because:
 *
 *   1. The wrapper exposes the rating to assistive tech via its
 *      `aria-label="Your rating: N of 5 stars"` (LobbyPage.tsx ~L3047)
 *      / `"Best variant rating: N of 5 stars"` (~L3286). Adding
 *      `aria-hidden="true"` to the wrapper would suppress that label
 *      entirely, hiding the user's stored rating from screen readers
 *      while still painting it visually — a silent regression that
 *      cannot be caught by visual snapshot tests.
 *
 *   2. The decorative concern (the literal star glyphs) is already
 *      handled one level deeper: each <svg> star carries
 *      `aria-hidden="true"` (W1556). The wrapper's job is the OPPOSITE
 *      — to surface a single, screen-reader-friendly summary of the
 *      rating.
 *
 *   3. A regression that copy-pasted `aria-hidden="true"` from the
 *      sibling `<span class="tile-cta" aria-hidden="true">` Play/Pick
 *      element (LobbyPage.tsx ~L3052, ~L3291) — they live in the same
 *      `tile-foot` and look structurally identical at a glance — would
 *      flip exactly this attribute.
 *
 * `pool-10ball` reuses the canonical fixture id from W682 / W951 / W1262
 * / W1370 / W1530 / W1543 / W1556 / W1618: not a FEATURED game, so its
 * tile renders exactly once under the canonical `tile-<id>` testid,
 * keeping the rating-widget query unambiguous.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) per the same
 * rationale as the other Lobby tile-rating siblings: shares the
 * `src/pages/Lobby` vitest path filter without colliding with
 * concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating wrapper has no aria-hidden attribute (W2206)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-rating wrapper span without an aria-hidden attribute", async () => {
    // Seed a stored rating BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings()
    // (LobbyPage.tsx ~L732). Without a seeded rating > 0, the
    // wrapper is gated off entirely (W965).
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 3 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Reach the wrapper via its W682-pinned testid so this test stays
    // anchored on the canonical surface rather than drifting to a
    // sibling rating widget if one ever appears.
    const ratingWidget = await screen.findByTestId("tile-rating-pool-10ball");

    // Sanity: confirm we're talking about the W1370 wrapper SPAN, not
    // the inner radiogroup div — getAttribute would resolve either
    // way, so anchoring on tagName === SPAN guarantees we're checking
    // the OUTER element's markup contract.
    expect(ratingWidget.tagName).toBe("SPAN");

    // Pin the contract: the wrapper MUST NOT carry aria-hidden. Its
    // aria-label is the screen-reader announcement surface for the
    // stored rating; an aria-hidden here would silently suppress that
    // announcement.
    expect(ratingWidget.getAttribute("aria-hidden")).toBeNull();
    expect(ratingWidget.hasAttribute("aria-hidden")).toBe(false);
  });
});
