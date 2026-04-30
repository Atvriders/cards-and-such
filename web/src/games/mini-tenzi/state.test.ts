import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, NUM_DICE, MAX_ROLLS, elapsedMs } from "./state.js";
import type { MiniTenziState } from "./state.js";

const S = { dummy: false };

describe("MiniTenzi initial state", () => {
  it("starts with NUM_DICE dice", () => {
    expect(initialState(1, S).dice.length).toBe(NUM_DICE);
  });

  it("auto-holds dice that match the chosen target", () => {
    const s = initialState(1, S);
    for (let i = 0; i < s.dice.length; i++) {
      if (s.dice[i] === s.target) expect(s.held[i]).toBe(true);
    }
  });

  it("starts in play (or won if all 10 match initial roll, extremely rare)", () => {
    const s = initialState(1, S);
    expect(["play", "won"]).toContain(s.phase);
  });

  it("is deterministic for same seed", () => {
    const a = initialState(123, S);
    const b = initialState(123, S);
    expect(a.dice).toEqual(b.dice);
    expect(a.target).toBe(b.target);
  });
});

describe("MiniTenzi roll mechanic", () => {
  it("roll increments rolls counter", () => {
    const s0 = initialState(1, S);
    if (s0.phase !== "play") return;
    const s = reducer(s0, { type: "roll" });
    expect(s.rolls).toBe(s0.rolls + 1);
  });

  it("rolling preserves held dice (held dice keep value)", () => {
    const s0 = initialState(2, S);
    if (s0.phase !== "play") return;
    const s = reducer(s0, { type: "roll" });
    for (let i = 0; i < s0.dice.length; i++) {
      if (s0.held[i]) expect(s.dice[i]).toBe(s0.dice[i]);
    }
  });

  it("auto-holds new matches after roll", () => {
    const s0 = initialState(7, S);
    if (s0.phase !== "play") return;
    const s = reducer(s0, { type: "roll" });
    for (let i = 0; i < s.dice.length; i++) {
      if (s.dice[i] === s.target) expect(s.held[i]).toBe(true);
    }
  });
});

describe("MiniTenzi toggle", () => {
  it("toggle flips held flag", () => {
    const s0 = initialState(1, S);
    const idx = 0;
    const before = s0.held[idx];
    const s1 = reducer(s0, { type: "toggle", idx });
    expect(s1.held[idx]).toBe(!before);
  });
});

describe("MiniTenzi terminal", () => {
  it("isTerminal null while playing", () => {
    const s = initialState(1, S);
    if (s.phase === "play") expect(isTerminal(s)).toBeNull();
  });

  it("forced won state returns score >= 100", () => {
    const fake: MiniTenziState = {
      ...initialState(1, S),
      phase: "won",
      rolls: 5,
    };
    const r = isTerminal(fake);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(100);
  });

  it("forced lost state returns partial score (5 per match)", () => {
    const dice = [1, 1, 1, 2, 3, 4, 5, 6, 6, 6] as MiniTenziState["dice"];
    const fake: MiniTenziState = {
      ...initialState(1, S),
      dice,
      target: 1,
      phase: "lost",
      rolls: MAX_ROLLS,
    };
    const r = isTerminal(fake);
    expect(r?.score).toBe(15);
  });
});

describe("MiniTenzi timer", () => {
  it("elapsedMs returns 0 before timer starts", () => {
    const s = initialState(1, S);
    expect(elapsedMs(s, 99999)).toBe(0);
  });

  it("elapsedMs uses endTimeMs when set", () => {
    const fake: MiniTenziState = {
      ...initialState(1, S),
      startTimeMs: 1000,
      endTimeMs: 4000,
    };
    expect(elapsedMs(fake, 9999)).toBe(3000);
  });
});
