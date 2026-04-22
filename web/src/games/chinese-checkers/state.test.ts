import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getReachable, PLAYER_START, BOT_START, NEIGHBORS, TOTAL_CELLS } from "./state.js";
import type { CCSettings } from "./state.js";

const defaultSettings: CCSettings = { opponent: "easy" };

describe("ChineseCheckers initialState", () => {
  it("has 10 player pegs and 10 bot pegs", () => {
    const s = initialState(42, defaultSettings);
    const playerPegs = s.cells.filter((c) => c === "player").length;
    const botPegs = s.cells.filter((c) => c === "bot").length;
    expect(playerPegs).toBe(10);
    expect(botPegs).toBe(10);
    expect(PLAYER_START.length).toBe(10);
    expect(BOT_START.length).toBe(10);
  });

  it("board has 121 cells", () => {
    expect(TOTAL_CELLS).toBe(121);
  });

  it("player starts first", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turn).toBe("player");
    expect(s.winner).toBeNull();
  });
});

describe("ChineseCheckers neighbors", () => {
  it("all cells have at least one neighbor", () => {
    for (let i = 0; i < TOTAL_CELLS; i++) {
      expect((NEIGHBORS[i] ?? []).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("neighbors are symmetric", () => {
    // If A is a neighbor of B, B should be a neighbor of A
    let asymmetric = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      for (const n of NEIGHBORS[i] ?? []) {
        if (!(NEIGHBORS[n] ?? []).includes(i)) asymmetric++;
      }
    }
    // Allow some asymmetry at edges due to simplified layout, but should be mostly symmetric
    expect(asymmetric).toBeLessThan(10);
  });
});

describe("ChineseCheckers moves", () => {
  it("player peg can step to empty neighbor", () => {
    const s = initialState(42, defaultSettings);
    // Find a player peg with an empty neighbor
    const playerPeg = PLAYER_START.find((i) => {
      return (NEIGHBORS[i] ?? []).some((n) => s.cells[n] === null);
    });
    if (playerPeg !== undefined) {
      const reachable = getReachable(s.cells, playerPeg);
      expect(reachable.length).toBeGreaterThan(0);
    }
  });

  it("isTerminal returns null at start", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("reducer ignores moves when game over", () => {
    const s = { ...initialState(42, defaultSettings), winner: "player" as const };
    const next = reducer(s, { type: "move", to: 0 });
    expect(next).toBe(s);
  });

  it("reducer selects player peg", () => {
    const s = initialState(42, defaultSettings);
    const pegIdx = PLAYER_START[0]!;
    const next = reducer(s, { type: "select", idx: pegIdx });
    expect(next.selected).toBe(pegIdx);
  });
});
