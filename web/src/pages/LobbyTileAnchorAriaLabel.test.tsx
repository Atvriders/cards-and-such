import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LobbyPage from "./LobbyPage.js";

/**
 * W2329 — the lobby tile root `<Link>` (LobbyPage.tsx ~L2962-L2976) builds
 * its `aria-label` as `${title}, ${categoryLabel}, ${playsLabel}, ${favLabel}`
 * where `playsLabel` is computed by the ternary at L2962-L2965:
 *
 *     playCount > 0
 *       ? `${playCount} ${playCount === 1 ? "play" : "plays"}`
 *       : "no plays yet"
 *
 * Existing sibling coverage pins the OTHER two playsLabel branches:
 *   - W1307 (LobbyTileMenuTriggerLabel.test.tsx) pins `playCount === 0`
 *     ("no plays yet") with the not-favorited suffix.
 *   - W1638 (LobbyTileRootFav.test.tsx)         pins `playCount === 0`
 *     ("no plays yet") with the favorited suffix.
 *
 * What no test pins is the `playCount === 1` branch — the singular "1 play"
 * (vs "1 plays" or a plural-only "${n} plays" reduction). A regression that
 * dropped the singular ternary and emitted "1 plays" would silently degrade
 * the screen-reader experience for any user who has played a game exactly
 * once, without breaking any visual or interaction test.
 *
 * `texas-holdem` is the canonical standalone (non-family) id reused by
 * sibling W874 / W1307 / W1638 tests — `tile-texas-holdem` resolves to the
 * plain `GameCard` whose root `<Link>` carries the aria-label we pin.
 * Title "Texas Hold'em" and category "cards" are stamped at registration
 * (web/src/games/texas-holdem/index.ts). Seeding the stats blob with
 * `played: 1` for the id BEFORE render flips `playCount` to 1 via
 * `loadStats()` (web/src/platform/stats.ts L535 / STORAGE_KEY
 * "cards-and-such:stats:v1") which LobbyPage threads into the GameCard's
 * `playCount` prop at L2353.
 */
describe("LobbyPage — tile-anchor aria-label singular play branch (W2329)", () => {
  const STANDALONE_ID = "texas-holdem";
  const STATS_KEY = "cards-and-such:stats:v1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("tile aria-label uses singular '1 play' when perGame.played === 1", async () => {
    // Seed the stats blob BEFORE mount so the initial render already sees
    // `playCount=1` for Texas Hold'em — no game-finish interaction required,
    // which keeps this test focused on the aria-label format alone.
    localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        totalPlayed: 1,
        totalWins: 0,
        longestStreak: 0,
        currentStreak: 0,
        perGame: {
          [STANDALONE_ID]: { played: 1, wins: 0, best: 0 },
        },
        perCategory: { cards: 1 },
        daysPlayed: [],
        unlocked: [],
      }),
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LobbyPage />
      </MemoryRouter>,
    );

    // Default sort is alphabetical and the lobby paginates at PAGE_SIZE=80;
    // narrow the visible grid via search to reach Texas Hold'em
    // deterministically — same approach as W874/W1307/W1638.
    const search = screen.getByTestId("lobby-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "texas hold" } });
    const tile = await waitFor(() =>
      screen.getByTestId(`tile-${STANDALONE_ID}`),
    );

    // The full four-part label MUST emit the singular "1 play" segment when
    // playCount === 1; pinning the entire string also guards the other
    // three segments against drift on the singular path (which W1307 only
    // exercises for the zero/no-plays branch and W1638 only exercises for
    // the favorited+zero-plays branch).
    expect(tile.getAttribute("aria-label")).toBe(
      "Texas Hold'em, Cards, 1 play, not favorited",
    );
  });
});
