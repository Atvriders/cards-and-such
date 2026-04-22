import { describe, it, expect } from "vitest";
import { initialState, isTerminal, isValidSet, isValidRun, meetsContract, CONTRACTS } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

function c(suit: Card["suit"], rank: Card["rank"], id?: string): Card {
  return { suit, rank, id: id ?? `${suit}${rank}` };
}

describe("Contract Rummy - isValidSet", () => {
  it("accepts 3 same-rank", () => {
    expect(isValidSet([c("♠", 9, "a"), c("♥", 9, "b"), c("♦", 9, "c")])).toBe(true);
  });
  it("rejects 2 cards", () => {
    expect(isValidSet([c("♠", 9, "a"), c("♥", 9, "b")])).toBe(false);
  });
});

describe("Contract Rummy - isValidRun", () => {
  it("accepts 4 consecutive same-suit", () => {
    expect(isValidRun([c("♥", 3, "a"), c("♥", 4, "b"), c("♥", 5, "c"), c("♥", 6, "d")])).toBe(true);
  });
  it("rejects non-consecutive", () => {
    expect(isValidRun([c("♥", 3, "a"), c("♥", 5, "b"), c("♥", 7, "c")])).toBe(false);
  });
  it("rejects mixed suits", () => {
    expect(isValidRun([c("♥", 3, "a"), c("♠", 4, "b"), c("♥", 5, "c")])).toBe(false);
  });
});

describe("Contract Rummy - meetsContract", () => {
  it("round 0: two sets of 3", () => {
    const g1 = [c("♠", 4, "a"), c("♥", 4, "b"), c("♦", 4, "c")];
    const g2 = [c("♠", 8, "d"), c("♥", 8, "e"), c("♦", 8, "f")];
    expect(meetsContract([g1, g2], CONTRACTS[0]!)).toBe(true);
  });
  it("round 1: set + run", () => {
    const set = [c("♠", 5, "a"), c("♥", 5, "b"), c("♦", 5, "c")];
    const run = [c("♣", 7, "d"), c("♣", 8, "e"), c("♣", 9, "f"), c("♣", 10, "g")];
    expect(meetsContract([set, run], CONTRACTS[1]!)).toBe(true);
  });
});

describe("Contract Rummy - initialState", () => {
  it("deals 10 cards in round 1", () => {
    const s = initialState(1, { contractRound: 0, numBots: 1 });
    expect(s.hands[0]!.length).toBe(10);
  });
  it("deals 12 cards in round 3", () => {
    const s = initialState(2, { contractRound: 2, numBots: 1 });
    expect(s.hands[0]!.length).toBe(12);
  });
  it("phase is player-draw", () => {
    expect(initialState(3, { contractRound: 0, numBots: 1 }).phase).toBe("player-draw");
  });
  it("isTerminal null initially", () => {
    expect(isTerminal(initialState(4, { contractRound: 1, numBots: 2 }))).toBeNull();
  });
});
