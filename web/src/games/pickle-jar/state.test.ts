import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { jars: "3" as const };

describe("PickleJar", () => {
  it("starts with 0 progress", () => { expect(initialState(1, S).openProgress).toBe(0); });
  it("good click advances progress", () => {
    const s = { ...initialState(1, S), meter: 50 };
    const s2 = reducer(s, { type: "click" });
    expect(s2.openProgress).toBe(1);
    expect(s2.score).toBeGreaterThan(0);
  });
  it("bad click reduces progress (but not below 0)", () => {
    const s = { ...initialState(1, S), meter: 10 };
    const s2 = reducer(s, { type: "click" });
    expect(s2.openProgress).toBe(0);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
