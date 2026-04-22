import { describe, it, expect } from "vitest";
import { initialState, isTerminal, isValidMeld, isBolivia, isCanasta, isWild } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function c(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Bolivia - isWild", () => {
  it("rank 2 is wild", () => { expect(isWild(c("♠", 2))).toBe(true); });
  it("joker prefix is wild", () => { expect(isWild({ suit: "♠", rank: 2, id: "joker-0" })).toBe(true); });
  it("rank 7 not wild", () => { expect(isWild(c("♠", 7))).toBe(false); });
});

describe("Bolivia - isValidMeld", () => {
  it("accepts 3 naturals same rank", () => {
    expect(isValidMeld([c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")])).toBe(true);
  });
  it("accepts 3 wilds (wild-only meld)", () => {
    expect(isValidMeld([c("♠", 2, "w1"), c("♥", 2, "w2"), c("♦", 2, "w3")])).toBe(true);
  });
  it("rejects fewer than 3", () => {
    expect(isValidMeld([c("♠", 7, "a"), c("♥", 7, "b")])).toBe(false);
  });
  it("rejects rank-3 normal meld", () => {
    expect(isValidMeld([c("♠", 3, "a"), c("♥", 3, "b"), c("♦", 3, "c")])).toBe(false);
  });
});

describe("Bolivia - isBolivia / isCanasta", () => {
  it("isBolivia true for 7 wild-meld", () => {
    const meld = { id: "x", owner: 0, isWildMeld: true, cards: Array.from({ length: 7 }, (_, i) => c("♠", 2, `w${i}`)) };
    expect(isBolivia(meld)).toBe(true);
  });
  it("isCanasta true for 7 normal set", () => {
    const meld = { id: "x", owner: 0, isWildMeld: false, cards: Array.from({ length: 7 }, (_, i) => c("♠", 7, `c${i}`)) };
    expect(isCanasta(meld)).toBe(true);
    expect(isBolivia(meld)).toBe(false);
  });
});

describe("Bolivia - initialState", () => {
  it("deals 11 cards to each player", () => {
    const s = initialState(1, { botCount: 1 });
    expect(s.hands[0]!.length).toBe(11);
    expect(s.hands[1]!.length).toBe(11);
  });
  it("starts in player-draw", () => {
    expect(initialState(2, { botCount: 1 }).phase).toBe("player-draw");
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, { botCount: 1 }))).toBeNull();
  });
  it("3 bots = 4 players", () => {
    expect(initialState(4, { botCount: 3 }).numPlayers).toBe(4);
  });
});
