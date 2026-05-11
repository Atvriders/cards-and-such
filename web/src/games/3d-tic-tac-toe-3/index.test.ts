import { describe, it, expect } from "vitest";
import { threeDTicTacToePlugin } from "./index.js";
import type { ConnectState } from "./state.js";

const S = { dummy: false } as never;

describe("3d-tic-tac-toe-3 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(threeDTicTacToePlugin.id).toBe("3d-tic-tac-toe-3");
    expect(threeDTicTacToePlugin.title).toBe("3D Tic-Tac-Toe");
    expect(threeDTicTacToePlugin.category).toBe("board");
    expect(threeDTicTacToePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof threeDTicTacToePlugin.description).toBe("string");
    expect(threeDTicTacToePlugin.description.length).toBeGreaterThan(0);
    expect(threeDTicTacToePlugin.settings).toBeDefined();
    expect(typeof threeDTicTacToePlugin.settings).toBe("object");
    expect(typeof threeDTicTacToePlugin.initialState).toBe("function");
    expect(typeof threeDTicTacToePlugin.reducer).toBe("function");
    expect(typeof threeDTicTacToePlugin.isTerminal).toBe("function");
    expect(threeDTicTacToePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = threeDTicTacToePlugin.initialState(42, S);
    const b = threeDTicTacToePlugin.initialState(42, S);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.pieces).toBe(b.pieces);
    expect(a.score).toBe(b.score);
    expect(a.result).toBe(b.result);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(threeDTicTacToePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing on P's turn, and null otherwise", () => {
    expect(typeof threeDTicTacToePlugin.hint).toBe("function");
    const fresh = threeDTicTacToePlugin.initialState(7, S);
    const hint = threeDTicTacToePlugin.hint!(fresh);
    expect(hint).not.toBeNull();
    expect(typeof hint!.selector).toBe("string");
    expect(hint!.selector.length).toBeGreaterThan(0);
    expect(hint!.selector).toContain(".cn-cell");
    if (hint!.pulses !== undefined) {
      expect(typeof hint!.pulses).toBe("number");
      expect(hint!.pulses).toBeGreaterThan(0);
    }

    // Not P's turn -> null
    const cpuTurn: ConnectState = { ...fresh, turn: "C" };
    expect(threeDTicTacToePlugin.hint!(cpuTurn)).toBeNull();

    // Done phase -> null
    const done: ConnectState = { ...fresh, phase: "done" };
    expect(threeDTicTacToePlugin.hint!(done)).toBeNull();

    // isTerminal returns score object when phase is done
    const terminal = threeDTicTacToePlugin.isTerminal({ ...fresh, phase: "done", score: 125 });
    expect(terminal).toEqual({ score: 125 });
  });
});
