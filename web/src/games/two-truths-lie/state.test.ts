import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { rounds: "5" as const };

describe("TwoTruthsLie initialState", () => {
  it("creates correct number of sets", () => {
    const s = initialState(1, defaultSettings);
    expect(s.sets.length).toBe(5);
  });

  it("each set has 3 statements", () => {
    const s = initialState(1, defaultSettings);
    for (const set of s.sets) {
      expect(set.statements.length).toBe(3);
    }
  });

  it("lieIndex is 0, 1, or 2", () => {
    const s = initialState(1, defaultSettings);
    for (const set of s.sets) {
      expect([0, 1, 2]).toContain(set.lieIndex);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.sets.map(s => s.statements[0])).toEqual(s2.sets.map(s => s.statements[0]));
  });

  it("starts at playing phase with no selection", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
    expect(s.selected).toBeNull();
  });
});

describe("TwoTruthsLie reducer - select and submit", () => {
  it("select stores chosen index", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", index: 1 });
    expect(s2.selected).toBe(1);
  });

  it("submit with correct lie gives 100 points", () => {
    const s = initialState(1, defaultSettings);
    const lie = s.sets[0]!.lieIndex;
    const s2 = reducer(s, { type: "select", index: lie });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.score).toBe(100);
    expect(s3.correctCount).toBe(1);
    expect(s3.phase).toBe("result");
  });

  it("submit with wrong choice gives 0 points", () => {
    const s = initialState(1, defaultSettings);
    const lie = s.sets[0]!.lieIndex;
    const wrong = (lie + 1) % 3;
    const s2 = reducer(s, { type: "select", index: wrong });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.score).toBe(0);
    expect(s3.correctCount).toBe(0);
  });

  it("cannot submit without selection", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.phase).toBe("playing");
  });

  it("cannot select after submitted", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", index: 0 });
    const s3 = reducer(s2, { type: "submit" });
    const s4 = reducer(s3, { type: "select", index: 2 });
    expect(s4.selected).toBe(0);
  });
});

describe("TwoTruthsLie reducer - next and progression", () => {
  it("next advances index and resets state", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "select", index: 0 });
    const s3 = reducer(s2, { type: "submit" });
    const s4 = reducer(s3, { type: "next" });
    expect(s4.currentIndex).toBe(1);
    expect(s4.selected).toBeNull();
    expect(s4.phase).toBe("playing");
  });

  it("next on last round sets phase to done", () => {
    let s = initialState(1, { rounds: "5" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "select", index: 0 });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });

  it("no actions processed in done phase", () => {
    let s = initialState(1, { rounds: "5" });
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "select", index: 0 });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const s2 = reducer(s, { type: "select", index: 1 });
    expect(s2).toBe(s);
  });
});

describe("TwoTruthsLie isTerminal", () => {
  it("returns null before done", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, { rounds: "5" });
    for (let i = 0; i < 5; i++) {
      const lie = s.sets[s.currentIndex]!.lieIndex;
      s = reducer(s, { type: "select", index: lie });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(500);
  });
});
