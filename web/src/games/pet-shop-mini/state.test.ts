import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Pet Shop Mini", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(3);
    expect(s.day).toBe(1);
    expect(s.phase).toBe("plan");
    expect(s.cash).toBe(300);
    expect(s.pets).toHaveLength(5);
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(3))).toBeNull();
  });

  it("isTerminal returns score at done", () => {
    const s = { ...initialState(3), phase: "done" as const, cash: 1000 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("openDay transitions to results phase", () => {
    const s = initialState(3);
    const s2 = reducer(s, { type: "openDay" });
    expect(s2.phase).toBe("results");
  });

  it("nextDay after results increments day", () => {
    const s = initialState(3);
    const s2 = reducer(s, { type: "openDay" });
    const s3 = reducer(s2, { type: "nextDay" });
    expect(s3.day).toBe(2);
    expect(s3.phase).toBe("plan");
  });

  it("setAdBudget clamps to 0-50", () => {
    const s = initialState(3);
    const s2 = reducer(s, { type: "setAdBudget", value: 200 });
    expect(s2.adBudget).toBe(50);
    const s3 = reducer(s, { type: "setAdBudget", value: -5 });
    expect(s3.adBudget).toBe(0);
  });
});
