import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  pickQuickstart,
  readRecentlyPlayed,
  recordPlayed,
} from "./quickstart.js";

const RECENT_KEY = "cards-and-such:recently-played:v1";
const RATINGS_KEY = "cards-ratings";

describe("quickstart picker", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("recordPlayed pushes ids to the head of recently-played and dedupes", () => {
    expect(readRecentlyPlayed()).toEqual([]);

    recordPlayed("klondike");
    recordPlayed("freecell");
    recordPlayed("spider");
    expect(readRecentlyPlayed()).toEqual(["spider", "freecell", "klondike"]);

    // Re-recording an existing id moves it to the head, no duplicates.
    recordPlayed("klondike");
    expect(readRecentlyPlayed()).toEqual(["klondike", "spider", "freecell"]);

    // Empty / falsy ids are ignored.
    recordPlayed("");
    expect(readRecentlyPlayed()).toEqual(["klondike", "spider", "freecell"]);
  });

  it("falls back to a featured id with strategy 'featured-fallback' when no favorites exist", () => {
    // No recents, no ratings — must go down the fallback branch.
    // First rng() call inside pickOne(fallbackPool) selects index 0 -> 'klondike'.
    const rng = () => 0;
    const pick = pickQuickstart(rng);
    expect(pick).not.toBeNull();
    expect(pick!.strategy).toBe("featured-fallback");
    // The first featured id that's registered is 'klondike'.
    expect(pick!.gameId).toBe("klondike");
  });

  it("returns the most-recent id when the 'recent' strategy is selected", () => {
    recordPlayed("freecell");
    recordPlayed("klondike"); // head of recents

    // strategies array is ["recent","top-rated","random-favorite"]; index 0 == "recent".
    // The strategy pick uses one rng() call -> we make it land on 0.
    const rng = () => 0;
    const pick = pickQuickstart(rng);
    expect(pick).not.toBeNull();
    expect(pick!.strategy).toBe("recent");
    expect(pick!.gameId).toBe("klondike");
  });

  it("returns the highest-rated id when the 'top-rated' strategy is selected", () => {
    // Seed ratings directly: spider=5 (top), freecell=3.
    localStorage.setItem(
      RATINGS_KEY,
      JSON.stringify({ freecell: 3, spider: 5 }),
    );
    // No recents, only ratings -> favSet is non-empty.

    // Need rng() to yield index 1 from a 3-element strategies array.
    // Math.floor(rng() * 3) === 1 when rng() ∈ [1/3, 2/3). Use 0.5.
    const rng = () => 0.5;
    const pick = pickQuickstart(rng);
    expect(pick).not.toBeNull();
    expect(pick!.strategy).toBe("top-rated");
    expect(pick!.gameId).toBe("spider");
  });
});
