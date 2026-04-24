import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, GRID_SIZE } from "./state.js";

describe("Grid Rogue", () => {
  it("initializes at (0,0) floor 1 with 30 HP", () => {
    const s = initialState(1);
    expect(s.playerX).toBe(0);
    expect(s.playerY).toBe(0);
    expect(s.floor).toBe(1);
    expect(s.playerHp).toBe(30);
    expect(s.phase).toBe("playing");
  });

  it("grid has GRID_SIZE x GRID_SIZE cells", () => {
    const s = initialState(1);
    expect(s.grid.length).toBe(GRID_SIZE);
    expect(s.grid[0]!.length).toBe(GRID_SIZE);
  });

  it("cannot move into a wall", () => {
    const s = initialState(42);
    // Force a wall above and to the left (out of bounds test)
    const s2 = reducer(s, { type: "move", dir: "up" });
    // Can't go up from y=0
    expect(s2.playerY).toBe(0);
  });

  it("moving into a floor tile moves player", () => {
    const s = initialState(99);
    // Clear cells around player to ensure movement
    const newGrid = s.grid.map((row, y) => row.map((cell, x) => {
      if ((x === 1 && y === 0) || (x === 0 && y === 1)) return { type: "floor" as const };
      return cell;
    }));
    const modState = { ...s, grid: newGrid };
    const s2 = reducer(modState, { type: "move", dir: "right" });
    expect(s2.playerX).toBe(1);
    expect(s2.playerY).toBe(0);
  });

  it("picking up gold increases gold count", () => {
    const s = initialState(1);
    const newGrid = s.grid.map((row, y) => row.map((cell, x) => {
      if (x === 1 && y === 0) return { type: "gold" as const, value: 20 };
      return cell;
    }));
    const modState = { ...s, grid: newGrid };
    const s2 = reducer(modState, { type: "move", dir: "right" });
    expect(s2.gold).toBe(20);
  });

  it("drinking a potion heals player", () => {
    const s = { ...initialState(1), playerHp: 10, playerMaxHp: 30 };
    const newGrid = s.grid.map((row, y) => row.map((cell, x) => {
      if (x === 1 && y === 0) return { type: "potion" as const, value: 15 };
      return cell;
    }));
    const modState = { ...s, grid: newGrid };
    const s2 = reducer(modState, { type: "move", dir: "right" });
    expect(s2.playerHp).toBe(25);
  });

  it("isTerminal returns null during play", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = { ...initialState(1), phase: "won" as const, gold: 50 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(100);
  });

  it("isTerminal returns score when dead", () => {
    const s = { ...initialState(1), phase: "dead" as const, floor: 3, gold: 10 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });
});
