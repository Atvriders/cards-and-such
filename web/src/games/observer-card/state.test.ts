import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("Observer Card", () => {
  it("starts in playing with rounds", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.rounds.length).toBeGreaterThanOrEqual(TOTAL_ROUNDS);
  });
  it("tray non-empty per round", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.tray.length).toBeGreaterThanOrEqual(1);
    }
  });
  it("correct selection scores >= 10", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const s2 = reducer(reducer(s, { type: "select", choice: r.correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(10);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game completes through all rounds", () => {
    const s = initialState(1, S);
    let cur = s;
    for (let i = 0; i < s.rounds.length; i++) {
      cur = reducer(cur, { type: "select", choice: 0 });
      cur = reducer(cur, { type: "submit" });
      cur = reducer(cur, { type: "next" });
    }
    expect(cur.phase).toBe("done");
  });
});
