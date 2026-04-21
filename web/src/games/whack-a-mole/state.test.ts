import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s30_3 = { duration: "30" as const, grid: "3" as const };
const s60_4 = { duration: "60" as const, grid: "4" as const };

describe("WhackAMole initialState", () => {
  it("all holes empty, score 0, elapsed 0, not ended", () => {
    const s = initialState(42, s30_3);
    expect(s.score).toBe(0);
    expect(s.elapsed).toBe(0);
    expect(s.ended).toBe(false);
    expect(s.holes.every((h) => h.kind === "empty")).toBe(true);
    expect(s.holes.length).toBe(9); // 3x3
  });

  it("4x4 grid has 16 holes", () => {
    const s = initialState(1, s60_4);
    expect(s.holes.length).toBe(16);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(99, s30_3);
    const s2 = initialState(99, s30_3);
    expect(s1.rngSeed).toBe(s2.rngSeed);
    expect(s1.holes.length).toBe(s2.holes.length);
  });

  it("5x5 grid has 25 holes", () => {
    const s = initialState(7, { duration: "90" as const, grid: "5" as const });
    expect(s.holes.length).toBe(25);
  });
});

describe("WhackAMole tick", () => {
  it("tick advances elapsed time", () => {
    const s = initialState(42, s30_3);
    const s2 = reducer(s, { type: "tick", dt: 1.5 });
    expect(s2.elapsed).toBeCloseTo(1.5);
  });

  it("tick ends game when elapsed >= duration", () => {
    const s = initialState(42, s30_3);
    const s2 = reducer(s, { type: "tick", dt: 30 });
    expect(s2.ended).toBe(true);
    expect(s2.elapsed).toBe(30);
  });

  it("tick ages moles and removes expired ones", () => {
    const s = initialState(42, s30_3);
    // Manually inject a mole with low timeRemaining
    const withMole = {
      ...s,
      holes: s.holes.map((h, i) =>
        i === 0 ? { kind: "mole" as const, timeRemaining: 0.1, spawnTime: 1.5 } : h,
      ),
    };
    const s2 = reducer(withMole, { type: "tick", dt: 0.5 });
    // After 0.5s the mole's time should have expired
    expect(s2.holes[0]!.kind).toBe("empty");
  });

  it("no more ticks after ended", () => {
    const s = initialState(42, s30_3);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(ended.ended).toBe(true);
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.elapsed).toBe(30); // doesn't advance further
  });
});

describe("WhackAMole whack", () => {
  it("whacking a mole increments score and clears hole", () => {
    const s = initialState(42, s30_3);
    const withMole = {
      ...s,
      holes: s.holes.map((h, i) =>
        i === 2 ? { kind: "mole" as const, timeRemaining: 1.0, spawnTime: 1.0 } : h,
      ),
    };
    const s2 = reducer(withMole, { type: "whack", index: 2 });
    expect(s2.score).toBe(1);
    expect(s2.holes[2]!.kind).toBe("empty");
  });

  it("whacking an empty hole is a no-op", () => {
    const s = initialState(42, s30_3);
    const s2 = reducer(s, { type: "whack", index: 0 });
    expect(s2.score).toBe(0);
  });

  it("whacking after game ended is a no-op", () => {
    const s = initialState(42, s30_3);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const withMole = {
      ...ended,
      holes: ended.holes.map((h, i) =>
        i === 0 ? { kind: "mole" as const, timeRemaining: 1.0, spawnTime: 1.0 } : h,
      ),
    };
    const s2 = reducer(withMole, { type: "whack", index: 0 });
    expect(s2.score).toBe(0);
  });

  it("multiple whacks accumulate score", () => {
    const s = initialState(42, s30_3);
    const withMoles = {
      ...s,
      holes: [
        { kind: "mole" as const, timeRemaining: 1.0, spawnTime: 1.0 },
        { kind: "mole" as const, timeRemaining: 1.0, spawnTime: 1.0 },
        { kind: "empty" as const },
        ...s.holes.slice(3),
      ],
    };
    let cur = reducer(withMoles, { type: "whack", index: 0 });
    cur = reducer(cur, { type: "whack", index: 1 });
    expect(cur.score).toBe(2);
  });
});

describe("WhackAMole isTerminal", () => {
  it("returns null while game running", () => {
    const s = initialState(42, s30_3);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score object when ended", () => {
    const s = initialState(42, s30_3);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const result = isTerminal(ended);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(0);
  });

  it("score reflects whacked moles", () => {
    const s = initialState(42, s30_3);
    const withMole = {
      ...s,
      holes: s.holes.map((h, i) =>
        i === 0 ? { kind: "mole" as const, timeRemaining: 1.0, spawnTime: 1.0 } : h,
      ),
    };
    const whacked = reducer(withMole, { type: "whack", index: 0 });
    const ended = reducer(whacked, { type: "tick", dt: 30 });
    const result = isTerminal(ended);
    expect(result?.score).toBe(1);
  });
});
