import { describe, it, expect } from "vitest";
import { initialState, isTerminal, isSet, isRun, meetsContract, CONTRACTS } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function c(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Continental Rummy - isSet", () => {
  it("accepts 3 same-rank cards", () => {
    expect(isSet([c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")])).toBe(true);
  });
  it("rejects 2 cards", () => {
    expect(isSet([c("♠", 7, "a"), c("♥", 7, "b")])).toBe(false);
  });
  it("rejects mixed ranks", () => {
    expect(isSet([c("♠", 7, "a"), c("♥", 8, "b"), c("♦", 7, "c")])).toBe(false);
  });
});

describe("Continental Rummy - isRun", () => {
  it("accepts 4 consecutive same-suit", () => {
    expect(isRun([c("♠", 5, "a"), c("♠", 6, "b"), c("♠", 7, "c"), c("♠", 8, "d")])).toBe(true);
  });
  it("rejects mixed suits", () => {
    expect(isRun([c("♠", 5, "a"), c("♥", 6, "b"), c("♠", 7, "c")])).toBe(false);
  });
  it("rejects non-consecutive", () => {
    expect(isRun([c("♠", 5, "a"), c("♠", 7, "b"), c("♠", 9, "c")])).toBe(false);
  });
});

describe("Continental Rummy - meetsContract", () => {
  it("round 1: two sets of 3", () => {
    const group1 = [c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")];
    const group2 = [c("♠", 9, "d"), c("♥", 9, "e"), c("♦", 9, "f")];
    expect(meetsContract([group1, group2], CONTRACTS[0]!)).toBe(true);
  });
  it("round 2: set of 3 + run of 4", () => {
    const set = [c("♠", 7, "a"), c("♥", 7, "b"), c("♦", 7, "c")];
    const run = [c("♣", 5, "d"), c("♣", 6, "e"), c("♣", 7, "f"), c("♣", 8, "g")];
    expect(meetsContract([set, run], CONTRACTS[1]!)).toBe(true);
  });
  it("fails when group too short", () => {
    const group1 = [c("♠", 7, "a"), c("♥", 7, "b")];
    const group2 = [c("♠", 9, "d"), c("♥", 9, "e"), c("♦", 9, "f")];
    expect(meetsContract([group1, group2], CONTRACTS[0]!)).toBe(false);
  });
});

describe("Continental Rummy - initialState", () => {
  it("deals 10 cards each", () => {
    const s = initialState(42, { numBots: 1 });
    expect(s.hands[0]!.length).toBe(10);
    expect(s.hands[1]!.length).toBe(10);
  });
  it("starts in round 0", () => {
    expect(initialState(1, { numBots: 1 }).round).toBe(0);
  });
  it("phase is player-draw", () => {
    expect(initialState(2, { numBots: 1 }).phase).toBe("player-draw");
  });
  it("isTerminal null initially", () => {
    expect(isTerminal(initialState(3, { numBots: 1 }))).toBeNull();
  });
});
