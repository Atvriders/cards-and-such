import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("PaperAirplane initialState", () => {
  it("starts in aiming phase with score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("aiming");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("angle is within valid range", () => {
    const s = initialState();
    expect(s.angle).toBeGreaterThanOrEqual(5);
    expect(s.angle).toBeLessThanOrEqual(70);
  });

  it("target is on the right side of the field", () => {
    const s = initialState();
    expect(s.targetX).toBeGreaterThan(0.4);
    expect(s.targetX).toBeLessThanOrEqual(1);
  });
});

describe("PaperAirplane tick aiming", () => {
  it("angle increases when dir is 1", () => {
    const s = { ...initialState(), angle: 20, angleDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.angle).toBeGreaterThan(20);
  });

  it("angle bounces at max", () => {
    const s = { ...initialState(), angle: 69, angleDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.5 });
    expect(s2.angleDir).toBe(-1);
  });
});

describe("PaperAirplane launch action", () => {
  it("transitions from aiming to flying", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "launch" });
    expect(s2.phase).toBe("flying");
    expect(s2.velX).toBeGreaterThan(0);
  });

  it("higher launch angle gives more upward velocity", () => {
    const sLow = { ...initialState(), angle: 10 };
    const sHigh = { ...initialState(), angle: 60 };
    const lowFlight = reducer(sLow, { type: "launch" });
    const highFlight = reducer(sHigh, { type: "launch" });
    expect(highFlight.velY).toBeLessThan(lowFlight.velY); // more negative = more upward
  });
});

describe("PaperAirplane isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score when gameover", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 55 };
    expect(isTerminal(s)?.score).toBe(55);
  });
});
