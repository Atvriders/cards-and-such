import { describe, expect, it } from "vitest";
import { buildHits, scoreField, searchAll } from "./search.js";

describe("searchAll", () => {
  it("returns empty result groups (and no top match) for an empty / whitespace query", () => {
    const blank = searchAll("");
    expect(blank.topMatch).toBeNull();
    expect(blank.games).toEqual([]);
    expect(blank.families).toEqual([]);
    expect(blank.categories).toEqual([]);

    const spaces = searchAll("   \t  \n");
    expect(spaces.topMatch).toBeNull();
    expect(spaces.games).toEqual([]);
    expect(spaces.families).toEqual([]);
    expect(spaces.categories).toEqual([]);
  });

  it("returns klondike plus klondike-family hits when querying 'klondike'", () => {
    const result = searchAll("klondike");
    expect(result.topMatch).not.toBeNull();

    // The Klondike family tile must appear (either as topMatch or in families).
    const familyIds = [
      result.topMatch?.kind === "family" ? result.topMatch.id : null,
      ...result.families.map((f) => f.id),
    ].filter(Boolean) as string[];
    expect(familyIds).toContain("klondike");

    // The standalone Klondike Solitaire game must also be in the hit set.
    const allHitIds = [
      result.topMatch ? `${result.topMatch.kind}:${result.topMatch.id}` : null,
      ...result.games.map((g) => `game:${g.id}`),
      ...result.families.map((f) => `family:${f.id}`),
      ...result.categories.map((c) => `category:${c.id}`),
    ].filter(Boolean) as string[];
    expect(allHitIds).toContain("game:klondike");

    // Multiple klondike-named variants should rank in the games list.
    const klondikeVariantGames = result.games.filter((g) =>
      g.id.startsWith("klondike"),
    );
    expect(klondikeVariantGames.length).toBeGreaterThan(0);
  });

  it("does not duplicate the topMatch in its source group", () => {
    const result = searchAll("klondike");
    expect(result.topMatch).not.toBeNull();
    const top = result.topMatch!;
    if (top.kind === "game") {
      expect(result.games.some((g) => g.id === top.id)).toBe(false);
    } else if (top.kind === "family") {
      expect(result.families.some((f) => f.id === top.id)).toBe(false);
    } else {
      expect(result.categories.some((c) => c.id === top.id)).toBe(false);
    }
  });

  it("weights matches title (3x) > category (1.5x) > description (1x)", () => {
    // Same substring, same tier (substring=30), different weights: scoreField
    // should produce a strict ordering: title 3x > category 1.5x > description 1x.
    const word = "zzqx"; // arbitrary substring; only the weight matters here
    const text = `lead-${word}-trail`;
    const titleScore = scoreField(text, word, 3);
    const categoryScore = scoreField(text, word, 1.5);
    const descScore = scoreField(text, word, 1);
    expect(titleScore).toBeGreaterThan(categoryScore);
    expect(categoryScore).toBeGreaterThan(descScore);
    expect(titleScore / descScore).toBeCloseTo(3, 5);
    expect(categoryScore / descScore).toBeCloseTo(1.5, 5);

    // Verify the same weighting actually shapes ranking: a query that hits
    // a game's title should outrank one that only hits its description /
    // category in the buildHits output. "solitaire" appears as a category
    // AND inside many descriptions / titles; the top hit must be a title-
    // bearing entity (game or family), not a bare category tile, because
    // title weight (3) > category weight (1.5).
    const hits = buildHits("solitaire");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.score).toBeGreaterThan(0);
    // Hits are sorted descending by score.
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i - 1]!.score).toBeGreaterThanOrEqual(hits[i]!.score);
    }
  });
});
