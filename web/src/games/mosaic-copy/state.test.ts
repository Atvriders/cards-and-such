import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MosaicCopyState } from "./state.js";

const noSettings = {} as Record<string, never>;

describe("MosaicCopy initialState", () => {
  it("starts idle", () => {
    const s = initialState(42, noSettings);
    expect(s.phase).toBe("idle");
    expect(s.pattern.length).toBe(0);
    expect(s.round).toBe(0);
    expect(s.gridSize).toBe(4);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, noSettings);
    const s2 = initialState(99, noSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("MosaicCopy start", () => {
  it("enters memorize with a pattern", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("memorize");
    expect(s2.pattern.length).toBeGreaterThan(0);
    expect(s2.round).toBe(1);
  });

  it("pattern grows each round", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer({ ...s2, phase: "complete" }, { type: "start" });
    expect(s3.pattern.length).toBeGreaterThan(s2.pattern.length);
  });

  it("same seed same pattern", () => {
    const s1 = initialState(7, noSettings);
    const s2 = initialState(7, noSettings);
    const r1 = reducer(s1, { type: "start" });
    const r2 = reducer(s2, { type: "start" });
    expect(r1.pattern).toEqual(r2.pattern);
  });
});

describe("MosaicCopy hide", () => {
  it("hide transitions from memorize to input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    const s3 = reducer(s2, { type: "hide" });
    expect(s3.phase).toBe("input");
  });

  it("hide is no-op outside memorize", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "hide" });
    expect(s2.phase).toBe("idle");
  });
});

describe("MosaicCopy toggle-cell and submit", () => {
  const getInput = (): MosaicCopyState => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "start" });
    return { ...s2, phase: "input", playerFilled: [] };
  };

  it("toggle-cell adds and removes cells", () => {
    const s = getInput();
    const s2 = reducer(s, { type: "toggle-cell", cell: 3 });
    expect(s2.playerFilled).toContain(3);
    const s3 = reducer(s2, { type: "toggle-cell", cell: 3 });
    expect(s3.playerFilled).not.toContain(3);
  });

  it("correct submission completes round", () => {
    const s = getInput();
    let cur: MosaicCopyState = s;
    for (const cell of s.pattern) {
      cur = reducer(cur, { type: "toggle-cell", cell });
    }
    const submitted = reducer(cur, { type: "submit" });
    expect(submitted.phase).toBe("complete");
  });

  it("wrong submission fails", () => {
    const s = getInput();
    const wrongCell = s.pattern.includes(0) ? 1 : 0;
    let cur = reducer(s, { type: "toggle-cell", cell: wrongCell });
    cur = reducer(cur, { type: "submit" });
    expect(cur.phase).toBe("failed");
  });

  it("toggle-cell ignored when not in input", () => {
    const s = initialState(42, noSettings);
    const s2 = reducer(s, { type: "toggle-cell", cell: 0 });
    expect(s2.playerFilled.length).toBe(0);
  });
});

describe("MosaicCopy isTerminal", () => {
  it("null when not failed", () => {
    expect(isTerminal(initialState(42, noSettings))).toBeNull();
  });

  it("score is round - 1 on failure", () => {
    const s: MosaicCopyState = { ...initialState(42, noSettings), phase: "failed", round: 3 };
    expect(isTerminal(s)!.score).toBe(2);
  });
});
