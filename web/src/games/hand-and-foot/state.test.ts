import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isValidMeld, isWild } from "./state.js";

const defaultSettings = { botCount: 1 };

describe("Hand and Foot - isValidMeld", () => {
  it("accepts 3 same-rank naturals", () => {
    const cards = [
      { suit: "♠" as const, rank: 7 as const, id: "a" },
      { suit: "♥" as const, rank: 7 as const, id: "b" },
      { suit: "♦" as const, rank: 7 as const, id: "c" },
    ];
    expect(isValidMeld(cards)).toBe(true);
  });

  it("rejects 2 cards (too few)", () => {
    const cards = [
      { suit: "♠" as const, rank: 7 as const, id: "a" },
      { suit: "♥" as const, rank: 7 as const, id: "b" },
    ];
    expect(isValidMeld(cards)).toBe(false);
  });

  it("rejects meld where wilds outnumber naturals", () => {
    const cards = [
      { suit: "♠" as const, rank: 2 as const, id: "w1" },
      { suit: "♥" as const, rank: 2 as const, id: "w2" },
      { suit: "♦" as const, rank: 7 as const, id: "n1" },
    ];
    // 2 wilds vs 1 natural → invalid
    expect(isValidMeld(cards)).toBe(false);
  });

  it("accepts meld with 1 wild and 2 naturals", () => {
    const cards = [
      { suit: "♠" as const, rank: 2 as const, id: "w1" },
      { suit: "♥" as const, rank: 7 as const, id: "n1" },
      { suit: "♦" as const, rank: 7 as const, id: "n2" },
    ];
    expect(isValidMeld(cards)).toBe(true);
  });
});

describe("Hand and Foot - isWild", () => {
  it("identifies rank-2 as wild", () => {
    expect(isWild({ suit: "♠" as const, rank: 2 as const, id: "x" })).toBe(true);
  });

  it("does not flag non-2 rank as wild", () => {
    expect(isWild({ suit: "♠" as const, rank: 7 as const, id: "x" })).toBe(false);
  });
});

describe("Hand and Foot - initialState", () => {
  it("deals 11 cards to hand and 11 to foot for each player", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands[0]!.length).toBe(11);
    expect(s.feet[0]!.length).toBe(11);
    expect(s.hands[1]!.length).toBe(11);
    expect(s.feet[1]!.length).toBe(11);
  });

  it("starts in player-draw phase", () => {
    const s = initialState(99, defaultSettings);
    expect(s.phase).toBe("player-draw");
  });

  it("has correct number of players", () => {
    const s = initialState(1, { botCount: 2 });
    expect(s.numPlayers).toBe(3);
  });

  it("stock has remaining cards after dealing", () => {
    const s = initialState(7, defaultSettings);
    // 2 players × 22 cards = 44 dealt, 216 - 44 = 172
    expect(s.stock.length).toBe(172);
  });
});

describe("Hand and Foot - isTerminal", () => {
  it("returns null when not done", () => {
    const s = initialState(5, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns a score when done", () => {
    const s = { ...initialState(5, defaultSettings), phase: "done" as const, scores: [500, 200] };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});
