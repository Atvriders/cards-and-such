import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { humans: "5" as const };

describe("initialState", () => {
  it("starts with correct humans and not over", () => {
    const s = initialState(1, defaultSettings);
    expect(s.humans.length).toBe(5);
    expect(s.over).toBe(false);
    expect(s.rescued).toBe(0);
    expect(s.score).toBe(0);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("moveLeft/moveRight", () => {
  it("moveLeft reduces ufoX (clamped at 0)", () => {
    const s = { ...initialState(1, defaultSettings), ufoX: 0 };
    const after = reducer(s, { type: "moveLeft" });
    expect(after.ufoX).toBe(0);
  });

  it("moveRight increases ufoX", () => {
    const s = initialState(1, defaultSettings);
    const before = s.ufoX;
    const after = reducer(s, { type: "moveRight" });
    expect(after.ufoX).toBeGreaterThanOrEqual(before);
  });
});

describe("beam", () => {
  it("toggles beamActive", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "beam" });
    expect(after.beamActive).toBe(true);
    const after2 = reducer(after, { type: "beam" });
    expect(after2.beamActive).toBe(false);
  });
});

describe("tick", () => {
  it("advances ticks", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "tick" });
    expect(after.ticks).toBe(1);
  });
});

describe("isTerminal", () => {
  it("returns null when not over", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, defaultSettings), over: true, score: 500 };
    expect(isTerminal(s)?.score).toBe(500);
  });
});
