import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, POLE_HEIGHT } from "./state.js";

describe("Pole Climbing", () => {
  it("initializes at the bottom with full energy", () => {
    const s = initialState(1);
    expect(s.height).toBe(0);
    expect(s.energy).toBe(100);
    expect(s.phase).toBe("climbing");
    expect(s.falls).toBe(0);
  });

  it("grip increases speed", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "gripLeft" });
    expect(s2.speed).toBeGreaterThan(s.speed);
  });

  it("alternating grips gives combo and higher speed", () => {
    const s = initialState(1);
    const s1 = reducer(s, { type: "gripLeft" });
    const s2 = reducer(s1, { type: "gripRight" });
    expect(s2.gripCombo).toBeGreaterThan(0);
    expect(s2.speed).toBeGreaterThan(s1.speed);
  });

  it("grip costs energy", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "gripLeft" });
    expect(s2.energy).toBeLessThan(s.energy);
  });

  it("tick advances height when speed > 0", () => {
    const s = { ...initialState(1), speed: 2.0 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.height).toBeGreaterThan(0);
    expect(s2.tick).toBe(1);
  });

  it("speed decays on tick (gravity)", () => {
    const s = { ...initialState(1), speed: 3.0 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.speed).toBeLessThan(3.0);
  });

  it("reaching top sets phase to done", () => {
    // Use only ticks at high speed (no grips to avoid speed clamp to 5)
    let s = { ...initialState(1), speed: 5, energy: 100 };
    let ticks = 0;
    while (s.phase === "climbing" && ticks < 500) {
      // Alternate grips to keep speed up
      s = reducer(s, ticks % 2 === 0 ? { type: "gripLeft" } : { type: "gripRight" });
      s = reducer(s, { type: "tick" });
      ticks++;
    }
    expect(s.phase).toBe("done");
    expect(s.height).toBeGreaterThanOrEqual(POLE_HEIGHT - 1);
  });

  it("isTerminal returns null while climbing", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = initialState(1);
    const result = isTerminal({ ...s, phase: "done", score: 90 });
    expect(result!.score).toBe(90);
  });
});
