import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isValidMeld, isWild, isCanasta, firstMeldThreshold } from "./state.js";

const defaultSettings = { botCount: 1 };

describe("Canasta - isWild", () => {
  it("identifies rank-2 as wild", () => {
    expect(isWild({ suit: "♠" as const, rank: 2 as const, id: "x" })).toBe(true);
  });
  it("identifies joker-prefix id as wild", () => {
    expect(isWild({ suit: "♠" as const, rank: 2 as const, id: "joker-0" })).toBe(true);
  });
  it("does not flag regular card as wild", () => {
    expect(isWild({ suit: "♠" as const, rank: 7 as const, id: "x" })).toBe(false);
  });
});

describe("Canasta - isValidMeld", () => {
  it("accepts 3 naturals same rank", () => {
    const cards = [
      { suit: "♠" as const, rank: 7 as const, id: "a" },
      { suit: "♥" as const, rank: 7 as const, id: "b" },
      { suit: "♦" as const, rank: 7 as const, id: "c" },
    ];
    expect(isValidMeld(cards)).toBe(true);
  });
  it("rejects rank-3 melds", () => {
    const cards = [
      { suit: "♠" as const, rank: 3 as const, id: "a" },
      { suit: "♥" as const, rank: 3 as const, id: "b" },
      { suit: "♦" as const, rank: 3 as const, id: "c" },
    ];
    expect(isValidMeld(cards)).toBe(false);
  });
  it("rejects when wilds outnumber naturals", () => {
    const cards = [
      { suit: "♠" as const, rank: 2 as const, id: "w1" },
      { suit: "♥" as const, rank: 2 as const, id: "w2" },
      { suit: "♦" as const, rank: 7 as const, id: "n1" },
    ];
    expect(isValidMeld(cards)).toBe(false);
  });
  it("accepts 2 naturals + 1 wild", () => {
    const cards = [
      { suit: "♠" as const, rank: 7 as const, id: "n1" },
      { suit: "♥" as const, rank: 7 as const, id: "n2" },
      { suit: "♦" as const, rank: 2 as const, id: "w1" },
    ];
    expect(isValidMeld(cards)).toBe(true);
  });
});

describe("Canasta - isCanasta", () => {
  it("returns true for 7+ card meld", () => {
    const meld = {
      id: "x", owner: 0,
      cards: Array.from({ length: 7 }, (_, i) => ({ suit: "♠" as const, rank: 7 as const, id: `c${i}` })),
    };
    expect(isCanasta(meld)).toBe(true);
  });
  it("returns false for 6-card meld", () => {
    const meld = {
      id: "x", owner: 0,
      cards: Array.from({ length: 6 }, (_, i) => ({ suit: "♠" as const, rank: 7 as const, id: `c${i}` })),
    };
    expect(isCanasta(meld)).toBe(false);
  });
});

describe("Canasta - firstMeldThreshold", () => {
  it("returns 50 at score 0", () => { expect(firstMeldThreshold(0)).toBe(50); });
  it("returns 90 at score 2000", () => { expect(firstMeldThreshold(2000)).toBe(90); });
  it("returns 120 at score 4000", () => { expect(firstMeldThreshold(4000)).toBe(120); });
});

describe("Canasta - initialState", () => {
  it("deals 11 cards to each player", () => {
    const s = initialState(42, defaultSettings);
    expect(s.hands[0]!.length).toBe(11);
    expect(s.hands[1]!.length).toBe(11);
  });
  it("starts in player-draw phase", () => {
    expect(initialState(1, defaultSettings).phase).toBe("player-draw");
  });
  it("has a discard pile of 1", () => {
    const s = initialState(5, defaultSettings);
    expect(s.discardPile.length).toBe(1);
  });
});

describe("Canasta - isTerminal", () => {
  it("returns null when not done", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
  it("returns score when done", () => {
    const s = { ...initialState(1, defaultSettings), phase: "done" as const };
    expect(isTerminal(s)).not.toBeNull();
  });
});
