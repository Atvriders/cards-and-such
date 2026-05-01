import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_HANDS } from "./state.js";

const S = { startingBankroll: "1000" as const, smallBlind: "10" as const };

describe("Pineapple heads-up", () => {
  it("starts in preflop", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("preflop");
  });

  it("deal gives 3 hole cards and prompts discard", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.player.hole).toHaveLength(3);
    expect(s.cpu.hole).toHaveLength(3);
    expect(s.pendingDiscard).toBe(true);
  });

  it("discard reduces hands to 2 cards each", () => {
    let s = reducer(initialState(2, S), { type: "deal" });
    s = reducer(s, { type: "discard", index: 0 });
    expect(s.player.hole).toHaveLength(2);
    expect(s.cpu.hole).toHaveLength(2);
    expect(s.pendingDiscard).toBe(false);
  });

  it("cannot bet while pending discard", () => {
    let s = reducer(initialState(2, S), { type: "deal" });
    const before = s;
    s = reducer(s, { type: "fold" });
    expect(s).toBe(before); // no-op
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("game ends in <= TOTAL_HANDS", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_HANDS + 2; i++) {
      s = reducer(s, { type: "deal" });
      if (s.pendingDiscard) s = reducer(s, { type: "discard", index: 0 });
      s = reducer(s, { type: "fold" });
    }
    expect(s.handsPlayed).toBeLessThanOrEqual(TOTAL_HANDS);
  });
});
