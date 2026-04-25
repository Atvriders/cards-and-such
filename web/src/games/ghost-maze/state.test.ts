import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const slow = { ghostSpeed: "slow" as const };
const fast = { ghostSpeed: "fast" as const };

describe("GhostMaze initialState", () => {
  it("creates 11x11 grid", () => {
    const s = initialState(0, slow);
    expect(s.rows).toBe(11);
    expect(s.cols).toBe(11);
  });

  it("player starts at (0,0)", () => {
    const s = initialState(0, slow);
    expect(s.playerRow).toBe(0);
    expect(s.playerCol).toBe(0);
    expect(s.won).toBe(false);
    expect(s.caught).toBe(false);
  });

  it("ghost starts at bottom-right", () => {
    const s = initialState(0, slow);
    expect(s.ghostRow).toBe(s.rows - 1);
    expect(s.ghostCol).toBe(s.cols - 1);
  });

  it("fast ghost has lower tick value", () => {
    const sf = initialState(0, fast);
    const ss = initialState(0, slow);
    expect(sf.ghostSpeed).toBeLessThan(ss.ghostSpeed);
  });
});

describe("GhostMaze reducer move", () => {
  it("blocks movement into outer wall upward", () => {
    const s = initialState(0, slow);
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerRow).toBe(0);
  });

  it("increments moves on valid move", () => {
    const s = initialState(0, slow);
    const dirs = ["down", "right"] as const;
    let moved = false;
    for (const dir of dirs) {
      const s2 = reducer(s, { type: "move", dir });
      if (s2.moves === 1) { moved = true; break; }
    }
    expect(moved).toBe(true);
  });

  it("stops processing when caught", () => {
    const s = initialState(0, slow);
    const caught = { ...s, caught: true };
    const s2 = reducer(caught, { type: "move", dir: "right" });
    expect(s2.moves).toBe(0);
  });
});

describe("GhostMaze reducer tick", () => {
  it("decrements ghost ticks", () => {
    const s = initialState(0, slow);
    const initial = s.ghostTicksUntilMove;
    const s2 = reducer(s, { type: "tick" });
    expect(s2.ghostTicksUntilMove).toBeLessThan(initial);
  });
});

describe("GhostMaze isTerminal", () => {
  it("returns null when game is ongoing", () => {
    expect(isTerminal(initialState(0, slow))).toBeNull();
  });

  it("returns score on win", () => {
    const s = initialState(0, slow);
    const t = isTerminal({ ...s, won: true, moves: 30 });
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("returns partial score on caught", () => {
    const s = initialState(0, slow);
    const t = isTerminal({ ...s, caught: true, moves: 10 });
    expect(t).not.toBeNull();
  });
});
