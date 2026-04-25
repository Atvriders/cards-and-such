import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { rounds: "5" as const };

describe("initialState", () => {
  it("creates 25-cell grid", () => {
    const s = initialState(42, def);
    expect(s.grid.length).toBe(25);
    expect(s.painted.length).toBe(25);
  });

  it("starts in playing phase with no paints", () => {
    const s = initialState(42, def);
    expect(s.phase).toBe("playing");
    expect(s.painted.every(v => !v)).toBe(true);
    expect(s.score).toBe(0);
  });

  it("has at least 2 target cells", () => {
    const s = initialState(42, def);
    const count = s.grid.filter(c => c === s.targetLetter).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("is deterministic", () => {
    const s1 = initialState(123, def);
    const s2 = initialState(123, def);
    expect(s1.targetLetter).toBe(s2.targetLetter);
    expect(s1.grid.join("")).toBe(s2.grid.join(""));
  });
});

describe("reducer — paint", () => {
  it("toggles cell paint on/off", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "paint", index: 3 });
    expect(s2.painted[3]).toBe(true);
    const s3 = reducer(s2, { type: "paint", index: 3 });
    expect(s3.painted[3]).toBe(false);
  });

  it("painting one cell does not affect others", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "paint", index: 10 });
    expect(s2.painted.filter(v => v).length).toBe(1);
  });
});

describe("reducer — submit", () => {
  it("moves to result phase", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "submit" });
    expect(s2.phase).toBe("result");
  });

  it("perfect round gives positive score with bonus", () => {
    const s = initialState(42, def);
    // Paint all target cells and no others
    let painted = Array(25).fill(false) as boolean[];
    s.grid.forEach((c, i) => { if (c === s.targetLetter) painted[i] = true; });
    const s2 = reducer({ ...s, painted }, { type: "submit" });
    expect(s2.score).toBeGreaterThan(0);
    expect(s2.roundScore).toBeGreaterThanOrEqual(20); // at least the bonus
  });

  it("no-op when not playing", () => {
    const s = initialState(42, def);
    const result = reducer(s, { type: "submit" });
    // submit again should be no-op
    const s2 = reducer(result, { type: "submit" });
    expect(s2).toBe(result);
  });
});

describe("reducer — next-round", () => {
  it("advances round and resets grid", () => {
    const s = initialState(42, def);
    const submitted = reducer(s, { type: "submit" });
    const s2 = reducer(submitted, { type: "next-round" });
    expect(s2.currentRound).toBe(2);
    expect(s2.phase).toBe("playing");
    expect(s2.painted.every(v => !v)).toBe(true);
  });

  it("ends game after final round", () => {
    let s = initialState(42, def);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next-round" });
    }
    expect(s.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, def), gameOver: true, score: 150 };
    expect(isTerminal(s)!.score).toBe(150);
  });
});
