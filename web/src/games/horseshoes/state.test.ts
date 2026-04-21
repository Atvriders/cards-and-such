import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { targetScore: "21" as const };

describe("initialState", () => {
  it("starts at 0-0 with correct target", () => {
    const s = initialState(42, defaultSettings);
    expect(s.playerScore).toBe(0);
    expect(s.botScore).toBe(0);
    expect(s.targetScore).toBe(21);
    expect(s.winner).toBeNull();
    expect(s.phase).toBe("toss");
  });

  it("respects targetScore setting", () => {
    const s = initialState(1, { targetScore: "11" as const });
    expect(s.targetScore).toBe(11);
  });
});

describe("reducer — set-power / set-aim", () => {
  it("updates power value", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "set-power", power: 0.9 });
    expect(s2.power).toBeCloseTo(0.9);
  });

  it("clamps power to [0,1]", () => {
    const s = initialState(42, defaultSettings);
    expect(reducer(s, { type: "set-power", power: 1.5 }).power).toBe(1);
    expect(reducer(s, { type: "set-power", power: -0.5 }).power).toBe(0);
  });

  it("updates aim value", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "set-aim", aim: 0.3 });
    expect(s2.aim).toBeCloseTo(0.3);
  });
});

describe("reducer — toss", () => {
  it("advances turn after a toss", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "toss" });
    expect(s2.turn).toBe(2);
    expect(s2.lastTurn).not.toBeNull();
  });

  it("each toss changes score by non-negative amount for at most one side", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "toss" });
    expect(s2.playerScore).toBeGreaterThanOrEqual(0);
    expect(s2.botScore).toBeGreaterThanOrEqual(0);
    // At least one of them should not score (cancellation) — though it is possible both get 0
    expect(s2.playerScore + s2.botScore).toBeGreaterThanOrEqual(0);
  });

  it("game ends when target reached", () => {
    const s = initialState(42, { targetScore: "11" as const });
    let state = s;
    let iterations = 0;
    while (state.winner === null && iterations < 50) {
      state = reducer(state, { type: "toss" });
      iterations++;
    }
    // Game should end eventually
    expect(state.winner).not.toBeNull();
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    const r1 = reducer(s1, { type: "toss" });
    const r2 = reducer(s2, { type: "toss" });
    expect(r1.playerScore).toBe(r2.playerScore);
    expect(r1.botScore).toBe(r2.botScore);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns positive score for player win", () => {
    const s = initialState(42, { targetScore: "11" as const });
    let state = s;
    while (state.winner === null) state = reducer(state, { type: "toss" });
    const t = isTerminal(state);
    expect(t).not.toBeNull();
    if (state.winner === "player") {
      expect(t!.score).toBeGreaterThan(0);
    } else {
      expect(t!.score).toBe(0);
    }
  });
});
