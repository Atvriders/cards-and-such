import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getPhase } from "./state.js";

describe("DiceLadder", () => {
  it("starts at rung 0 with no roll", () => {
    const s = initialState(0, { rungs: "15", dice: "1" });
    expect(s.currentRung).toBe(0);
    expect(s.lastRoll).toHaveLength(0);
    expect(s.turnsTaken).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("rolling produces a value between 1 and 6", () => {
    const s0 = initialState(42, { rungs: "10", dice: "1" });
    const s1 = reducer(s0, { type: "roll" });
    expect(s1.lastRoll).toHaveLength(1);
    expect(s1.lastRoll[0]).toBeGreaterThanOrEqual(1);
    expect(s1.lastRoll[0]).toBeLessThanOrEqual(6);
  });

  it("climbUp advances rung by roll sum and uses a turn", () => {
    const s0 = initialState(1, { rungs: "20", dice: "1" });
    const s1 = reducer(s0, { type: "roll" });
    const rollSum = s1.lastRoll.reduce((a, b) => a + b, 0);
    const s2 = reducer(s1, { type: "climbUp" });
    expect(s2.currentRung).toBe(rollSum);
    expect(s2.turnsTaken).toBe(1);
    expect(s2.lastRoll).toHaveLength(0);
  });

  it("reaching or passing top rung wins the game", () => {
    let s = initialState(99, { rungs: "10", dice: "2" });
    // Force manual rung to 9 and roll to guarantee reaching top
    s = { ...s, currentRung: 9 };
    s = reducer(s, { type: "roll" });
    // Any roll of >=1 will win from rung 9 with a 10-rung ladder
    s = reducer(s, { type: "climbUp" });
    expect(s.gameOver).toBe(true);
    expect(s.won).toBe(true);
  });

  it("isTerminal returns score based on turns taken", () => {
    let s = initialState(7, { rungs: "10", dice: "2" });
    s = { ...s, currentRung: 9 };
    s = reducer(s, { type: "roll" });
    s = reducer(s, { type: "climbUp" });
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });

  it("cannot climbUp without rolling first", () => {
    const s0 = initialState(0, { rungs: "10", dice: "1" });
    const s1 = reducer(s0, { type: "climbUp" });
    expect(s1.currentRung).toBe(0); // unchanged
  });

  it("two dice produce two values summed on climbUp", () => {
    const s0 = initialState(5, { rungs: "20", dice: "2" });
    const s1 = reducer(s0, { type: "roll" });
    expect(s1.lastRoll).toHaveLength(2);
    const sum = s1.lastRoll.reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThanOrEqual(2);
    expect(sum).toBeLessThanOrEqual(12);
    const s2 = reducer(s1, { type: "climbUp" });
    expect(s2.currentRung).toBe(Math.min(20, sum));
  });

  it("getPhase reflects correct state", () => {
    const s0 = initialState(0, { rungs: "10", dice: "1" });
    const p0 = getPhase(s0);
    expect(p0.rolled).toBe(false);
    const s1 = reducer(s0, { type: "roll" });
    const p1 = getPhase(s1);
    expect(p1.rolled).toBe(true);
    expect(p1.canClimbUp).toBe(true);
  });
});
