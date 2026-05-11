import { describe, it, expect } from "vitest";
import { connectFourClassicPlugin } from "./index.js";
import type { ConnectState } from "./state.js";

const S = { dummy: false } as never;

describe("connect-four-classic plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(connectFourClassicPlugin.id).toBe("connect-four-classic");
    expect(connectFourClassicPlugin.title).toBe("Connect Four (Classic)");
    expect(connectFourClassicPlugin.category).toBe("board");
    expect(connectFourClassicPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof connectFourClassicPlugin.description).toBe("string");
    expect(connectFourClassicPlugin.description.length).toBeGreaterThan(0);
    expect(connectFourClassicPlugin.settings).toBeDefined();
    expect(typeof connectFourClassicPlugin.settings).toBe("object");
    expect(typeof connectFourClassicPlugin.initialState).toBe("function");
    expect(typeof connectFourClassicPlugin.reducer).toBe("function");
    expect(typeof connectFourClassicPlugin.isTerminal).toBe("function");
    expect(connectFourClassicPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = connectFourClassicPlugin.initialState(123, S);
    const b = connectFourClassicPlugin.initialState(123, S);
    expect(a.board.length).toBe(42);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(a.turn).toBe("P");
    expect(a.phase).toBe("playing");
    expect(a.result).toBeNull();
    expect(a.score).toBe(0);
    expect(a.pieces).toBe(0);
    expect(a.moveCount).toBe(0);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.board).toEqual(b.board);
    expect(connectFourClassicPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh board and null when phase is done or it's CPU turn", () => {
    expect(typeof connectFourClassicPlugin.hint).toBe("function");
    const state = connectFourClassicPlugin.initialState(7, S);
    const result = connectFourClassicPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector).toMatch(/^\[data-testid="c4cl-col-\d+"\]$/);
      expect(result.pulses).toBe(3);
    }

    const cpuTurn: ConnectState = { ...state, turn: "C" };
    expect(connectFourClassicPlugin.hint!(cpuTurn)).toBeNull();

    const done: ConnectState = { ...state, phase: "done" };
    expect(connectFourClassicPlugin.hint!(done)).toBeNull();

    // isTerminal returns a score when phase is done
    const term = connectFourClassicPlugin.isTerminal({ ...state, phase: "done", score: 142 });
    expect(term).toEqual({ score: 142 });
  });
});
