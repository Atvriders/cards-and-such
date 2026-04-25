import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Triathlon Mini", () => {
  it("initializes in swim phase", () => {
    const s = initialState(1);
    expect(s.phase).toBe("swim");
    expect(s.progress).toBe(0);
    expect(s.stamina).toBe(100);
    expect(s.combo).toBe(0);
  });

  it("tap increases speed", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "tap" });
    expect(s2.speed).toBeGreaterThan(s.speed);
  });

  it("tap decreases stamina", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "tap" });
    expect(s2.stamina).toBeLessThan(s.stamina);
  });

  it("tick advances progress", () => {
    const s = { ...initialState(1), speed: 2.0 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.progress).toBeGreaterThan(s.progress);
  });

  it("speed decays on tick without tap", () => {
    const s = { ...initialState(1), speed: 3.0 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.speed).toBeLessThan(s.speed);
  });

  it("completing swim event moves to bike", () => {
    let s = initialState(1);
    s = { ...s, speed: 10 };
    // run ticks until phase changes
    let ticks = 0;
    while (s.phase === "swim" && ticks < 500) {
      s = reducer(s, { type: "tick" });
      ticks++;
    }
    expect(s.phase).toBe("bike");
  });

  it("isTerminal returns null while not done", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = initialState(1);
    const result = isTerminal({ ...s, phase: "done", score: 80 });
    expect(result).not.toBeNull();
    expect(result!.score).toBe(80);
  });
});
