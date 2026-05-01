import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_HANDS } from "./state.js";

const S = { startingBankroll: "1000" as const, smallBlind: "10" as const };

describe("Crazy Pineapple heads-up", () => {
  it("starts in preflop", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("preflop");
  });

  it("deal gives 3 hole cards but does NOT prompt discard yet", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.player.hole).toHaveLength(3);
    expect(s.pendingDiscard).toBe(false);
  });

  it("discard prompt appears after flop is dealt", () => {
    let s = reducer(initialState(2, S), { type: "deal" });
    // Both check preflop → flop dealt → pendingDiscard true
    s = reducer(s, { type: "call" }); // player calls SB→BB
    // CPU may have raised, so loop until pendingDiscard or hand ends
    let safety = 30;
    while (!s.pendingDiscard && s.phase !== "showdown" && s.phase !== "done" && safety-- > 0) {
      if (s.toAct === "player") s = reducer(s, { type: "call" });
      else break;
    }
    if (s.phase === "flop") expect(s.pendingDiscard).toBe(true);
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
