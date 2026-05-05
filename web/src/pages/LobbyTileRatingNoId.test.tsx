import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2080 — pin that the lobby tile-rating wrapper span renders WITHOUT
 * an `id` attribute.
 *
 * The lobby's per-tile `<span className="tile-rating">` wrapper
 * (LobbyPage.tsx ~L3043-3051 for solo cards, ~L3284 for family cards)
 * is identified strictly via `data-testid="tile-rating-<id>"` and
 * `className="tile-rating"`. It deliberately carries NO `id` attribute,
 * because every rating-bearing tile renders one of these spans — adding
 * an `id` would either (a) collide across tiles producing duplicate-id
 * document warnings, or (b) leak a stable hook that consumers could
 * couple to.
 *
 * Sibling tests pin many surfaces of the rating widget (tag, class, child
 * count, inner radiogroup attributes, per-star glyph attributes, etc.)
 * but NONE of them assert that the wrapper span is free of an `id`
 * attribute. A silent regression that added `id="tile-rating"` (or any
 * per-tile id like `id="tile-rating-pool-10ball"`) would still satisfy
 * every existing rating test while breaking the "no document-level id
 * collisions" invariant.
 *
 * Lives in a NEW SIBLING file per the same rationale as the W2073
 * (LobbyTileMetaNoId), W1815 (LobbyTileAnchorNoId), and other
 * `*NoId.test.tsx` splits: shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file.
 */
describe("LobbyPage — tile-rating wrapper span has no id attribute (W2080)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the tile-rating wrapper span without an `id` attribute", async () => {
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

    // Locate the tile-rating wrapper via its testid pattern. There may
    // be several across the page (one per rated tile); the contract is
    // that NONE of them carry an `id` attribute, so we assert against
    // every match.
    const wrappers = document.querySelectorAll<HTMLElement>(
      '[data-testid^="tile-rating-"]',
    );
    expect(wrappers.length, "no tile-rating wrappers rendered").toBeGreaterThan(0);

    // Core assertion: the wrapper carries no `id` attribute. Using
    // `hasAttribute` (rather than just checking `wrapper.id === ""`)
    // catches both the missing-attr and explicit-empty-string cases
    // while still failing if any non-empty id is added.
    for (const wrapper of Array.from(wrappers)) {
      expect(wrapper.hasAttribute("id")).toBe(false);
    }
  });
});
