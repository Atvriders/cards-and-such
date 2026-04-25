import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s6 = { tubes: "6" as const };
const s8 = { tubes: "8" as const };
const s10 = { tubes: "10" as const };

describe("TubeColor initialState", () => {
  it("creates 6-tube puzzle with 2 empty tubes", () => {
    const s = initialState(0, s6);
    expect(s.tubes).toHaveLength(6);
    const empty = s.tubes.filter(t => t.length === 0);
    expect(empty).toHaveLength(2);
  });

  it("creates 8-tube puzzle", () => {
    const s = initialState(0, s8);
    expect(s.tubes).toHaveLength(8);
  });

  it("creates 10-tube puzzle", () => {
    const s = initialState(0, s10);
    expect(s.tubes).toHaveLength(10);
  });

  it("starts with no selection", () => {
    const s = initialState(0, s6);
    expect(s.selectedTube).toBeNull();
    expect(s.moves).toBe(0);
    expect(s.won).toBe(false);
  });
});

describe("TubeColor reducer", () => {
  it("select non-empty tube", () => {
    const s = initialState(0, s6);
    const firstNonEmpty = s.tubes.findIndex(t => t.length > 0);
    const s2 = reducer(s, { type: "select", tube: firstNonEmpty });
    expect(s2.selectedTube).toBe(firstNonEmpty);
  });

  it("select empty tube does nothing", () => {
    const s = initialState(0, s6);
    const emptyIdx = s.tubes.findIndex(t => t.length === 0);
    const s2 = reducer(s, { type: "select", tube: emptyIdx });
    expect(s2.selectedTube).toBeNull();
  });

  it("deselect when clicking same tube", () => {
    const s = initialState(0, s6);
    const firstNonEmpty = s.tubes.findIndex(t => t.length > 0);
    const s2 = reducer(s, { type: "select", tube: firstNonEmpty });
    const s3 = reducer(s2, { type: "select", tube: firstNonEmpty });
    expect(s3.selectedTube).toBeNull();
  });

  it("pour action works when colors match", () => {
    // Build a simple scenario: tube 0 = [1,1], tube 1 = [1,2]
    const s = {
      ...initialState(0, s6),
      tubes: [[1, 1], [1, 2], [], [], [], []],
      selectedTube: null,
      moves: 0,
      won: false,
    };
    const s2 = reducer(s, { type: "pour", from: 0, to: 2 });
    // Should pour both 1s from tube 0 into empty tube 2
    expect(s2.tubes[2]).toEqual([1, 1]);
    expect(s2.tubes[0]).toEqual([]);
  });

  it("cannot pour when top colors differ", () => {
    const s = {
      ...initialState(0, s6),
      tubes: [[1, 2], [3, 4], [], [], [], []],
      selectedTube: null,
      moves: 0,
      won: false,
    };
    const s2 = reducer(s, { type: "pour", from: 0, to: 1 });
    expect(s2).toBe(s);
  });

  it("no-op when already won", () => {
    const s = { ...initialState(0, s6), won: true };
    const s2 = reducer(s, { type: "select", tube: 0 });
    expect(s2).toBe(s);
  });
});

describe("TubeColor isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, s6))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(0, s6), won: true, moves: 20 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(50);
  });
});
