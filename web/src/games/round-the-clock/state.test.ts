import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, SEQUENCE, DARTS_PER_TURN } from "./state.js";

describe("Round the Clock Darts", () => {
  it("initialState starts at target index 0", () => {
    const s = initialState(1, { skill: "amateur" });
    expect(s.currentTargetIdx).toBe(0);
    expect(s.won).toBe(false);
    expect(s.turns).toHaveLength(0);
    expect(s.pendingThrows).toHaveLength(0);
  });

  it("throwDarts produces 3 pending throws", () => {
    const s = initialState(1, { skill: "amateur" });
    const s2 = reducer(s, { type: "throwDarts" });
    expect(s2.pendingThrows).toHaveLength(DARTS_PER_TURN);
    expect(s2.totalThrows).toBe(DARTS_PER_TURN);
  });

  it("nextTurn without throwDarts does nothing", () => {
    const s = initialState(1, { skill: "amateur" });
    const s2 = reducer(s, { type: "nextTurn" });
    expect(s2.turns).toHaveLength(0);
  });

  it("throwDarts then nextTurn records turn history", () => {
    const s = initialState(1, { skill: "pro" });
    const s2 = reducer(s, { type: "throwDarts" });
    const s3 = reducer(s2, { type: "nextTurn" });
    expect(s3.turns).toHaveLength(1);
    expect(s3.pendingThrows).toHaveLength(0);
    expect(s3.turns[0]!.target).toBe(SEQUENCE[0]);
  });

  it("sequence has 21 entries ending with 25 (bullseye)", () => {
    expect(SEQUENCE).toHaveLength(21);
    expect(SEQUENCE[20]).toBe(25);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(5, { skill: "beginner" });
    expect(isTerminal(s)).toBe(null);
  });

  it("consecutive throwDarts without nextTurn is ignored", () => {
    const s = initialState(1, { skill: "amateur" });
    const s2 = reducer(s, { type: "throwDarts" });
    const s3 = reducer(s2, { type: "throwDarts" }); // should be ignored
    expect(s3.pendingThrows).toHaveLength(DARTS_PER_TURN); // same throws
    expect(s3.totalThrows).toBe(DARTS_PER_TURN); // not doubled
  });

  it("advancing target only happens when hit", () => {
    // With pro skill and many seeds, eventually a turn will hit
    let s = initialState(42, { skill: "pro" });
    let hitFound = false;
    for (let i = 0; i < 20; i++) {
      s = reducer(s, { type: "throwDarts" });
      const prev = s.currentTargetIdx;
      s = reducer(s, { type: "nextTurn" });
      if (s.currentTargetIdx > prev) {
        hitFound = true;
        break;
      }
    }
    expect(hitFound).toBe(true);
  });
});
