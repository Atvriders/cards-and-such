import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, DICE_COUNT, pendingScoreOf, TOTAL_ROUNDS } from "./state.js";
import type { FarkleMiniState } from "./state.js";

const S = { dummy: false };

describe("FarkleMini initial state", () => {
  it("starts in rollReady, round 1, no dice on board", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rollReady");
    expect(s.round).toBe(1);
    expect(s.totalScore).toBe(0);
    expect(s.dice).toEqual([]);
  });

  it("is deterministic for same seed", () => {
    expect(initialState(7, S)).toEqual(initialState(7, S));
  });
});

describe("FarkleMini scoring engine", () => {
  it("scores a single 1 as 100", () => {
    expect(pendingScoreOf([1])).toBe(100);
  });
  it("scores three 4s as 400", () => {
    expect(pendingScoreOf([4, 4, 4])).toBe(400);
  });
  it("scores three 1s as 1000", () => {
    expect(pendingScoreOf([1, 1, 1])).toBe(1000);
  });
  it("scores 1-2-3-4-5-6 as 1500", () => {
    expect(pendingScoreOf([1, 2, 3, 4, 5, 6])).toBe(1500);
  });
  it("returns 0 when picking unscorable dice", () => {
    expect(pendingScoreOf([2, 3, 4])).toBe(0);
  });
});

describe("FarkleMini roll flow", () => {
  it("first roll produces 6 dice and either decide or scored (Farkle)", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.dice.length).toBe(DICE_COUNT);
    expect(["decide", "scored", "done"]).toContain(s.phase);
  });

  it("toggling a non-scoring die does not increase pendingScore", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    if (s.phase !== "decide") return;
    // Find a non-scoring die (a 2/3/4/6 if any)
    const idx = s.dice.findIndex((d) => d.value !== 1 && d.value !== 5);
    if (idx >= 0) {
      const after = reducer(s, { type: "togglePick", idx });
      // Pendingscore = scoreFarkleSelection of single non-1/5 = 0
      expect(after.pendingScore).toBe(0);
    }
  });

  it("toggling a 1 yields pendingScore 100", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    if (s.phase !== "decide") return;
    const idx = s.dice.findIndex((d) => d.value === 1);
    if (idx >= 0) {
      const after = reducer(s, { type: "togglePick", idx });
      expect(after.pendingScore).toBe(100);
    }
  });
});

describe("FarkleMini bank action", () => {
  it("bank with 0 picked + 0 bank does nothing", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    if (s.phase !== "decide") return;
    const before = s.totalScore;
    const after = reducer(s, { type: "bank" });
    if (s.roundBank === 0 && s.pendingScore === 0) {
      expect(after.totalScore).toBe(before);
    }
  });

  it("bank with valid scoring picks transitions to scored and adds to totalScore", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    if (s.phase !== "decide") return;
    const idx = s.dice.findIndex((d) => d.value === 1 || d.value === 5);
    if (idx < 0) return;
    s = reducer(s, { type: "togglePick", idx });
    const expectedAdd = s.pendingScore;
    s = reducer(s, { type: "bank" });
    expect(["scored", "done"]).toContain(s.phase);
    expect(s.totalScore).toBe(expectedAdd);
  });
});

describe("FarkleMini terminal", () => {
  it("isTerminal null during play", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("forced done state returns score", () => {
    const fake: FarkleMiniState = {
      ...initialState(1, S),
      phase: "done",
      totalScore: 1234,
    };
    expect(isTerminal(fake)).toEqual({ score: 1234 });
  });

  it("game eventually completes after TOTAL_ROUNDS rounds", () => {
    let s = initialState(99, S);
    let safety = 200;
    while (s.phase !== "done" && safety-- > 0) {
      if (s.phase === "rollReady") s = reducer(s, { type: "roll" });
      else if (s.phase === "decide") {
        // pick any scoring die or bank if nothing
        const idx = s.dice.findIndex((d) => d.value === 1 || d.value === 5);
        if (idx >= 0) {
          s = reducer(s, { type: "togglePick", idx });
          s = reducer(s, { type: "bank" });
        } else {
          // can't score; advance by rolling (will Farkle)
          s = reducer(s, { type: "bank" });
          if (s.phase === "decide") s = reducer(s, { type: "roll" });
        }
      } else if (s.phase === "scored") {
        s = reducer(s, { type: "next" });
      }
    }
    expect(s.phase).toBe("done");
    expect(s.round).toBeLessThanOrEqual(TOTAL_ROUNDS);
  });
});
