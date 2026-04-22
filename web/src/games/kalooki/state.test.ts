import { describe, it, expect } from "vitest";
import { initialState, isTerminal, isValidSet, isValidRun, isValidMeld, cardValue, isWild } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function c(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Kalooki - isWild", () => {
  it("rank 2 is wild", () => { expect(isWild(c("♠", 2))).toBe(true); });
  it("joker id is wild", () => { expect(isWild({ suit: "♠", rank: 2, id: "joker-0" })).toBe(true); });
  it("regular card is not wild", () => { expect(isWild(c("♠", 7))).toBe(false); });
});

describe("Kalooki - cardValue", () => {
  it("Ace = 1", () => { expect(cardValue(1)).toBe(1); });
  it("wild (2) = 25", () => { expect(cardValue(2)).toBe(25); });
  it("face card = 10", () => { expect(cardValue(12)).toBe(10); });
  it("pip card = face value", () => { expect(cardValue(8)).toBe(8); });
});

describe("Kalooki - isValidSet", () => {
  it("accepts 3 same-rank cards", () => {
    expect(isValidSet([c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")])).toBe(true);
  });
  it("accepts set with 1 wild", () => {
    expect(isValidSet([c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 2, "w")])).toBe(true);
  });
  it("rejects fewer than 3", () => {
    expect(isValidSet([c("♠", 7, "a"), c("♥", 7, "b")])).toBe(false);
  });
});

describe("Kalooki - isValidRun", () => {
  it("accepts 3 consecutive same suit", () => {
    expect(isValidRun([c("♦", 5, "a"), c("♦", 6, "b"), c("♦", 7, "c")])).toBe(true);
  });
  it("rejects non-consecutive without wilds", () => {
    expect(isValidRun([c("♦", 5, "a"), c("♦", 7, "b"), c("♦", 9, "c")])).toBe(false);
  });
  it("rejects mixed suits", () => {
    expect(isValidRun([c("♦", 5, "a"), c("♠", 6, "b"), c("♦", 7, "c")])).toBe(false);
  });
});

describe("Kalooki - initialState", () => {
  it("deals 13 cards each", () => {
    const s = initialState(1, { botCount: 1 });
    expect(s.hands[0]!.length).toBe(13);
    expect(s.hands[1]!.length).toBe(13);
  });
  it("starts in player-draw phase", () => {
    expect(initialState(2, { botCount: 1 }).phase).toBe("player-draw");
  });
  it("hasMelded starts false", () => {
    const s = initialState(3, { botCount: 1 });
    expect(s.hasMelded[0]).toBe(false);
  });
  it("isTerminal null initially", () => {
    expect(isTerminal(initialState(4, { botCount: 1 }))).toBeNull();
  });
});
