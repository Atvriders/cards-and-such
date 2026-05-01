import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestFiveStud, TOTAL_HANDS } from "./state.js";

const S = { startingBankroll: "1000" as const, ante: "10" as const };

describe("5-Card Stud heads-up", () => {
  it("starts with street 0 (no cards dealt)", () => {
    const s = initialState(1, S);
    expect(s.street).toBe(0);
    expect(s.player.cards).toHaveLength(0);
  });

  it("deal posts antes and gives 2 cards each (1 down + 1 up)", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.player.cards).toHaveLength(2);
    expect(s.cpu.cards).toHaveLength(2);
    expect(s.cpu.up).toEqual([false, true]);
    expect(s.pot).toBe(20);
    expect(s.street).toBe(1);
  });

  it("bestFiveStud detects four of a kind", () => {
    const cards = [
      { suit: "♠" as const, rank: 13 as const, id: "a" },
      { suit: "♥" as const, rank: 13 as const, id: "b" },
      { suit: "♦" as const, rank: 13 as const, id: "c" },
      { suit: "♣" as const, rank: 13 as const, id: "d" },
      { suit: "♠" as const, rank: 5 as const, id: "e" },
    ];
    expect(bestFiveStud(cards).class).toBe("four-of-a-kind");
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("game ends in <= TOTAL_HANDS", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_HANDS + 2; i++) {
      s = reducer(s, { type: "deal" });
      s = reducer(s, { type: "fold" });
    }
    expect(s.handsPlayed).toBeLessThanOrEqual(TOTAL_HANDS);
  });
});
