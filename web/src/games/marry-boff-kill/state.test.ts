import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("MarryBoffKillState", () => {
  it("starts in playing phase round 0", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.currentIndex).toBe(0);
    expect(s.score).toBe(0);
    expect(s.rounds.length).toBeGreaterThanOrEqual(1);
  });
  it("rounds have 4 choices", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.choices.length).toBe(4);
      expect(r.correct).toBeGreaterThanOrEqual(0);
      expect(r.correct).toBeLessThanOrEqual(3);
    }
  });
  it("select updates selection", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "select", choice: 1 });
    expect(s.selected).toBe(1);
  });
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after enough rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "playing") {
        s = reducer(s, { type: "select", choice: 0 });
        s = reducer(s, { type: "submit" });
      }
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
});
