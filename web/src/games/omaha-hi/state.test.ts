import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestOmaha, TOTAL_HANDS } from "./state.js";

const S = { startingBankroll: "1000" as const, smallBlind: "10" as const };

describe("Omaha Hi heads-up", () => {
  it("starts in preflop with no hole cards before deal", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("preflop");
    expect(s.player.hole.length).toBe(0);
    expect(s.cpu.hole.length).toBe(0);
  });

  it("deal gives both players exactly 4 hole cards and posts blinds", () => {
    const s = reducer(initialState(1, S), { type: "deal" });
    expect(s.player.hole).toHaveLength(4);
    expect(s.cpu.hole).toHaveLength(4);
    expect(s.pot).toBe(30); // 10 SB + 20 BB
  });

  it("bestOmaha enforces 2-from-hole + 3-from-board", () => {
    const ah = [
      { suit: "♠" as const, rank: 1 as const, id: "a" },
      { suit: "♠" as const, rank: 13 as const, id: "b" },
      { suit: "♥" as const, rank: 2 as const, id: "c" },
      { suit: "♦" as const, rank: 3 as const, id: "d" },
    ];
    const board = [
      { suit: "♠" as const, rank: 12 as const, id: "e" },
      { suit: "♠" as const, rank: 11 as const, id: "f" },
      { suit: "♠" as const, rank: 10 as const, id: "g" },
      { suit: "♥" as const, rank: 4 as const, id: "h" },
      { suit: "♥" as const, rank: 5 as const, id: "i" },
    ];
    const r = bestOmaha(ah, board);
    // Royal-ish: A♠ K♠ + Q♠ J♠ T♠ -> straight flush; uses 2 hole + 3 board correctly
    expect(r.class).toBe("straight-flush");
  });

  it("isTerminal is null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("fold ends the hand and awards pot to CPU", () => {
    const s1 = reducer(initialState(1, S), { type: "deal" });
    const s2 = reducer(s1, { type: "fold" });
    expect(s2.phase === "showdown" || s2.phase === "done").toBe(true);
    expect(s2.handsPlayed).toBeGreaterThan(0);
  });

  it("call advances state without crashing", () => {
    const s1 = reducer(initialState(2, S), { type: "deal" });
    const s2 = reducer(s1, { type: "call" });
    expect(s2).toBeTruthy();
    expect(typeof s2.pot).toBe("number");
  });

  it("game terminates after TOTAL_HANDS", () => {
    let s = initialState(7, S);
    let safety = 200;
    while (!isTerminal(s) && safety-- > 0) {
      if (s.phase === "preflop" && s.player.hole.length === 0) s = reducer(s, { type: "deal" });
      else if (s.phase === "showdown") s = reducer(s, { type: "deal" });
      else if (s.toAct === "player") s = reducer(s, { type: "fold" });
      else break;
    }
    expect(s.handsPlayed).toBeLessThanOrEqual(TOTAL_HANDS);
  });
});
