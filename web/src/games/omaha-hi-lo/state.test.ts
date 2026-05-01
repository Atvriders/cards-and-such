import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestOmaha, bestOmahaLow, TOTAL_HANDS } from "./state.js";

const S = { startingBankroll: "1000" as const, smallBlind: "10" as const };

describe("Omaha Hi-Lo heads-up", () => {
  it("starts in preflop with empty hands", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("preflop");
    expect(s.player.hole).toHaveLength(0);
  });

  it("deal posts blinds and gives 4 hole cards", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.player.hole).toHaveLength(4);
    expect(s.cpu.hole).toHaveLength(4);
    expect(s.pot).toBe(30);
  });

  it("bestOmahaLow detects wheel low (A-2-3-4-5)", () => {
    const hole = [
      { suit: "♠" as const, rank: 1 as const, id: "a" },
      { suit: "♥" as const, rank: 2 as const, id: "b" },
      { suit: "♦" as const, rank: 13 as const, id: "c" },
      { suit: "♣" as const, rank: 12 as const, id: "d" },
    ];
    const board = [
      { suit: "♠" as const, rank: 3 as const, id: "e" },
      { suit: "♥" as const, rank: 4 as const, id: "f" },
      { suit: "♦" as const, rank: 5 as const, id: "g" },
      { suit: "♣" as const, rank: 13 as const, id: "h" },
      { suit: "♠" as const, rank: 11 as const, id: "i" },
    ];
    const lo = bestOmahaLow(hole, board);
    expect(lo.ok).toBe(true);
    expect(lo.ranks).toEqual([5, 4, 3, 2, 1]);
  });

  it("bestOmahaLow returns not-ok when no qualifying low", () => {
    const hole = [
      { suit: "♠" as const, rank: 13 as const, id: "a" },
      { suit: "♥" as const, rank: 12 as const, id: "b" },
      { suit: "♦" as const, rank: 11 as const, id: "c" },
      { suit: "♣" as const, rank: 10 as const, id: "d" },
    ];
    const board = [
      { suit: "♠" as const, rank: 9 as const, id: "e" },
      { suit: "♥" as const, rank: 8 as const, id: "f" },
      { suit: "♦" as const, rank: 7 as const, id: "g" },
      { suit: "♣" as const, rank: 13 as const, id: "h" },
      { suit: "♠" as const, rank: 11 as const, id: "i" },
    ];
    const lo = bestOmahaLow(hole, board);
    expect(lo.ok).toBe(false);
  });

  it("bestOmaha returns straight flush when 2+3 supports it", () => {
    const hole = [
      { suit: "♠" as const, rank: 1 as const, id: "a" },
      { suit: "♠" as const, rank: 13 as const, id: "b" },
      { suit: "♥" as const, rank: 5 as const, id: "c" },
      { suit: "♥" as const, rank: 6 as const, id: "d" },
    ];
    const board = [
      { suit: "♠" as const, rank: 12 as const, id: "e" },
      { suit: "♠" as const, rank: 11 as const, id: "f" },
      { suit: "♠" as const, rank: 10 as const, id: "g" },
      { suit: "♥" as const, rank: 7 as const, id: "h" },
      { suit: "♥" as const, rank: 8 as const, id: "i" },
    ];
    expect(bestOmaha(hole, board).class).toBe("straight-flush");
  });

  it("game advances after folds", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_HANDS; i++) {
      s = reducer(s, { type: "deal" });
      s = reducer(s, { type: "fold" });
    }
    expect(s.handsPlayed).toBeLessThanOrEqual(TOTAL_HANDS);
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
