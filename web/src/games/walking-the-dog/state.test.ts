import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { length: "short" as const };

describe("initialState", () => {
  it("starts at step 0 with energy 70", () => {
    const s = initialState(42, def);
    expect(s.step).toBe(0);
    expect(s.energy).toBe(70);
    expect(s.treats).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("short walk has 10 steps", () => {
    const s = initialState(42, def);
    expect(s.totalSteps).toBe(10);
  });

  it("is deterministic", () => {
    const s1 = initialState(123, def);
    const s2 = initialState(123, def);
    expect(s1.hazardAhead).toBe(s2.hazardAhead);
    expect(s1.energy).toBe(s2.energy);
  });
});

describe("reducer — walk", () => {
  it("increments step", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "walk" });
    expect(s2.step).toBe(1);
  });

  it("on clear path: gains treat and energy", () => {
    const s = { ...initialState(42, def), hazardAhead: null };
    const s2 = reducer(s, { type: "walk" });
    expect(s2.treats).toBe(1);
    expect(s2.energy).toBeGreaterThanOrEqual(s.energy);
  });

  it("on hazard: loses energy", () => {
    const s = { ...initialState(42, def), hazardAhead: "puddle" as const };
    const s2 = reducer(s, { type: "walk" });
    expect(s2.energy).toBeLessThan(s.energy);
  });

  it("no-op after game over", () => {
    const s = { ...initialState(42, def), gameOver: true };
    const s2 = reducer(s, { type: "walk" });
    expect(s2).toBe(s);
  });
});

describe("reducer — dodge", () => {
  it("dodge hazard costs less energy than walking through it", () => {
    const s = { ...initialState(42, def), hazardAhead: "bike" as const };
    const walked = reducer(s, { type: "walk" });
    const dodged = reducer(s, { type: "dodge" });
    expect(dodged.energy).toBeGreaterThan(walked.energy);
  });

  it("dodging clear path loses energy", () => {
    const s = { ...initialState(42, def), hazardAhead: null };
    const s2 = reducer(s, { type: "dodge" });
    expect(s2.energy).toBeLessThan(s.energy);
  });
});

describe("reducer — sniff", () => {
  it("sniff on clear path earns 2 treats", () => {
    const s = { ...initialState(42, def), hazardAhead: null };
    const s2 = reducer(s, { type: "sniff" });
    expect(s2.treats).toBe(2);
  });

  it("sniff on hazard loses energy", () => {
    const s = { ...initialState(42, def), hazardAhead: "cat" as const };
    const s2 = reducer(s, { type: "sniff" });
    expect(s2.energy).toBeLessThan(s.energy);
  });
});

describe("game completion", () => {
  it("ends after totalSteps", () => {
    let s = initialState(42, def);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "walk" });
    }
    expect(s.gameOver).toBe(true);
  });

  it("ends early if energy hits 0", () => {
    const s = { ...initialState(42, def), energy: 5, hazardAhead: "puddle" as const };
    const s2 = reducer(s, { type: "walk" });
    expect(s2.energy).toBeLessThanOrEqual(0);
    // If energy <= 0 the game ends
    if (s2.energy <= 0) expect(s2.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, def), gameOver: true, score: 300 };
    expect(isTerminal(s)!.score).toBe(300);
  });
});
