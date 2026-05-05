import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2219 — pin that the lobby tile-rating wrapper span renders WITHOUT
 * an explicit `role` attribute.
 *
 * The lobby's per-tile `<span className="tile-rating" data-testid=
 * "tile-rating-<id>">` wrapper (LobbyPage.tsx ~L3043-3051 for solo cards,
 * ~L3284 for family cards) is a presentational shell whose only job is
 * to position the inline StarRating + carry an `aria-label` summarising
 * the current rating for screen readers. The accessible "rating" semantic
 * surface is owned by the INNER StarRating div (which exposes
 * `role="radiogroup"` plus per-star `role="radio"` buttons). The OUTER
 * wrapper deliberately stays role-less so that the readonly summary span
 * does not collide with — or shadow — the inner radiogroup, and so AT
 * users hear a single coherent "Your rating: N of 5 stars" announcement
 * instead of a phantom unnamed widget wrapping a widget.
 *
 * Sibling tests pin many surfaces of the rating widget (tag, class, no
 * id, no style, child count, aria-hidden absence, inner radiogroup
 * attributes, per-star role attribute, per-star glyph attributes, etc.)
 * but NONE of them assert that the OUTER wrapper span itself is free of
 * a `role` attribute. A silent regression that promoted the wrapper to
 * e.g. `role="img"`, `role="group"`, or `role="meter"` would still
 * satisfy every existing rating test while breaking the "outer wrapper
 * is presentational; inner radiogroup is the only ARIA widget" contract.
 *
 * Lives in a NEW SIBLING file per the same rationale as the W2080
 * (LobbyTileRatingNoId), W2073 (LobbyTileMetaNoRole), and other
 * `*NoRole.test.tsx` splits: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating wrapper span has no role attribute (W2219)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-rating wrapper span without a `role` attribute", async () => {
    // Seed the canonical rating blob BEFORE mount so the page's useState
    // initializer hydrates synchronously via readRatings() — without a
    // non-zero rating, the `userRating > 0` guard at LobbyPage.tsx ~L3043
    // skips rendering the wrapper entirely.
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({ "pool-10ball": 4 }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Wait for the lobby to mount via the canonical search-input anchor
    // shared by sibling tests.
    await screen.findByPlaceholderText(/search/i);

    // Locate the tile-rating wrapper(s) via the testid pattern. There may
    // be several across the page (one per rated tile); the contract is
    // that NONE of them carry a `role` attribute, so we assert against
    // every match.
    const wrappers = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-rating-"]',
    );
    expect(wrappers.length, "no tile-rating wrappers rendered").toBeGreaterThan(0);

    // Core assertion: the wrapper carries no `role` attribute. Using
    // `hasAttribute` (rather than checking the resolved role) drills
    // past testing-library's implicit-role resolver — the assertion
    // fails iff a literal `role="..."` markup attribute is added,
    // regardless of value. The inner StarRating's `role="radiogroup"`
    // lives on a descendant div, not on this wrapper, so this check
    // is independent of the inner widget's ARIA surface.
    for (const wrapper of Array.from(wrappers)) {
      expect(wrapper.hasAttribute("role")).toBe(false);
    }
  });
});
