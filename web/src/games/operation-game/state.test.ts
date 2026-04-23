import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, advance, ALL_TARGETS, TOTAL_OPERATIONS } from "./state.js";

const normal = { difficulty: "normal" as const };
const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Operation Game", () => {
  it("initializes with 10 shuffled targets and phase=waiting", () => {
    const s = initialState(42, normal);
    expect(s.targets).toHaveLength(TOTAL_OPERATIONS);
    expect(s.phase).toBe("waiting");
    expect(s.score).toBe(0);
    expect(s.currentIdx).toBe(0);
  });

  it("start action transitions to active phase", () => {
    const s = initialState(42, normal);
    const next = reducer(s, { type: "start" });
    expect(next.phase).toBe("active");
  });

  it("fast tap (within window) counts as success", () => {
    const s = initialState(42, normal);
    const active = reducer(s, { type: "start" });
    const result = reducer(active, { type: "tap", elapsedMs: 100 });
    expect(result.phase).toBe("success");
    expect(result.successes).toBe(1);
    expect(result.score).toBeGreaterThan(0);
  });

  it("slow tap (beyond window) counts as miss", () => {
    const s = initialState(42, normal);
    const active = reducer(s, { type: "start" });
    const target = active.targets[0]!;
    const result = reducer(active, { type: "tap", elapsedMs: target.windowMs * 2 });
    expect(result.phase).toBe("miss");
    expect(result.misses).toBe(1);
    expect(result.score).toBe(0);
  });

  it("completes all 10 operations and sets phase=done", () => {
    let s = initialState(42, normal);
    for (let i = 0; i < TOTAL_OPERATIONS; i++) {
      s = reducer(s, { type: "start" });
      s = reducer(s, { type: "tap", elapsedMs: 100 }); // always fast
      if (s.phase !== "done") s = advance(s);
    }
    expect(s.phase).toBe("done");
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, normal);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = initialState(42, normal);
    const done = { ...s, phase: "done" as const, score: 750 };
    expect(isTerminal(done)).toEqual({ score: 750 });
  });

  it("easy difficulty gives larger time windows", () => {
    const sNormal = initialState(42, normal);
    const sEasy = initialState(42, easy);
    expect(sEasy.difficultyMultiplier).toBeGreaterThan(sNormal.difficultyMultiplier);
  });

  it("hard difficulty gives smaller time windows", () => {
    const sNormal = initialState(42, normal);
    const sHard = initialState(42, hard);
    expect(sHard.difficultyMultiplier).toBeLessThan(sNormal.difficultyMultiplier);
  });

  it("ALL_TARGETS has 10 unique operations", () => {
    expect(ALL_TARGETS).toHaveLength(10);
    const names = ALL_TARGETS.map((t) => t.name);
    const unique = new Set(names);
    expect(unique.size).toBe(10);
  });
});
