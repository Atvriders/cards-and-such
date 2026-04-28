import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TRACK, CHECKERS } from "./state.js";
const S = { dummy: false };

describe("nackgammon", () => {
  it("starts in rolling phase with checkers at 0", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.pPositions.length).toBeGreaterThanOrEqual(1);
    expect(s.cPositions.length).toBeGreaterThanOrEqual(1);
    expect(s.pPositions.every(p => p >= 0)).toBe(true);
  });
  it("roll transitions to moving phase", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.phase).toBe("moving");
    expect(s.dice[0]).toBeGreaterThanOrEqual(1);
    expect(s.dice[1]).toBeGreaterThanOrEqual(1);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("track and checker counts are positive", () => {
    expect(TRACK).toBeGreaterThanOrEqual(12);
    expect(CHECKERS).toBeGreaterThanOrEqual(1);
  });
  it("move advances checker", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "roll" });
    const before = s.pPositions[0]!;
    const s2 = reducer(s, { type: "move", checkerIdx: 0, die: 0 });
    expect(s2.pPositions[0]!).toBeGreaterThanOrEqual(before);
  });
});
