import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Swimming Laps", () => {
  it("initializes correctly", () => {
    const s = initialState(9);
    expect(s.lap).toBe(1);
    expect(s.stamina).toBe(100);
    expect(s.phase).toBe("playing");
    expect(s.lane).toBe(1);
    expect(s.hits).toBe(0);
  });

  it("stroke action with alternating keys increases combo", () => {
    const s = initialState(9);
    const s2 = reducer(s, { type: "stroke", key: "L" });
    const s3 = reducer(s2, { type: "stroke", key: "R" });
    expect(s3.strokeCombo).toBe(2);
  });

  it("same key twice resets combo", () => {
    const s = initialState(9);
    const s2 = reducer(s, { type: "stroke", key: "L" });
    const s3 = reducer(s2, { type: "stroke", key: "L" });
    expect(s3.strokeCombo).toBe(0);
  });

  it("changeLane adjusts lane within 0-2", () => {
    const s = initialState(9);
    const s2 = reducer(s, { type: "changeLane", dir: -1 });
    expect(s2.lane).toBe(0);
    const s3 = reducer(s2, { type: "changeLane", dir: -1 });
    expect(s3.lane).toBe(0); // clamped
  });

  it("tick increments tick counter", () => {
    const s = initialState(9);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.tick).toBe(1);
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(9))).toBeNull();
  });

  it("game ends when maxTicks reached", () => {
    const s = { ...initialState(9), tick: 499 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.phase).toBe("done");
  });
});
