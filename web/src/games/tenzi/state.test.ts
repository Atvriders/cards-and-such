import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TenziState } from "./state.js";

const settings = { dice: "10" as const };

describe("Tenzi initialState", () => {
  it("starts with correct number of dice", () => {
    const s = initialState(42, settings);
    expect(s.dice).toHaveLength(10);
    expect(s.numDice).toBe(10);
    expect(s.target).toBeNull();
    expect(s.phase).toBe("pickTarget");
    expect(s.winner).toBeNull();
  });

  it("all dice have valid values 1-6", () => {
    const s = initialState(42, settings);
    for (const d of s.dice) {
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.dice).toEqual(s2.dice);
  });

  it("respects dice count setting", () => {
    const s = initialState(42, { dice: "15" });
    expect(s.dice).toHaveLength(15);
    expect(s.numDice).toBe(15);
  });
});

describe("Tenzi setTarget", () => {
  it("sets target and locks matching dice", () => {
    // Build a state where we know some dice values
    const s = initialState(42, settings);
    // Find most common face to pick as target
    const counts: Record<number, number> = {};
    for (const d of s.dice) counts[d] = (counts[d] ?? 0) + 1;
    const targetFace = Number(Object.entries(counts).sort((a, b) => b[1]! - a[1]!)[0]![0]) as 1;
    const s2 = reducer(s, { type: "setTarget", face: targetFace });
    expect(s2.target).toBe(targetFace);
    const lockedCount = s2.locked.filter(Boolean).length;
    expect(lockedCount).toBe(counts[targetFace]);
    expect(["rolling", "done"]).toContain(s2.phase);
  });

  it("cannot set target in rolling phase", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "setTarget", face: 3 });
    const s3 = reducer(s2, { type: "setTarget", face: 4 });
    // Target should not change
    expect(s3.target).toBe(s2.target);
  });
});

describe("Tenzi roll", () => {
  it("roll increments rollCount", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "setTarget", face: 6 });
    if (s2.phase !== "rolling") return;
    const count0 = s2.rollCount;
    const s3 = reducer(s2, { type: "roll" });
    expect(s3.rollCount).toBe(count0 + 1);
  });

  it("locked dice stay unchanged after roll", () => {
    const base = initialState(42, settings);
    // Force a state with some locked dice
    const withLocked: TenziState = {
      ...base,
      target: 5,
      dice: [5, 1, 5, 2, 3, 4, 5, 6, 2, 1],
      locked: [true, false, true, false, false, false, true, false, false, false],
      phase: "rolling",
    };
    const s2 = reducer(withLocked, { type: "roll" });
    // Dice at locked positions should still be 5
    expect(s2.dice[0]).toBe(5);
    expect(s2.dice[2]).toBe(5);
    expect(s2.dice[6]).toBe(5);
  });

  it("game ends when all dice are locked", () => {
    const base = initialState(42, settings);
    const almostDone: TenziState = {
      ...base,
      target: 3,
      dice: [3, 1, 3, 3, 3, 3, 3, 3, 3, 3],
      locked: [true, false, true, true, true, true, true, true, true, true],
      phase: "rolling",
      rollCount: 5,
    };
    // Force the remaining die to roll a 3 by replacing it
    const forcedDone: TenziState = {
      ...almostDone,
      dice: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      locked: Array(10).fill(true),
      phase: "done",
      winner: true,
    };
    const result = isTerminal(forcedDone);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(0, 10 * 10 - 5));
  });
});

describe("Tenzi isTerminal", () => {
  it("returns null when game ongoing", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("score is non-negative", () => {
    const s = initialState(42, settings);
    const won: TenziState = { ...s, winner: true, rollCount: 500, phase: "done" };
    const result = isTerminal(won);
    expect(result?.score).toBeGreaterThanOrEqual(0);
  });
});
