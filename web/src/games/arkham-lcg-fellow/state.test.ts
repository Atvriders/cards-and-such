import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, TARGET_SCORE } from "./state.js";

const S = { difficulty: "Standard" as const };

describe("arkham-lcg-fellow", () => {
  it("starts in choose phase with full morale", () => {
    const s = initialState(42, S);
    expect(s.phase).toBe("choose");
    expect(s.progress).toBe(0);
    expect(s.morale).toBeGreaterThan(0);
    expect(s.round).toBe(1);
  });
  it("playing a tactic advances round", () => {
    const s0 = initialState(42, S);
    const tid = "investigate";
    const s1 = reducer(s0, { type: "play", tacticId: tid });
    expect(s1.round).toBe(2);
    expect(s1.lastTactic).toBe(tid);
  });
  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends within total rounds", () => {
    let s = initialState(7, S);
    let safety = 0;
    while (s.phase !== "done" && safety++ < TOTAL_ROUNDS + 5) {
      s = reducer(s, { type: "play", tacticId: "investigate" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("invalid tactic id is a no-op", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "play", tacticId: "__bogus__" });
    expect(s1).toBe(s0);
  });
  it("target score is positive", () => { expect(TARGET_SCORE).toBeGreaterThan(0); });
});
