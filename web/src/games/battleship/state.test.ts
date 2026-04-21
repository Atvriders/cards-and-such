import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  canPlace,
  SHIPS,
  GRID_SIZE,
  type BattleshipState,
} from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { PlayerCellState } from "./state.js";

describe("Battleship", () => {
  it("initializes in setup phase with empty player grid", () => {
    const s = initialState(0, {});
    expect(s.phase).toBe("setup");
    expect(s.setupShipIndex).toBe(0);
    expect(s.playerShips).toHaveLength(0);
    expect(s.enemyShips).toHaveLength(SHIPS.length);
    expect([...s.playerGrid.coords()].every((c) => s.playerGrid.get(c) === "empty")).toBe(true);
    expect(s.winner).toBeNull();
  });

  it("auto-place fills player grid with all ships and transitions to playing", () => {
    const s = initialState(42, {});
    const next = reducer(s, { type: "autoPlace" });
    expect(next.phase).toBe("playing");
    expect(next.playerShips).toHaveLength(SHIPS.length);
    // Count ship cells
    const shipCells = [...next.playerGrid.coords()].filter((c) => next.playerGrid.get(c) === "ship").length;
    const totalSize = SHIPS.reduce((sum, sh) => sum + sh.size, 0);
    expect(shipCells).toBe(totalSize);
  });

  it("canPlace returns false when out of bounds", () => {
    const grid = Grid.filled<PlayerCellState>(GRID_SIZE, GRID_SIZE, "empty");
    expect(canPlace(grid, 9, 8, 5, true)).toBe(false); // would go off right edge
    expect(canPlace(grid, 8, 0, 5, false)).toBe(false); // would go off bottom edge
  });

  it("canPlace returns true for valid placement", () => {
    const grid = Grid.filled<PlayerCellState>(GRID_SIZE, GRID_SIZE, "empty");
    expect(canPlace(grid, 0, 0, 5, true)).toBe(true);
    expect(canPlace(grid, 0, 0, 5, false)).toBe(true);
  });

  it("firing at enemy grid marks hit or miss", () => {
    const s = initialState(0, {});
    const playing = reducer(s, { type: "autoPlace" });
    // Fire at a cell — could be hit or miss depending on enemy placement
    const next = reducer(playing, { type: "fire", row: 0, col: 0 });
    const cell = next.enemyGrid.get({ row: 0, col: 0 });
    expect(cell === "hit" || cell === "miss").toBe(true);
  });

  it("isTerminal returns null during play and score on game over", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    const won: BattleshipState = { ...s, winner: 0, phase: "over" };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: BattleshipState = { ...s, winner: 1, phase: "over" };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("rotate changes setup orientation", () => {
    const s = initialState(0, {});
    expect(s.setupHorizontal).toBe(true);
    const next = reducer(s, { type: "rotateShip" });
    expect(next.setupHorizontal).toBe(false);
    const next2 = reducer(next, { type: "rotateShip" });
    expect(next2.setupHorizontal).toBe(true);
  });
});
