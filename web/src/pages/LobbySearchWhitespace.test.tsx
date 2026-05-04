import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1162 — a whitespace-only lobby search query is treated as an empty
 * filter, surfacing the full catalogue rather than the no-results state.
 *
 * The contract lives in `LobbyPage.tsx`'s `filtered` useMemo:
 *
 *   const q = deferredQuery.trim().toLowerCase();
 *   ...
 *   if (q) {
 *     list = list.filter((e) => e.haystack.includes(q));
 *   }
 *
 * The `.trim()` on the query collapses any all-whitespace input (spaces,
 * tabs, line feeds — every char `String.prototype.trim` normalises) to
 * the empty string, and the subsequent `if (q)` short-circuits the
 * `.includes` filter entirely. The user-visible consequence is that
 * stray spaces typed into the search box (e.g. a trailing space the
 * mobile keyboard auto-inserted after a tap-cancelled word) leave the
 * lobby grid fully populated rather than collapsing it to the
 * `lobby-no-results` empty state with a "No games match    ." message
 * containing only whitespace where the query echo would normally appear.
 *
 * No existing `Lobby*` test exercises this branch:
 *
 *   - W686 (LobbyPage.test.tsx no-results) types a string that genuinely
 *     does not match any game (e.g. "zzzzz"), which sets `q` to a
 *     non-empty post-trim value — the trim/empty-string short-circuit
 *     is never hit.
 *   - W742 (single-char highlight suppression) types "e", also non-empty
 *     after trim.
 *   - W566 / W608 / W656 / W1144 / W1154 all type non-whitespace
 *     content, so a regression that dropped the `.trim()` (e.g. swapped
 *     it for a plain `.toLowerCase()`) would slip through every one of
 *     them: the haystacks for individual games do not contain runs of
 *     three spaces, so the `.includes("   ")` filter would silently
 *     evict every entry and surface the no-results state — exactly the
 *     UX failure this test is designed to catch.
 *
 * The test types three space characters into the search input and
 * asserts two independent witnesses of the "treated as empty" contract:
 *  1. The `lobby-no-results` testid is NOT in the document — confirming
 *     `filtered.length` is non-zero, i.e. the filter ran without
 *     evicting every entry.
 *  2. At least one `.lobby-tile-title` element is present — confirming
 *     the grid actually rendered tiles, not just that the no-results
 *     branch happened to be skipped (e.g. via a different guard).
 *
 * `useDeferredValue` defers the `q` recomputation to a low-priority
 * commit, so we wrap the second assertion in `waitFor` to flush the
 * deferred update — matching the W742 sibling pattern. The first
 * assertion (no-results absent) is true both before and after the
 * deferred flush because the no-results state requires `filtered`
 * already being recomputed to length 0; transient mid-flush states
 * still show the previous (full) grid, never the empty state.
 *
 * Sibling-file placement (rather than appending to LobbyPage.test.tsx)
 * matches the W901/W912/W1143/W1144/W1154 sibling-file pattern so the
 * test shares the `src/pages/Lobby` vitest path filter without
 * colliding with concurrent edits.
 */
describe("LobbyPage — whitespace-only query treated as empty (W1162)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("typing only spaces leaves the lobby grid fully populated", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Sanity: the lobby is in its default populated state on mount —
    // at least one tile is visible. Without this anchor, a regression
    // that broke the lobby grid for unrelated reasons could falsely
    // pass the post-typing assertions by leaving "0 tiles" in both
    // states. We rely on `.lobby-tile-title` (the same class W742
    // checks) so the witness is the same DOM contract both pre- and
    // post-keystroke.
    await waitFor(() => {
      expect(
        document.querySelectorAll(".lobby-tile-title").length,
      ).toBeGreaterThan(0);
    });

    // Type three space characters. The exact count is not load-bearing
    // — any non-empty whitespace-only string exercises the `.trim()`
    // branch in `filtered`'s useMemo. We avoid asserting the post-
    // typing tile count equals the pre-typing count because a separate
    // (unrelated) guard at LobbyPage.tsx:2000 — `!query && filter ===
    // "all" && featured.length > 0` — toggles the featured strip on
    // raw `query` truthiness without trimming, so whitespace queries
    // legitimately hide the featured strip even while leaving the main
    // grid intact. Pinning equality would conflate the two contracts;
    // here we only pin the main-grid contract.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "   " } });
    expect(search.value).toBe("   ");

    // Witness 1: tiles are still rendered. A regression that dropped
    // the `.trim()` from `q` would cause the `.includes("   ")` filter
    // to evict every entry (no game haystack contains a run of three
    // spaces), reducing `filtered.length` to 0 and unmounting all
    // `.lobby-tile-title` nodes from the main grid. We assert > 0
    // (rather than == baseline) for the reason described above. The
    // `waitFor` flushes any pending `useDeferredValue` work — matching
    // the W742 sibling pattern — so a stale pre-deferred render does
    // not mask a real regression.
    await waitFor(() => {
      expect(
        document.querySelectorAll(".lobby-tile-title").length,
      ).toBeGreaterThan(0);
    });

    // Witness 2: the no-results empty state is NOT rendered. A
    // regression that dropped the `.trim()` would not only zero the
    // tile count (Witness 1) but also flip into the `filtered.length
    // === 0` branch at LobbyPage.tsx:2300, mounting the
    // `<div data-testid="lobby-no-results">` panel with a "No games
    // match    ." message echoing the literal whitespace. Asserting
    // its absence via `queryByTestId` (rather than `getByTestId`) is
    // required: the latter throws on a missing element, which is the
    // very thing we are pinning. Together the two witnesses pin both
    // sides of the conditional render — neither alone would catch a
    // regression that only swapped which branch was taken without
    // changing the tile count (e.g. a deliberate "always show no-
    // results when query is non-empty whitespace" UX experiment).
    expect(screen.queryByTestId("lobby-no-results")).not.toBeInTheDocument();
  });
});
