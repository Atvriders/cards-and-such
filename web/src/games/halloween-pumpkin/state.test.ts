import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { size: "4" as const };

describe("initialState", () => {
  it("creates target and carved of correct length", () => {
    const s = initialState(1, settings);
    expect(s.target.length).toBe(16);
    expect(s.carved.length).toBe(16);
    expect(s.carved.every(c => !c)).toBe(true);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
  });

  it("size matches settings", () => {
    const s = initialState(1, { size: "6" as const });
    expect(s.size).toBe(6);
    expect(s.target.length).toBe(36);
  });
});

describe("reducer carve", () => {
  it("toggles cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "carve", index: 3 });
    expect(s2.carved[3]).toBe(true);
    expect(s2.moves).toBe(1);
    const s3 = reducer(s2, { type: "carve", index: 3 });
    expect(s3.carved[3]).toBe(false);
  });

  it("no-op when over", () => {
    const s = { ...initialState(1, settings), over: true };
    const s2 = reducer(s, { type: "carve", index: 0 });
    expect(s2).toBe(s);
  });
});

describe("reducer submit", () => {
  it("ends game and gives score", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.over).toBe(true);
    expect(s2.score).toBeGreaterThan(0);
  });

  it("perfect match gives maximum score", () => {
    const s = initialState(1, settings);
    // Set carved to exactly match target
    const sMatched = { ...s, carved: [...s.target] };
    const s2 = reducer(sMatched, { type: "submit" });
    expect(s2.score).toBe(1000);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 750 };
    expect(isTerminal(s)!.score).toBe(750);
  });
});
