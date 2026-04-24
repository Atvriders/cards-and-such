import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("BattleshipSolo initialState", () => {
  it("creates 8x8 grid with 64 cells", () => {
    const s = initialState(1, { gridSize: 8 });
    expect(s.cells.length).toBe(64);
    expect(s.grid).toBe(8);
  });

  it("all cells start as unknown", () => {
    const s = initialState(1, { gridSize: 8 });
    expect(s.cells.every((c) => c === "unknown")).toBe(true);
  });

  it("places 4 ships on 8x8", () => {
    const s = initialState(1, { gridSize: 8 });
    expect(s.ships.length).toBe(4);
  });

  it("places 6 ships on 10x10", () => {
    const s = initialState(1, { gridSize: 10 });
    expect(s.ships.length).toBe(6);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, { gridSize: 8 });
    const s2 = initialState(42, { gridSize: 8 });
    expect(s1.ships[0]!.cells).toEqual(s2.ships[0]!.cells);
  });
});

describe("BattleshipSolo reducer", () => {
  it("shooting empty cell marks it miss", () => {
    const s = initialState(1, { gridSize: 8 });
    // Find a cell not occupied by any ship
    const allShipCells = s.ships.flatMap((sh) => sh.cells);
    const emptyCell = Array.from({ length: 64 }, (_, i) => i).find((i) => !allShipCells.includes(i))!;
    const s2 = reducer(s, { type: "shoot", index: emptyCell });
    expect(s2.cells[emptyCell]).toBe("miss");
    expect(s2.shotsLeft).toBe(s.shotsLeft - 1);
  });

  it("shooting a ship cell marks it hit", () => {
    const s = initialState(1, { gridSize: 8 });
    const shipCell = s.ships[0]!.cells[0]!;
    const s2 = reducer(s, { type: "shoot", index: shipCell });
    expect(s2.cells[shipCell]).toBe("hit");
  });

  it("shooting same cell twice is no-op second time", () => {
    const s = initialState(1, { gridSize: 8 });
    const allShipCells = s.ships.flatMap((sh) => sh.cells);
    const emptyCell = Array.from({ length: 64 }, (_, i) => i).find((i) => !allShipCells.includes(i))!;
    const s2 = reducer(s, { type: "shoot", index: emptyCell });
    const s3 = reducer(s2, { type: "shoot", index: emptyCell });
    expect(s3.shotsLeft).toBe(s2.shotsLeft); // no extra shot used
  });

  it("sinking all ships wins the game", () => {
    let s = initialState(99, { gridSize: 8 });
    for (const ship of s.ships) {
      for (const cell of ship.cells) {
        s = reducer(s, { type: "shoot", index: cell });
      }
    }
    expect(s.won).toBe(true);
  });
});

describe("BattleshipSolo isTerminal", () => {
  it("returns null while game in progress", () => {
    expect(isTerminal(initialState(1, { gridSize: 8 }))).toBeNull();
  });

  it("returns score when won", () => {
    let s = initialState(99, { gridSize: 8 });
    for (const ship of s.ships) {
      for (const cell of ship.cells) {
        s = reducer(s, { type: "shoot", index: cell });
      }
    }
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });

  it("returns score 0 when lost", () => {
    const s = initialState(1, { gridSize: 8 });
    const lost = { ...s, lost: true, won: false };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});
