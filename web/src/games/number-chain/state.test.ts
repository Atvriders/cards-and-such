import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { NumberChainState } from "./state.js";

describe("NumberChain initialState", () => {
  it("creates correct grid size 4x4", () => {
    const s = initialState(1, { size: 4 });
    expect(s.grid.length).toBe(16);
    expect(s.size).toBe(4);
  });

  it("has numbered endpoints starting at 1", () => {
    const s = initialState(1, { size: 4 });
    const labels = s.grid.filter((v) => v > 0).sort((a, b) => a - b);
    expect(labels[0]).toBe(1);
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it("starts with empty path", () => {
    const s = initialState(1, { size: 4 });
    expect(s.path.length).toBe(0);
    expect(s.won).toBe(false);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, { size: 4 });
    const s2 = initialState(42, { size: 4 });
    expect(Array.from(s1.grid)).toEqual(Array.from(s2.grid));
  });
});

describe("NumberChain reducer", () => {
  it("start requires clicking endpoint 1", () => {
    const s = initialState(1, { size: 4 });
    // Find a non-endpoint cell or non-1 endpoint
    const nonStart = s.grid.findIndex((v) => v !== 1);
    const s2 = reducer(s, { type: "extend", index: nonStart });
    expect(s2.path.length).toBe(0); // rejected
  });

  it("clicking endpoint 1 starts path", () => {
    const s = initialState(1, { size: 4 });
    const startIdx = s.grid.indexOf(1);
    const s2 = reducer(s, { type: "extend", index: startIdx });
    expect(s2.path[0]).toBe(startIdx);
  });

  it("cannot jump to non-adjacent cell", () => {
    const s = initialState(1, { size: 4 });
    const startIdx = s.grid.indexOf(1);
    const s2 = reducer(s, { type: "extend", index: startIdx });
    // Try to jump to far cell
    const farCell = (startIdx + 8) % 16;
    if (farCell !== startIdx) {
      const s3 = reducer(s2, { type: "extend", index: farCell });
      expect(s3.path.length).toBe(1); // no change
    }
  });

  it("reset clears path", () => {
    const s = initialState(1, { size: 4 });
    const startIdx = s.grid.indexOf(1);
    const s2 = reducer(s, { type: "extend", index: startIdx });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.path.length).toBe(0);
  });

  it("illegal action is no-op when already won", () => {
    const s = initialState(1, { size: 4 });
    const won: NumberChainState = { ...s, won: true };
    const s2 = reducer(won, { type: "extend", index: 0 });
    expect(s2.won).toBe(true);
  });
});

describe("NumberChain isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, { size: 4 }))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, { size: 4 });
    const won: NumberChainState = { ...s, won: true, movesMade: 10 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });
});
