import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, PATH_LEN } from "./state.js";

const S = { dummy: false };

describe("pursuit-mini", () => {
  it("starts at pos 0 with 0 wisdom", () => {
    const s = initialState(1, S);
    expect(s.pos).toBe(0);
    expect(s.wisdom).toBe(0);
  });
  it("roll triggers asking phase", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.phase).toBe("asking");
    expect(s.current).not.toBeNull();
  });
  it("answer awards wisdom on correct", () => {
    let s = reducer(initialState(1, S), { type: "roll" });
    const correctAnswer = s.current!.a;
    s = reducer(s, { type: "answer", value: correctAnswer });
    expect(s.wisdom).toBeGreaterThanOrEqual(10);
  });
  it("eventually finishes", () => {
    let s = initialState(2, S);
    for (let i = 0; i < 200; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "asking") s = reducer(s, { type: "answer", value: true });
      else if (s.phase === "answered") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(s.pos).toBeGreaterThanOrEqual(PATH_LEN);
    expect(score(s)).toBeGreaterThanOrEqual(0);
    expect(isTerminal(s)).not.toBeNull();
  });
});
