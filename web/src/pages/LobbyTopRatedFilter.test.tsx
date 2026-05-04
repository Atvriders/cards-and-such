import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W932 — the `top-rated` chip filter restricts the lobby grid to entries
 * whose `entryRating(...)` meets `TOP_RATED_THRESHOLD` (= 4) per
 * LobbyPage.tsx L1190-L1191. Existing coverage pins the chip's
 * persistence round-trip (W718 in LobbyPage.test.tsx ~L2682) but never
 * asserts the user-visible CONTENT contract: tiles below threshold
 * vanish, tiles at-or-above threshold survive.
 *
 * Mirrors the W227 recently-played CONTENT test pattern: seed a couple
 * of well-known FEATURED family ids in localStorage, click the chip,
 * and verify the surviving tile set is exactly the seeded ids using the
 * demoted `grid-tile-<id>` testid (the canonical `tile-<id>` slot
 * belongs to the featured strip, which is suppressed for any non-"all"
 * filter).
 *
 *   - `klondike` rated 5 → above threshold → MUST survive
 *   - `spider`   rated 4 → exactly at threshold → MUST survive
 *   - `freecell` rated 3 → below threshold → MUST NOT appear
 *
 * `freecell` is also a FEATURED family id (LobbyPage.tsx L635-L642), so
 * its absence from the grid post-filter is a strong negative signal: a
 * regression that ignored the threshold would surface it back into the
 * grid alongside the others.
 *
 * Lives in a NEW SIBLING file (not LobbyPage.test.tsx) so the W932
 * pin shares the `src/pages/Lobby` vitest path filter without colliding
 * with concurrent edits to the mega-file — same rationale as
 * sibling tests W874 / W908 (LobbyTileClick / LobbyDrawerEnter).
 */
describe("LobbyPage — top-rated chip filters by rating threshold (W932)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows only entries whose rating is >= TOP_RATED_THRESHOLD", () => {
    // Seed `cards-ratings` directly — this is the same key
    // `readRatings()` reads at LobbyPage mount (StarRating.tsx L203).
    // Family rating inherits the highest member rating; the family-head
    // variant id (`klondike`, `spider`, `freecell`) IS itself a member
    // of its own family per web/src/games/families.ts, so seeding the
    // bare family id is the minimal valid seed.
    localStorage.setItem(
      "cards-ratings",
      JSON.stringify({
        klondike: 5, // above threshold (4)
        spider: 4, // exactly at threshold
        freecell: 3, // below threshold — must be filtered out
      }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Pre-state: top-rated chip is unpressed. We click rather than
    // pre-seed `cards-lobby-filter` so this test pins the live click →
    // filter-content path (the persistence round-trip is W718's job).
    const chip = screen.getByTestId("chip-top-rated");
    expect(chip).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");

    // klondike (5★) and spider (4★) survive; freecell (3★) does not.
    // All three are FEATURED ids, so their grid tiles use the demoted
    // `grid-tile-<id>` testid while the canonical `tile-<id>` slot
    // would belong to the featured strip — but the featured strip is
    // suppressed for any non-"all" filter, so neither id has a
    // canonical `tile-<id>` either.
    expect(screen.getByTestId("grid-tile-klondike")).toBeInTheDocument();
    expect(screen.getByTestId("grid-tile-spider")).toBeInTheDocument();
    expect(screen.queryByTestId("grid-tile-freecell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tile-freecell")).not.toBeInTheDocument();
  });
});
