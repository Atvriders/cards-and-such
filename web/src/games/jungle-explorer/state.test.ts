import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("jungle-explorer", () => {
  it("initializes with player at center camp, full hp, zero treasure", () => {
    const s = initialState(42, { size: "5" });
    expect(s.hp).toBeGreaterThan(0);
    expect(s.treasure).toBe(0);
    expect(s.phase).toBe("playing");
    expect(s.grid[s.playerPos]?.revealed).toBe(true);
  });

  it("is deterministic for the same seed", () => {
    const a = initialState(123, { size: "5" });
    const b = initialState(123, { size: "5" });
    expect(a.grid.map(c => c.type)).toEqual(b.grid.map(c => c.type));
  });

  it("moves the player and increments move counter", () => {
    const s0 = initialState(7, { size: "7" });
    const s1 = reducer(s0, { type: "move", dir: "right" });
    expect(s1.moves).toBe(s0.moves + 1);
  });

  it("isTerminal returns score on gameover, null while playing", () => {
    const s = initialState(1, { size: "5" });
    expect(isTerminal(s)).toBeNull();
    const dead = { ...s, phase: "gameover" as const, score: 42 };
    expect(isTerminal(dead)).toEqual({ score: 42 });
  });
});
