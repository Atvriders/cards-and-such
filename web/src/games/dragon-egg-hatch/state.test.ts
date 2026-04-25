import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { eggs: "3" as const };

describe("initialState", () => {
  it("creates correct number of eggs", () => {
    const s = initialState(1, settings);
    expect(s.eggs.length).toBe(3);
    expect(s.tick).toBe(0);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });

  it("eggs have valid hatch windows", () => {
    const s = initialState(42, settings);
    for (const egg of s.eggs) {
      expect(egg.hatchEnd).toBeGreaterThan(egg.hatchStart);
      expect(egg.tapped).toBe(false);
      expect(egg.missed).toBe(false);
    }
  });
});

describe("reducer tick", () => {
  it("increments tick", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.tick).toBe(1);
  });

  it("marks egg as missed after window closes", () => {
    let s = initialState(1, settings);
    const egg = s.eggs[0]!;
    // Advance past hatch window
    for (let i = 0; i <= egg.hatchEnd + 1; i++) {
      s = reducer(s, { type: "tick" });
    }
    expect(s.eggs[0]!.missed).toBe(true);
  });
});

describe("reducer tap", () => {
  it("tapping in window hatches the egg", () => {
    let s = initialState(1, settings);
    const egg = s.eggs[0]!;
    // Advance to glow window
    for (let i = 0; i < egg.hatchStart; i++) {
      s = reducer(s, { type: "tick" });
    }
    s = reducer(s, { type: "tap", eggId: 0 });
    expect(s.eggs[0]!.hatched).toBe(true);
    expect(s.score).toBeGreaterThan(0);
  });

  it("tapping outside window does not hatch", () => {
    const s = initialState(1, settings);
    // tick=0, before any glow window
    const s2 = reducer(s, { type: "tap", eggId: 0 });
    expect(s2.eggs[0]!.hatched).toBe(false);
  });
});

describe("isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 300 };
    expect(isTerminal(s)!.score).toBe(300);
  });
});
