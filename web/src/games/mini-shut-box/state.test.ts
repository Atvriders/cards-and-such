import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  selectionSum,
  canSatisfy,
  computeFinalScore,
} from "./state.js";
import type { MiniShutBoxState } from "./state.js";

const S = { dummy: false };

describe("MiniShutBox initial state", () => {
  it("starts with all 9 tiles open", () => {
    const s = initialState(1, S);
    expect(s.open.every((o) => o)).toBe(true);
    expect(s.open.length).toBe(9);
  });

  it("starts in rolling phase, score 0", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.score).toBe(0);
  });

  it("is deterministic for same seed", () => {
    expect(initialState(7, S)).toEqual(initialState(7, S));
  });
});

describe("MiniShutBox roll action", () => {
  it("roll produces dice and transitions to selecting (or done if no combo)", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.dice).not.toBeNull();
    expect(["selecting", "done"]).toContain(s.phase);
    expect(s.sum).toBe(s.dice![0] + s.dice![1]);
  });
});

describe("MiniShutBox selection", () => {
  it("toggle adds and removes from selected", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    if (s.phase !== "selecting") return;
    s = reducer(s, { type: "toggle", idx: 0 });
    expect(s.selected).toContain(0);
    s = reducer(s, { type: "toggle", idx: 0 });
    expect(s.selected).not.toContain(0);
  });

  it("submit only succeeds when selection sums to dice total", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    if (s.phase !== "selecting") return;
    // Try to submit nothing
    const before = s.open.slice();
    const after1 = reducer(s, { type: "submit" });
    expect(after1.open).toEqual(before);
    // Find a valid combo: try single tile equal to sum
    if (s.sum >= 1 && s.sum <= 9 && s.open[s.sum - 1]) {
      const sel = reducer(s, { type: "toggle", idx: s.sum - 1 });
      const after2 = reducer(sel, { type: "submit" });
      expect(after2.open[s.sum - 1]).toBe(false);
      expect(["rolling", "done"]).toContain(after2.phase);
    }
  });

  it("selecting closed tiles is rejected", () => {
    const fake: MiniShutBoxState = {
      ...initialState(1, S),
      open: [false, true, true, true, true, true, true, true, true],
      phase: "selecting",
      dice: [3, 1] as MiniShutBoxState["dice"],
      sum: 4,
    };
    const after = reducer(fake, { type: "toggle", idx: 0 });
    expect(after.selected).toEqual([]);
  });
});

describe("MiniShutBox endgame action", () => {
  it("endgame computes score from remaining open tiles", () => {
    const fake: MiniShutBoxState = {
      ...initialState(1, S),
      open: [false, false, false, false, false, true, true, true, true],
      phase: "rolling",
    };
    const after = reducer(fake, { type: "endgame" });
    expect(after.phase).toBe("done");
    // remSum = 6+7+8+9 = 30 => score = max(0, 50-30) = 20
    expect(after.score).toBe(20);
    expect(after.perfect).toBe(false);
  });

  it("perfect shut returns score 100", () => {
    const fake: MiniShutBoxState = {
      ...initialState(1, S),
      open: [false, false, false, false, false, false, false, false, false],
      phase: "rolling",
    };
    const after = reducer(fake, { type: "endgame" });
    expect(after.score).toBe(100);
    expect(after.perfect).toBe(true);
  });
});

describe("MiniShutBox helpers", () => {
  it("selectionSum sums correctly", () => {
    expect(selectionSum([0, 1, 2])).toBe(6); // tiles 1+2+3
    expect(selectionSum([8])).toBe(9);
  });

  it("canSatisfy detects feasibility", () => {
    expect(canSatisfy([true, true, true, true, true, true, true, true, true], 7)).toBe(true);
    expect(canSatisfy([false, false, false, false, false, false, false, false, true], 5)).toBe(false);
  });

  it("computeFinalScore for partial returns capped non-negative", () => {
    expect(computeFinalScore([true, ...Array(8).fill(false)] as boolean[])).toEqual({ score: 49, perfect: false });
    expect(computeFinalScore([true, true, true, true, true, true, true, true, true])).toEqual({ score: 5, perfect: false });
    expect(computeFinalScore(Array(9).fill(false))).toEqual({ score: 100, perfect: true });
  });
});

describe("MiniShutBox terminal", () => {
  it("isTerminal null in rolling", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("isTerminal returns score in done", () => {
    const fake: MiniShutBoxState = {
      ...initialState(1, S),
      phase: "done",
      score: 42,
    };
    expect(isTerminal(fake)).toEqual({ score: 42 });
  });
});
