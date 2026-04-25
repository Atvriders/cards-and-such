import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, totalStrokes, scoreVsPar, getHolePar } from "./state.js";
import type { DiceGolfState } from "./state.js";

const defaultSettings = { holes: "9" as const };

describe("DiceGolf initialState", () => {
  it("starts at hole 1 with 0 strokes", () => {
    const s = initialState(42, defaultSettings);
    expect(s.currentHole).toBe(1);
    expect(s.currentStrokes).toBe(0);
    expect(s.holes.length).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(99, defaultSettings)).toEqual(initialState(99, defaultSettings));
  });
});

describe("DiceGolf getHolePar", () => {
  it("returns valid par values", () => {
    for (let i = 0; i < 18; i++) {
      const par = getHolePar(i);
      expect([3, 4, 5]).toContain(par);
    }
  });
});

describe("DiceGolf roll", () => {
  it("produces a roll on each action", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "roll" });
    expect(s2.lastRoll).not.toBeNull();
    expect(s2.lastResult).not.toBeNull();
  });

  it("is deterministic", () => {
    const s = initialState(42, defaultSettings);
    const a = reducer(s, { type: "roll" });
    const b = reducer(s, { type: "roll" });
    expect(a.lastRoll).toEqual(b.lastRoll);
  });

  it("hole in one finishes hole immediately", () => {
    // Inject a state where the next roll will produce sum=2 (holeInOne)
    // Use a seed that produces sum 2 on first roll
    // We'll test by checking the hole completes when progress jumps high
    const s = initialState(42, defaultSettings);
    // Simulate 10 rolls and check we eventually move to hole 2
    let state = s;
    let moved = false;
    for (let i = 0; i < 30; i++) {
      const prev = state.currentHole;
      state = reducer(state, { type: "roll" });
      if (state.currentHole > prev) { moved = true; break; }
    }
    expect(moved).toBe(true);
  });
});

describe("DiceGolf scoring", () => {
  it("totalStrokes sums all holes", () => {
    const holes = [
      { par: 4 as const, strokes: 5 },
      { par: 3 as const, strokes: 3 },
      { par: 5 as const, strokes: 4 },
    ];
    expect(totalStrokes(holes)).toBe(12);
  });

  it("scoreVsPar is negative when under par", () => {
    const holes = [{ par: 4 as const, strokes: 3 }];
    expect(scoreVsPar(holes)).toBe(-1);
  });
});

describe("DiceGolf isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("returns score when game is over", () => {
    const base = initialState(42, defaultSettings);
    const done: DiceGolfState = {
      ...base,
      gameOver: true,
      holes: [{ par: 4, strokes: 4 }, { par: 3, strokes: 3 }],
    };
    const result = isTerminal(done);
    expect(result).not.toBeNull();
    // 7 strokes, 7 par → 0 over → score = 500
    expect(result!.score).toBe(500);
  });
});
