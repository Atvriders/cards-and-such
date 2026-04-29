import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { GameSettings } from "./state.js";

const S: GameSettings = { rounds: "5" };

describe("arrowword", () => {
  it("creates the requested number of rounds", () => {
    const s = initialState(1, S);
    expect(s.rounds.length).toBeGreaterThanOrEqual(4);
    expect(s.rounds.length).toBeLessThanOrEqual(5);
  });
  it("starts in playing phase with score 0", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.score).toBe(0);
  });
  it("submitting correct answer awards positive score", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const s2 = reducer(reducer(s, { type: "select", choice: r.correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(100);
    expect(s2.correctCount).toBeGreaterThanOrEqual(1);
  });
  it("submitting wrong answer does not award score", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const wrong = ((r.correct + 1) % 4) as 0 | 1 | 2 | 3;
    const s2 = reducer(reducer(s, { type: "select", choice: wrong }), { type: "submit" });
    expect(s2.score).toBe(0);
  });
  it("isTerminal returns score when all rounds finished", () => {
    let s = initialState(1, S);
    expect(isTerminal(s)).toBeNull();
    while (s.phase !== "done") {
      const r = s.rounds[s.currentIndex]!;
      s = reducer(reducer(s, { type: "select", choice: r.correct }), { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });
});
