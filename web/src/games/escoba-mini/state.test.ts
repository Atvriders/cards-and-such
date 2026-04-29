import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, SCORE_WIN } from "./state.js";
const S = { dummy: false };
describe("EscobaMini", () => {
  it("starts in ready phase", () => { expect(initialState(1, S).phase).toBe("ready"); });
  it("starts at round 1", () => { expect(initialState(1, S).round).toBe(1); });
  it("starts with score 0", () => { expect(initialState(1, S).score).toBe(0); });
  it("play produces both cards", () => {
    const s = reducer(initialState(1, S), { type: "play" });
    expect(s.you).not.toBeNull();
    expect(s.cpu).not.toBeNull();
  });
  it("score is non-negative after play", () => {
    const s = reducer(initialState(1, S), { type: "play" });
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("score never exceeds reasonable cap", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS * 2; i++) {
      s = reducer(s, { type: "play" });
      s = reducer(s, { type: "next" });
    }
    expect(s.score).toBeGreaterThanOrEqual(0);
    expect(s.score).toBeLessThanOrEqual(TOTAL_ROUNDS * (SCORE_WIN + 10));
  });
  it("isTerminal null at start", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("isTerminal true after all rounds played", () => {
    let s = initialState(42, S);
    for (let i = 0; i < TOTAL_ROUNDS * 2 + 5; i++) {
      if (s.phase === "ready") s = reducer(s, { type: "play" });
      else if (s.phase === "result") s = reducer(s, { type: "next" });
      else break;
    }
    expect(s.phase).toBe("done");
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    if (t) expect(t.score).toBeGreaterThanOrEqual(0);
  });
});
