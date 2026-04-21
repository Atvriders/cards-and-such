import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Coord3D } from "./state.js";

const defaultSettings = { botStrength: "easy" as const };

describe("initialState", () => {
  it("creates an empty 4x4x4 board", () => {
    const s = initialState(42, defaultSettings);
    expect(s.board.length).toBe(4);
    expect(s.board[0]!.length).toBe(4);
    expect(s.board[0]![0]!.length).toBe(4);
    expect(s.board[0]![0]![0]).toBeNull();
    expect(s.winner).toBeNull();
    expect(s.turn).toBe("X");
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
  });
});

describe("reducer — place", () => {
  it("places X at given coordinate", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place", at: [0, 0, 0] });
    expect(s2.board[0]![0]![0]).toBe("X");
  });

  it("is a no-op when cell is occupied", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place", at: [0, 0, 0] });
    const s3 = reducer(s2, { type: "place", at: [0, 0, 0] });
    expect(s3).toBe(s2); // no change
  });

  it("is a no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    const done = { ...s, winner: "X" as const };
    const s2 = reducer(done, { type: "place", at: [1, 1, 1] });
    expect(s2).toBe(done);
  });

  it("detects a winning line in layer 0", () => {
    // Force 4 in a row on row 0 of layer 0 — use easy bot so it doesn't always block
    let s = initialState(1, { botStrength: "easy" as const });
    // Set up the board manually: X needs [0,0,0],[0,0,1],[0,0,2],[0,0,3]
    const forcedBoard = s.board.map((layer, l) =>
      layer.map((row, r) =>
        row.map((_, c) => {
          if (l === 0 && r === 0 && c < 3) return "X" as const;
          if (l === 1 && r === 1 && c === 0) return "O" as const;
          if (l === 2 && r === 2 && c === 0) return "O" as const;
          return null;
        })
      )
    );
    const forced: typeof s = { ...s, board: forcedBoard };
    const result = reducer(forced, { type: "place", at: [0, 0, 3] });
    expect(result.winner).toBe("X");
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns 1000 for X win", () => {
    const s = { ...initialState(42, defaultSettings), winner: "X" as const };
    expect(isTerminal(s)!.score).toBe(1000);
  });

  it("returns 200 for draw", () => {
    const s = { ...initialState(42, defaultSettings), winner: "draw" as const };
    expect(isTerminal(s)!.score).toBe(200);
  });

  it("returns 0 for O win", () => {
    const s = { ...initialState(42, defaultSettings), winner: "O" as const };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
