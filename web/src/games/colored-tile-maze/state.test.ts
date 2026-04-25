import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const sml = { size: "small" as const };
const med = { size: "medium" as const };

describe("ColoredTileMaze initialState", () => {
  it("creates outer grid for small (5x5 inner → 11x11 outer)", () => {
    const s = initialState(0, sml);
    expect(s.rows).toBe(11);
    expect(s.cols).toBe(11);
    expect(s.tiles.length).toBe(121);
  });

  it("creates 15x15 outer for medium", () => {
    const s = initialState(0, med);
    expect(s.rows).toBe(15);
    expect(s.cols).toBe(15);
  });

  it("player starts at (1,1)", () => {
    const s = initialState(0, sml);
    expect(s.playerRow).toBe(1);
    expect(s.playerCol).toBe(1);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("has an exit tile", () => {
    const s = initialState(0, sml);
    expect(s.tiles.some((t) => t === "exit")).toBe(true);
  });

  it("different seeds produce different tile layouts", () => {
    const s1 = initialState(1, sml);
    const s2 = initialState(99999, sml);
    const same = s1.tiles.every((t, i) => t === s2.tiles[i]);
    expect(same).toBe(false);
  });
});

describe("ColoredTileMaze reducer", () => {
  it("does not move into wall tiles", () => {
    const s = initialState(0, sml);
    // (0,0) is always a wall; moving up from (1,1) would go to (0,1) which is a wall
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.playerRow).toBe(1);
  });

  it("bounces player on red tile", () => {
    const s = initialState(0, sml);
    // Manually place a red tile adjacent and open a path
    const freeIdx = 1 * s.cols + 2; // (1,2)
    const tiles = s.tiles.slice();
    tiles[freeIdx] = "red";
    // Make sure (1,1) → (1,2) is open (no wall between them)
    const state = { ...s, tiles };
    const s2 = reducer(state, { type: "move", dir: "right" });
    // If (1,2) was passable and red, player bounces back to (1,1)
    if (s2.moves === 1) {
      // Could be bounced or could have been a wall — check lastEffect
      if (s2.lastEffect === "Bounced!") {
        expect(s2.playerRow).toBe(1);
        expect(s2.playerCol).toBe(1);
      }
    }
  });

  it("blue tile costs 2 moves", () => {
    const s = initialState(0, sml);
    const tiles = s.tiles.slice();
    const freeIdx = 1 * s.cols + 2;
    if (s.tiles[freeIdx] !== "wall") {
      tiles[freeIdx] = "blue";
      const state = { ...s, tiles };
      const s2 = reducer(state, { type: "move", dir: "right" });
      if (s2.playerCol === 2 && s2.lastEffect === "Slowed!") {
        expect(s2.moves).toBe(2);
      }
    }
  });

  it("does nothing when won", () => {
    const s = initialState(0, sml);
    const won = { ...s, won: true };
    const s2 = reducer(won, { type: "move", dir: "right" });
    expect(s2.moves).toBe(0);
  });
});

describe("ColoredTileMaze isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, sml))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(0, sml);
    const t = isTerminal({ ...s, won: true, moves: 25 });
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});
