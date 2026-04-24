import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("CoinCollector", () => {
  it("starts with player at top-left and valid turn count", () => {
    const s = initialState(42, { gridSize: "5", turnLimit: "20" });
    expect(s.playerRow).toBe(0);
    expect(s.playerCol).toBe(0);
    expect(s.turnsLeft).toBe(20);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("moving reduces turns left by 1", () => {
    const s0 = initialState(1, { gridSize: "7", turnLimit: "30" });
    const s1 = reducer(s0, { type: "move", dir: "right" });
    expect(s1.turnsLeft).toBe(29);
  });

  it("moving onto a coin collects it and adds to score", () => {
    // Place a known grid: build state and find a coin adjacent to player
    const s0 = initialState(99, { gridSize: "5", turnLimit: "20" });
    // Find a coin adjacent to (0,0)
    let foundDir: "up" | "down" | "left" | "right" | null = null;
    const size = s0.gridSize;
    if (s0.grid[1] !== null) foundDir = "right"; // (0,1)
    else if (s0.grid[size] !== null) foundDir = "down"; // (1,0)
    if (foundDir) {
      const s1 = reducer(s0, { type: "move", dir: foundDir });
      expect(s1.score).toBeGreaterThan(0);
      expect(s1.coinsCollected).toBe(1);
    } else {
      // If no adjacent coin, just verify move was valid
      const s1 = reducer(s0, { type: "move", dir: "right" });
      expect(s1.playerCol).toBe(1);
    }
  });

  it("game ends when turns reach zero", () => {
    let s = initialState(5, { gridSize: "5", turnLimit: "20" });
    // Move back and forth to burn turns
    for (let i = 0; i < 20; i++) {
      s = reducer(s, { type: "move", dir: i % 2 === 0 ? "right" : "left" });
    }
    expect(s.gameOver).toBe(true);
  });

  it("isTerminal returns null while playing, score when done", () => {
    const s0 = initialState(0, { gridSize: "5", turnLimit: "20" });
    expect(isTerminal(s0)).toBeNull();
    let s = s0;
    for (let i = 0; i < 20; i++) s = reducer(s, { type: "move", dir: "right" });
    expect(isTerminal(s)).not.toBeNull();
    expect(isTerminal(s)!.score).toBeGreaterThanOrEqual(s.score);
  });

  it("restart creates a fresh game", () => {
    let s = initialState(3, { gridSize: "7", turnLimit: "30" });
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "move", dir: "down" });
    const reset = reducer(s, { type: "restart" });
    expect(reset.turnsLeft).toBe(30);
    expect(reset.score).toBe(0);
    expect(reset.playerRow).toBe(0);
    expect(reset.playerCol).toBe(0);
    expect(reset.gameOver).toBe(false);
  });

  it("moving into wall does not change position or decrement turns", () => {
    const s0 = initialState(0, { gridSize: "5", turnLimit: "20" });
    // Player at (0,0), move up hits top wall
    const s1 = reducer(s0, { type: "move", dir: "up" });
    expect(s1.playerRow).toBe(0);
    expect(s1.playerCol).toBe(0);
    // Turns should NOT decrement on a wall hit
    expect(s1.turnsLeft).toBe(20);
  });
});
