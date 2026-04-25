import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TimeTrialSettings } from "./state.js";

const s5: TimeTrialSettings = { gates: "5" };
const s8: TimeTrialSettings = { gates: "8" };

describe("TimeTrial initialState", () => {
  it("creates 5 gates", () => {
    expect(initialState(1, s5).gates).toHaveLength(5);
  });

  it("creates 8 gates", () => {
    expect(initialState(1, s8).gates).toHaveLength(8);
  });

  it("starts at gate 0", () => {
    expect(initialState(1, s5).currentGate).toBe(0);
  });

  it("starts at center position", () => {
    expect(initialState(1, s5).carPosition).toBe(5);
  });

  it("not game over initially", () => {
    expect(initialState(1, s5).gameOver).toBe(false);
  });
});

describe("TimeTrial reducer", () => {
  it("moveLeft decreases position", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "moveLeft" });
    expect(s2.carPosition).toBe(4);
  });

  it("moveRight increases position", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "moveRight" });
    expect(s2.carPosition).toBe(6);
  });

  it("carPosition does not go below 0", () => {
    let s = initialState(1, s5);
    for (let i = 0; i < 20; i++) s = reducer(s, { type: "moveLeft" });
    expect(s.carPosition).toBe(0);
  });

  it("carPosition does not go above 9", () => {
    let s = initialState(1, s5);
    for (let i = 0; i < 20; i++) s = reducer(s, { type: "moveRight" });
    expect(s.carPosition).toBe(9);
  });

  it("pass advances currentGate", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "pass" });
    expect(s2.currentGate).toBe(1);
  });

  it("game over after all gates", () => {
    let s = initialState(1, s5);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "pass" });
    expect(s.gameOver).toBe(true);
  });

  it("perfect pass scores 100", () => {
    const s = initialState(1, s5);
    const gatePos = s.gates[0]!.position;
    let s2 = s;
    while (s2.carPosition < gatePos) s2 = reducer(s2, { type: "moveRight" });
    while (s2.carPosition > gatePos) s2 = reducer(s2, { type: "moveLeft" });
    const s3 = reducer(s2, { type: "pass" });
    expect(s3.score).toBe(100);
  });

  it("restart resets game", () => {
    let s = initialState(1, s5);
    for (let i = 0; i < 3; i++) s = reducer(s, { type: "pass" });
    s = reducer(s, { type: "restart" });
    expect(s.currentGate).toBe(0);
    expect(s.score).toBe(0);
  });

  it("isTerminal returns null when not over", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("isTerminal deducts penalties", () => {
    const s = { ...initialState(1, s5), gameOver: true, score: 300, penalties: 2 };
    expect(isTerminal(s)!.score).toBe(200);
  });
});
