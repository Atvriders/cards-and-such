import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, TOTAL_ROUNDS } from "./state.js";

const S = { dummy: false };

describe("WingspanOceaniaDraft", () => {
  it("starts with 3-card offer and round 1", () => {
    const s = initialState(1, S);
    expect(s.offer.length).toBe(3);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("drafting");
  });
  it("pick adds to my tableau", () => {
    const s = reducer(initialState(1, S), { type: "pick", idx: 0 });
    expect(s.myTableau.length).toBeGreaterThanOrEqual(1);
    expect(s.cpuTableau.length).toBeGreaterThanOrEqual(1);
  });
  it("pick advances round or ends", () => {
    const s = reducer(initialState(1, S), { type: "pick", idx: 0 });
    expect(["round-done", "done"]).toContain(s.phase);
  });
  it("ends after TOTAL_ROUNDS", () => {
    let s = initialState(7, S);
    for (let i = 0; i < TOTAL_ROUNDS * 2 + 5; i++) {
      if (s.phase === "drafting") s = reducer(s, { type: "pick", idx: 0 });
      else if (s.phase === "round-done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
  it("score is non-negative", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_ROUNDS * 2 + 3; i++) {
      if (s.phase === "drafting") s = reducer(s, { type: "pick", idx: 0 });
      else if (s.phase === "round-done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
});
