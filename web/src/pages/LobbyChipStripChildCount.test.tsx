import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W1894 — pin the EXACT direct-child cardinality on the LobbyPage chip
 * strip's inner tablist `.lobby-chips` (LobbyPage.tsx ~L1934-1974,
 * rendered by the `ChipStrip` component at ~L2611-2640 as the
 * `<div ref={trackRef} className="lobby-chips" role="tablist">` track).
 *
 * The strip renders FIVE explicit, hand-written `<Chip>` siblings:
 *   1. chip-all              (lobby.chip.all)
 *   2. chip-top-rated        (★)
 *   3. chip-favorites        (♥)
 *   4. chip-recently-played  (↺)
 *   5. chip-hidden           (◌)
 * followed by ONE `<Chip>` per entry of the `CATEGORY_ORDER` constant
 * (LobbyPage.tsx ~L606):
 *   `["solitaire", "cards", "dice", "board", "arcade"]`
 * which contributes 5 more chips — yielding exactly 10 element children
 * inside the tablist on a fresh, unfiltered mount.
 *
 * Why this needs its own pin:
 *   - W1150 (LobbyChipStripAria.test.tsx) pins the tablist's role +
 *     aria-label but says nothing about how many tabs it contains.
 *   - W1286 (LobbyChipStripWrap.test.tsx) pins the OUTER wrapper's
 *     className / parentage but never enters the track.
 *   - The per-chip badge tests (LobbyAllChipBadge, LobbyChipArcadeBadge,
 *     LobbyChipBoardBadge, LobbyChipCardsBadge, LobbyChipDiceBadge,
 *     LobbySolitaireChipBadge, LobbyChipHiddenGlyphAria, …) each pin a
 *     SINGLE chip's testId / count / glyph in isolation. None reject a
 *     regression that ADDED a brand-new sibling chip (e.g. a future
 *     "trending" or "new" filter pill) or REMOVED one of the existing
 *     ones (e.g. collapsing `chip-hidden` into a drawer). Every existing
 *     per-chip pin would still pass under such a refactor because the
 *     individual chips it asserts about would still be present and
 *     wired correctly.
 *   - The two `.lobby-chips-arrow` overflow buttons are SIBLINGS of the
 *     `.lobby-chips` track (they live under `.lobby-chips-wrap`, see
 *     ChipStrip ~L2611-2640) so they do NOT contribute to the track's
 *     `childElementCount`. The number 10 is therefore exactly the chip
 *     count, with no off-by-two from the arrows.
 *
 * `childElementCount` is the canonical DOM property for this assertion:
 * it excludes text/comment nodes so React's inter-element whitespace
 * doesn't perturb the count, and it catches both ADDITIONS and
 * REMOVALS at the strip-composition level — the structural contract
 * that the chip strip surfaces precisely 5 hand-written filter chips +
 * 5 category chips, AND NOTHING ELSE, has no dedicated assertion until
 * this pin.
 *
 * Sibling-file placement keeps this attribute pin out of the monolithic
 * LobbyPage.test.tsx so it shares the `src/pages/Lobby` vitest path
 * filter without colliding with concurrent edits to the mega-file
 * (mirroring the W1628 / W1843 child-count pin pattern).
 */
describe("LobbyPage — chip-strip tablist childElementCount=10 (W1894)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the .lobby-chips tablist with exactly 10 direct chip children", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Resolve via the tablist's stable className so the lookup itself
    // is independent of the attribute under test. querySelector is
    // preferred over getByRole here because the drawer also renders a
    // role="tablist" element, and we specifically want the chip strip.
    const strip = document.querySelector<HTMLElement>(".lobby-chips");
    expect(strip).not.toBeNull();

    // Sanity: the resolved element really is the chip-strip tablist
    // (and not, say, a `.lobby-chips-arrow` overflow button which
    // shares the `lobby-chips` substring as a class prefix).
    expect(strip!.getAttribute("role")).toBe("tablist");

    // Pin the exact element-child count: 5 explicit filter chips
    // (all, top-rated, favorites, recently-played, hidden) + 5 chips
    // produced by the CATEGORY_ORDER.map at LobbyPage.tsx ~L1964
    // (solitaire, cards, dice, board, arcade) = 10 total. Using
    // `childElementCount` ignores any whitespace text nodes JSX might
    // emit between siblings.
    expect(strip!.childElementCount).toBe(10);
  });
});
