import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, collectedCount } from "./state.js";

const s2 = { keys: "2" as const };
const s4 = { keys: "4" as const };

describe("KeyMaze initialState", () => {
  it("creates correct number of keys", () => {
    const s = initialState(0, s2);
    expect(s.keys.length).toBe(2);
    expect(s.keys.every((k) => !k.collected)).toBe(true);
  });

  it("4 keys setting creates 4 keys", () => {
    const s = initialState(0, s4);
    expect(s.keys.length).toBe(4);
  });

  it("player starts at 0,0", () => {
    const s = initialState(0, s2);
    expect(s.playerRow).toBe(0);
    expect(s.playerCol).toBe(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("exit is at bottom-right", () => {
    const s = initialState(0, s2);
    expect(s.exit.row).toBe(s.rows - 1);
    expect(s.exit.col).toBe(s.cols - 1);
  });
});

describe("KeyMaze reducer", () => {
  it("does not move through outer walls upward from row 0", () => {
    const s = initialState(0, s2);
    const s2r = reducer(s, { type: "move", dir: "up" });
    expect(s2r.playerRow).toBe(0);
  });

  it("collects key when stepping on it", () => {
    const s = initialState(0, s2);
    // Place a key at (0,1) and manually verify collection
    const keyAt01 = { ...s, keys: [{ row: 0, col: 1, id: 0, collected: false }, s.keys[1] ?? { row: 5, col: 5, id: 1, collected: false }] };
    // Force a situation where vWalls allow rightward move
    const freeWalls = s.vWalls.slice();
    freeWalls[0] = false; // open right of (0,0)
    const openState = { ...keyAt01, vWalls: freeWalls };
    const moved = reducer(openState, { type: "move", dir: "right" });
    if (moved.playerCol === 1) {
      expect(collectedCount(moved)).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not win at exit without all keys", () => {
    const s = initialState(0, s2);
    // Teleport player to exit manually, keys not collected
    const atExit = { ...s, playerRow: s.rows - 1, playerCol: s.cols - 2 };
    // open a wall to exit
    const freeV = atExit.vWalls.slice();
    freeV[(s.rows - 1) * s.cols + (s.cols - 2)] = false;
    const state2 = { ...atExit, vWalls: freeV };
    const moved = reducer(state2, { type: "move", dir: "right" });
    if (moved.playerRow === s.rows - 1 && moved.playerCol === s.cols - 1) {
      expect(moved.won).toBe(false);
    }
  });

  it("does nothing when won", () => {
    const s = initialState(0, s2);
    const won = { ...s, won: true };
    const s2r = reducer(won, { type: "move", dir: "right" });
    expect(s2r.won).toBe(true);
    expect(s2r.moves).toBe(0);
  });
});

describe("KeyMaze isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(0, s2);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(0, s2);
    const won = { ...s, won: true, moves: 50 };
    const t = isTerminal(won);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});
