import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W952 — the `recently-played` chip filter sorts surviving entries by
 * their `cards-last-played` timestamp DESCENDING (most-recent first),
 * per LobbyPage.tsx ~L1216-L1233 (`stampOf(b) - stampOf(a)`).
 *
 * Existing W227 (LobbyPage.test.tsx ~L2167) covers the basic chip-filter
 * CONTENT contract with two seeded ids, but the two-element assertion
 * could in principle pass for either ordering branch — and a third entry
 * makes the descending-timestamp invariant unambiguous. This test seeds
 * THREE well-known FEATURED family ids with three distinct timestamps
 * arranged so the most-recent and the alphabetical-first ids disagree:
 *
 *   - `spider`   → now            (NEWEST)
 *   - `freecell` → now - 1 day
 *   - `klondike` → now - 2 days   (OLDEST)
 *
 * Alphabetical order (the all-filter default) would be
 * freecell → klondike → spider; descending-timestamp order is
 * spider → freecell → klondike. The two orderings differ at every
 * position, so a regression that fell back to alphabetical (or any
 * stable secondary tie-breaker) would surface here.
 *
 * Lives in a NEW SIBLING file rather than being folded into the
 * mega-`LobbyPage.test.tsx` so the W952 pin shares the
 * `src/pages/Lobby` vitest path filter without colliding with concurrent
 * edits to the parent file — same rationale as siblings W874 / W908 /
 * W932 (LobbyTileClick / LobbyDrawerEnter / LobbyTopRatedFilter).
 */
describe("LobbyPage — recently-played chip sorts by last-played desc (W952)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("orders grid tiles most-recently-played first", () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    // Seed `cards-last-played` with three FEATURED family ids whose
    // timestamps are strictly decreasing in a non-alphabetical sequence
    // so a fallback to alphabetical sort would visibly disagree.
    localStorage.setItem(
      "cards-last-played",
      JSON.stringify({
        spider: now,
        freecell: now - oneDayMs,
        klondike: now - 2 * oneDayMs,
      }),
    );
    // Pre-set the lobby filter so the page mounts directly into the
    // recently-played view — this isolates the SORT contract from the
    // chip-click→filter-state path that W227 already covers.
    localStorage.setItem("cards-lobby-filter", "recently-played");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // All three ids are FEATURED, so when the chip is active their
    // main-grid tiles render with the demoted `grid-tile-<id>` testid
    // (the canonical `tile-<id>` slot belongs to the featured strip,
    // which is suppressed for any non-"all" filter). Reading the DOM
    // order of those testids gives us the rendered grid order directly.
    const tileIds = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid^="grid-tile-"]'),
    )
      .map((t) => t.getAttribute("data-testid"))
      .filter((id): id is string => id != null);

    // Surviving set must be exactly the seeded ids, ordered most-recent
    // first by intrinsic descending-timestamp sort.
    expect(tileIds).toEqual([
      "grid-tile-spider",
      "grid-tile-freecell",
      "grid-tile-klondike",
    ]);

    // Sanity: confirm we landed on the recently-played filter (a stale
    // localStorage read or an early-mount filter reset would silently
    // route us back to "all" and surface the full grid).
    expect(screen.getByTestId("chip-recently-played")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
