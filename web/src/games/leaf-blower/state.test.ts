import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("LeafBlower", () => {
  it("starts with empty leaves, full time, zero score", () => {
    const s = initialState(0, { difficulty: "normal" });
    expect(s.leaves).toHaveLength(0);
    expect(s.score).toBe(0);
    expect(s.timeLeft).toBe(60000);
    expect(s.combo).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("tick reduces timeLeft and may spawn leaves", () => {
    const s0 = initialState(42, { difficulty: "easy" });
    // Apply 5 seconds of ticks
    let s = s0;
    for (let i = 0; i < 50; i++) {
      s = reducer(s, { type: "tick", deltaMs: 100 });
    }
    expect(s.timeLeft).toBe(55000);
    // Leaves may have spawned
    expect(s.leaves.length + s.totalCaught).toBeGreaterThanOrEqual(0);
  });

  it("game ends when timeLeft reaches zero", () => {
    let s = initialState(1, { difficulty: "easy" });
    s = reducer(s, { type: "tick", deltaMs: 60000 });
    expect(s.gameOver).toBe(true);
    expect(s.timeLeft).toBe(0);
  });

  it("catching a leaf increases score and combo", () => {
    let s = initialState(7, { difficulty: "easy" });
    // Force a leaf to exist at a catchable position
    s = {
      ...s,
      leaves: [{ id: 0, x: 50, y: 50, speed: 10, size: 2, caught: false, fallen: false, emoji: "🍁" }],
      nextId: 1,
    };
    const s1 = reducer(s, { type: "catch", id: 0 });
    expect(s1.score).toBeGreaterThan(0);
    expect(s1.combo).toBe(1);
    expect(s1.totalCaught).toBe(1);
    expect(s1.leaves[0]?.caught).toBe(true);
  });

  it("missing a leaf (fallen) resets combo", () => {
    let s = initialState(3, { difficulty: "normal" });
    s = {
      ...s,
      combo: 5,
      leaves: [{ id: 0, x: 50, y: 50, speed: 200, size: 1, caught: false, fallen: false, emoji: "🍂" }],
    };
    // Tick enough to push leaf past the ground
    s = reducer(s, { type: "tick", deltaMs: 1000 });
    expect(s.combo).toBe(0);
    expect(s.missed).toBeGreaterThan(0);
  });

  it("isTerminal returns null during play and score after game over", () => {
    const s0 = initialState(0, { difficulty: "easy" });
    expect(isTerminal(s0)).toBeNull();
    const s1 = reducer(s0, { type: "tick", deltaMs: 60001 });
    expect(isTerminal(s1)).not.toBeNull();
    expect(isTerminal(s1)!.score).toBe(s1.score);
  });

  it("restart resets all state", () => {
    let s = initialState(0, { difficulty: "hard" });
    s = reducer(s, { type: "tick", deltaMs: 30000 });
    const reset = reducer(s, { type: "restart" });
    expect(reset.score).toBe(0);
    expect(reset.timeLeft).toBe(60000);
    expect(reset.leaves).toHaveLength(0);
    expect(reset.gameOver).toBe(false);
  });
});
