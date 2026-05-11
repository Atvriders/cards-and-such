import { describe, it, expect } from "vitest";
import { tic3d3x3x3Plugin } from "./index.js";
import type { ConnectState } from "./state.js";

const S = { dummy: false };

describe("3d-tic-tac-toe-3x3x3 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(tic3d3x3x3Plugin.id).toBe("3d-tic-tac-toe-3x3x3");
    expect(tic3d3x3x3Plugin.title).toBe("3D Tic-Tac-Toe (3x3x3)");
    expect(tic3d3x3x3Plugin.category).toBe("board");
    expect(tic3d3x3x3Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof tic3d3x3x3Plugin.description).toBe("string");
    expect(tic3d3x3x3Plugin.description.length).toBeGreaterThan(0);
    expect(tic3d3x3x3Plugin.settings).toBeDefined();
    expect(typeof tic3d3x3x3Plugin.settings).toBe("object");
    expect(typeof tic3d3x3x3Plugin.initialState).toBe("function");
    expect(typeof tic3d3x3x3Plugin.reducer).toBe("function");
    expect(typeof tic3d3x3x3Plugin.isTerminal).toBe("function");
    expect(tic3d3x3x3Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = tic3d3x3x3Plugin.initialState(42, S);
    const b = tic3d3x3x3Plugin.initialState(42, S);
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.score).toBe(b.score);
    expect(a.pieces).toBe(b.pieces);
    expect(a.result).toBe(b.result);
    expect(a.phase).toBe("playing");
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(tic3d3x3x3Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while the player is to move and null once the game is done", () => {
    expect(typeof tic3d3x3x3Plugin.hint).toBe("function");
    const state = tic3d3x3x3Plugin.initialState(7, S);
    const result = tic3d3x3x3Plugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".cn-cell:not(.p):not(.c)");
      expect(result.pulses).toBe(3);
    }

    // When it's not the player's turn, hint() falls through to null.
    const cTurn: ConnectState = { ...state, turn: "C" };
    expect(tic3d3x3x3Plugin.hint!(cTurn)).toBeNull();

    // When the game has ended, hint() also returns null.
    const finished: ConnectState = { ...state, phase: "done", result: "draw" };
    expect(tic3d3x3x3Plugin.hint!(finished)).toBeNull();
  });
});
