import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestFive, bestLow8, TOTAL_HANDS } from "./state.js";

const S = { startingBankroll: "1000" as const, ante: "10" as const };

describe("7-Card Stud Hi-Lo heads-up", () => {
  it("starts on street 0", () => {
    const s = initialState(1, S);
    expect(s.street).toBe(0);
  });

  it("deal puts both players on 3rd street with 3 cards (2 down + 1 up)", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.player.cards).toHaveLength(3);
    expect(s.player.up).toEqual([false, false, true]);
    expect(s.cpu.up).toEqual([false, false, true]);
    expect(s.pot).toBe(20);
  });

  it("bestLow8 detects qualifying low", () => {
    const cards = [
      { suit: "♠" as const, rank: 1 as const, id: "a" },
      { suit: "♥" as const, rank: 2 as const, id: "b" },
      { suit: "♦" as const, rank: 3 as const, id: "c" },
      { suit: "♣" as const, rank: 4 as const, id: "d" },
      { suit: "♠" as const, rank: 5 as const, id: "e" },
      { suit: "♥" as const, rank: 13 as const, id: "f" },
      { suit: "♦" as const, rank: 12 as const, id: "g" },
    ];
    const lo = bestLow8(cards);
    expect(lo.ok).toBe(true);
    expect(lo.ranks).toEqual([5, 4, 3, 2, 1]);
  });

  it("bestFive detects flush from 7 cards", () => {
    const cards = [
      { suit: "♠" as const, rank: 1 as const, id: "a" },
      { suit: "♠" as const, rank: 5 as const, id: "b" },
      { suit: "♠" as const, rank: 7 as const, id: "c" },
      { suit: "♠" as const, rank: 9 as const, id: "d" },
      { suit: "♠" as const, rank: 11 as const, id: "e" },
      { suit: "♥" as const, rank: 13 as const, id: "f" },
      { suit: "♦" as const, rank: 12 as const, id: "g" },
    ];
    expect(bestFive(cards).class).toBe("flush");
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("game ends in <= TOTAL_HANDS via folds", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_HANDS + 2; i++) {
      s = reducer(s, { type: "deal" });
      s = reducer(s, { type: "fold" });
    }
    expect(s.handsPlayed).toBeLessThanOrEqual(TOTAL_HANDS);
  });
});
