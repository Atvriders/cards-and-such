import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("WallBounce initialState", () => {
  it("starts with 5 targets up and 5 shots", () => {
    const s = initialState(42);
    expect(s.targets).toEqual([true, true, true, true, true]);
    expect(s.shotsRemaining).toBe(5);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

describe("WallBounce shoot", () => {
  it("records last angle and reduces shots", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "shoot", angle: 1 });
    expect(s2.lastAngle).toBe(1);
    expect(s2.shotsRemaining).toBe(4);
  });

  it("knocks down correct targets for angle 1 (indices 0 and 2)", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "shoot", angle: 1 });
    expect(s2.targets[0]).toBe(false);
    expect(s2.targets[2]).toBe(false);
    expect(s2.targets[1]).toBe(true);
    expect(s2.score).toBe(200);
  });

  it("ends game when shots run out", () => {
    let s = initialState(1);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "shoot", angle: 2 });
    }
    expect(s.gameOver).toBe(true);
  });

  it("ends game early when all targets down", () => {
    // Shoot angles that together cover all 5 targets: 1(0,2) + 2(1,3) + 5(1,4)
    let s = initialState(1);
    s = reducer(s, { type: "shoot", angle: 1 }); // hits 0,2
    s = reducer(s, { type: "shoot", angle: 2 }); // hits 1,3
    s = reducer(s, { type: "shoot", angle: 5 }); // hits 1(already down),4
    expect(s.gameOver).toBe(true);
    expect(s.score).toBe(500);
  });
});

describe("WallBounce isTerminal", () => {
  it("returns null during game", () => {
    expect(isTerminal(initialState(10))).toBeNull();
  });

  it("returns score when game over", () => {
    let s = initialState(1);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "shoot", angle: 2 });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});
