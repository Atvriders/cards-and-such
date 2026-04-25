import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, FRICTION } from "./state.js";

const settings = { rounds: "10" as const };

describe("initialState", () => {
  it("starts with score 0, round 1, not spinning", () => {
    const s = initialState(1, settings);
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
    expect(s.spinning).toBe(false);
    expect(s.over).toBe(false);
  });

  it("has a valid target zone", () => {
    const s = initialState(1, settings);
    expect(s.targetStart).toBeGreaterThanOrEqual(0);
    expect(s.targetStart).toBeLessThan(360);
  });
});

describe("spin action", () => {
  it("sets spinning=true and gives velocity", () => {
    const s = initialState(1, settings);
    const after = reducer(s, { type: "spin" });
    expect(after.spinning).toBe(true);
    expect(after.angularVelocity).toBeGreaterThan(0);
  });

  it("ignores spin if already spinning", () => {
    const s = initialState(1, settings);
    const spinning = reducer(s, { type: "spin" });
    const again = reducer(spinning, { type: "spin" });
    expect(again).toBe(spinning);
  });
});

describe("stop action", () => {
  it("stops spinning and records result", () => {
    const s = initialState(1, settings);
    const spinning = reducer(s, { type: "spin" });
    const stopped = reducer(spinning, { type: "stop" });
    expect(stopped.spinning).toBe(false);
    expect(stopped.lastResult).not.toBeNull();
  });
});

describe("tick", () => {
  it("reduces angularVelocity due to friction", () => {
    const s = initialState(1, settings);
    const spinning = reducer(s, { type: "spin" });
    const after = reducer(spinning, { type: "tick", dt: 0.1 });
    expect(after.angularVelocity).toBeLessThan(spinning.angularVelocity);
    expect(FRICTION).toBeLessThan(1);
  });

  it("advances angle while spinning", () => {
    const s = initialState(1, settings);
    const spinning = reducer(s, { type: "spin" });
    const after = reducer(spinning, { type: "tick", dt: 0.01 });
    expect(after.angle).toBeGreaterThan(spinning.angle);
  });
});

describe("next", () => {
  it("advances round after stop", () => {
    const s = initialState(1, settings);
    const spinning = reducer(s, { type: "spin" });
    const stopped = reducer(spinning, { type: "stop" });
    const next = reducer(stopped, { type: "next" });
    expect(next.round).toBe(2);
    expect(next.lastResult).toBeNull();
  });

  it("ends game after maxRounds", () => {
    const s = initialState(1, settings);
    const atEnd = { ...s, round: s.maxRounds, lastResult: "hit" as const };
    const after = reducer(atEnd, { type: "next" });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 700 };
    expect(isTerminal(s)!.score).toBe(700);
  });
});
