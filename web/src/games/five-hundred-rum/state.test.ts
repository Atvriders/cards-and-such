import { describe, it, expect } from "vitest";
import { initialState, isTerminal, isValidSet, isValidRun, isValidMeld, canLayOff, cardMeldValue } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function c(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("500 Rum - cardMeldValue", () => {
  it("Ace = 15", () => { expect(cardMeldValue(1)).toBe(15); });
  it("Face cards = 10", () => { expect(cardMeldValue(11)).toBe(10); });
  it("Number cards = face value", () => { expect(cardMeldValue(7)).toBe(7); });
});

describe("500 Rum - isValidSet", () => {
  it("accepts 3 same-rank different suits", () => {
    expect(isValidSet([c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")])).toBe(true);
  });
  it("rejects duplicate suits", () => {
    expect(isValidSet([c("♠", 7, "a"), c("♠", 7, "b"), c("♦", 7, "c")])).toBe(false);
  });
  it("rejects fewer than 3", () => {
    expect(isValidSet([c("♠", 7, "a"), c("♥", 7, "b")])).toBe(false);
  });
});

describe("500 Rum - isValidRun", () => {
  it("accepts 3 consecutive same-suit", () => {
    expect(isValidRun([c("♠", 5, "a"), c("♠", 6, "b"), c("♠", 7, "c")])).toBe(true);
  });
  it("rejects non-consecutive", () => {
    expect(isValidRun([c("♠", 5, "a"), c("♠", 7, "b"), c("♠", 9, "c")])).toBe(false);
  });
  it("rejects mixed suits", () => {
    expect(isValidRun([c("♠", 5, "a"), c("♥", 6, "b"), c("♠", 7, "c")])).toBe(false);
  });
});

describe("500 Rum - canLayOff", () => {
  it("can extend a run at the top", () => {
    const meld = { id: "m", owner: 0, cards: [c("♠", 5, "a"), c("♠", 6, "b"), c("♠", 7, "c")] };
    expect(canLayOff(c("♠", 8, "d"), meld)).toBe(true);
  });
  it("can extend a run at the bottom", () => {
    const meld = { id: "m", owner: 0, cards: [c("♠", 5, "a"), c("♠", 6, "b"), c("♠", 7, "c")] };
    expect(canLayOff(c("♠", 4, "d"), meld)).toBe(true);
  });
  it("cannot lay off wrong rank on set", () => {
    const meld = { id: "m", owner: 0, cards: [c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")] };
    expect(canLayOff(c("♣", 8, "d"), meld)).toBe(false);
  });
});

describe("500 Rum - initialState", () => {
  it("deals 7 cards each", () => {
    const s = initialState(1, { numBots: 1 });
    expect(s.hands[0]!.length).toBe(7);
    expect(s.hands[1]!.length).toBe(7);
  });
  it("starts at 0 score", () => {
    const s = initialState(2, { numBots: 1 });
    expect(s.scores[0]).toBe(0);
  });
  it("isTerminal null initially", () => {
    expect(isTerminal(initialState(3, { numBots: 1 }))).toBeNull();
  });
  it("starts in player-draw", () => {
    expect(initialState(4, { numBots: 2 }).phase).toBe("player-draw");
  });
});
