import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { target: "50" as const };

describe("initialState", () => {
  it("starts with 0 fill, not holding, 0 rounds", () => {
    const s = initialState(42, defaultSettings);
    expect(s.fillPercent).toBe(0);
    expect(s.holding).toBe(false);
    expect(s.rounds).toBe(0);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
    expect(s.targetPercent).toBe(50);
    expect(s.totalRounds).toBe(5);
  });

  it("sets zone bounds around target", () => {
    const s = initialState(42, defaultSettings);
    expect(s.targetLow).toBeLessThan(s.targetPercent);
    expect(s.targetHigh).toBeGreaterThan(s.targetPercent);
  });
});

describe("reducer — pressDown", () => {
  it("sets holding to true", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "pressDown" });
    expect(s2.holding).toBe(true);
    expect(s2.fillPercent).toBe(0);
  });
});

describe("reducer — tick", () => {
  it("updates fill percent when holding", () => {
    const s = initialState(42, defaultSettings);
    const holding = reducer(s, { type: "pressDown" });
    const s2 = reducer(holding, { type: "tick", fillPercent: 40 });
    expect(s2.fillPercent).toBe(40);
  });

  it("clamps fill to 100", () => {
    const s = initialState(42, defaultSettings);
    const holding = reducer(s, { type: "pressDown" });
    const s2 = reducer(holding, { type: "tick", fillPercent: 150 });
    expect(s2.fillPercent).toBe(100);
  });

  it("does not update when not holding", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "tick", fillPercent: 40 });
    expect(s2.fillPercent).toBe(0);
  });
});

describe("reducer — release", () => {
  it("records release and scores hit when in zone", () => {
    const s = initialState(42, defaultSettings);
    const s1 = reducer(s, { type: "pressDown" });
    // s.targetLow..targetHigh around 50
    const s2 = reducer(s1, { type: "release", fillPercent: 50 });
    expect(s2.roundResult).toBe("hit");
    expect(s2.score).toBeGreaterThan(0);
    expect(s2.holding).toBe(false);
  });

  it("records miss when outside zone", () => {
    const s = initialState(42, defaultSettings);
    const s1 = reducer(s, { type: "pressDown" });
    const s2 = reducer(s1, { type: "release", fillPercent: 10 });
    expect(s2.roundResult).toBe("miss");
    expect(s2.score).toBe(0);
  });
});

describe("reducer — next", () => {
  it("advances round after result", () => {
    const s = initialState(42, defaultSettings);
    let state = reducer(s, { type: "pressDown" });
    state = reducer(state, { type: "release", fillPercent: 50 });
    expect(state.roundResult).toBe("hit");
    state = reducer(state, { type: "next" });
    expect(state.rounds).toBe(1);
    expect(state.roundResult).toBeNull();
  });

  it("game ends after totalRounds", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "pressDown" });
      s = reducer(s, { type: "release", fillPercent: 50 });
      s = reducer(s, { type: "next" });
    }
    expect(s.gameOver).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when game over", () => {
    const s = initialState(42, defaultSettings);
    const over = { ...s, gameOver: true, score: 500 };
    expect(isTerminal(over)!.score).toBe(500);
  });
});
