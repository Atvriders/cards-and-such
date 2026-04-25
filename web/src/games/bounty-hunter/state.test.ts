import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";

describe("Bounty Hunter", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.round).toBe(1);
    expect(s.credits).toBe(100);
    expect(s.health).toBe(100);
    expect(s.phase).toBe("hunt");
  });

  it("pursuing moves to result phase", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "pursue" });
    expect(s2.phase).toBe("result");
    expect(s2.lastResult.length).toBeGreaterThan(0);
  });

  it("skipping moves to result with no credit gain", () => {
    const s = initialState(42);
    const credits = s.credits;
    const s2 = reducer(s, { type: "skip" });
    expect(s2.phase).toBe("result");
    expect(s2.credits).toBe(credits);
  });

  it("nextRound advances round counter", () => {
    const s = { ...initialState(42), phase: "result" as const };
    const s2 = reducer(s, { type: "nextRound" });
    expect(s2.round).toBe(2);
    expect(s2.phase).toBe("hunt");
  });

  it("isTerminal triggers only on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    const done = { ...s, phase: "done" as const, credits: 300 };
    expect(isTerminal(done)).not.toBeNull();
  });

  it("health reaching zero ends game", () => {
    const s = { ...initialState(42), health: 1 };
    const s2 = reducer(s, { type: "pursue" });
    // Either health went to 0 or target escaped without harm
    if (s2.health <= 0) expect(s2.phase).toBe("done");
  });

  it("completes all rounds", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      if (s.phase === "done") break;
      s = reducer(s, { type: "skip" });
      s = reducer(s, { type: "nextRound" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("score is bounded 0-100", () => {
    const s = { ...initialState(42), phase: "done" as const, credits: 100000 };
    expect(isTerminal(s)!.score).toBe(100);
    const s2 = { ...initialState(42), phase: "done" as const, credits: 0 };
    expect(isTerminal(s2)!.score).toBe(0);
  });
});
