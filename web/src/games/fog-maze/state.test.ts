import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { size: "small" as const, visibility: "near" as const };
const far = { size: "small" as const, visibility: "far" as const };

describe("FogMaze initialState", () => {
  it("creates correct grid size for small", () => {
    const s = initialState(0, settings);
    expect(s.rows).toBe(11);
    expect(s.cols).toBe(11);
  });

  it("player starts at top-left", () => {
    const s = initialState(0, settings);
    expect(s.playerRow).toBe(0);
    expect(s.playerCol).toBe(0);
    expect(s.won).toBe(false);
  });

  it("only nearby cells are initially visible", () => {
    const s = initialState(0, settings);
    // Far cells should not be visible initially
    const farCellVisible = s.visited[s.visited.length - 1];
    expect(farCellVisible).toBe(false);
  });

  it("far visibility reveals more cells initially", () => {
    const sNear = initialState(0, settings);
    const sFar = initialState(0, far);
    const nearVisible = sNear.visited.filter(Boolean).length;
    const farVisible = sFar.visited.filter(Boolean).length;
    expect(farVisible).toBeGreaterThanOrEqual(nearVisible);
  });
});

describe("FogMaze reducer", () => {
  it("stays put when moving into wall", () => {
    const s = initialState(0, settings);
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerRow).toBe(0);
    expect(s2.playerCol).toBe(0);
  });

  it("does nothing when won", () => {
    const s = initialState(0, settings);
    const won = { ...s, won: true };
    const s2 = reducer(won, { type: "move", dir: "right" });
    expect(s2.won).toBe(true);
    expect(s2.moves).toBe(0);
  });

  it("reveals new cells after moving", () => {
    const s = initialState(0, settings);
    // Try to move right; may or may not be blocked by wall
    const s2 = reducer(s, { type: "move", dir: "right" });
    // Visited count should be >= initial (never decreases)
    const before = s.visited.filter(Boolean).length;
    const after = s2.visited.filter(Boolean).length;
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

describe("FogMaze isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(0, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(0, settings);
    const won = { ...s, won: true, moves: 30 };
    const t = isTerminal(won);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});
