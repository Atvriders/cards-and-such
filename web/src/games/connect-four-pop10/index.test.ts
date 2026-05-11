import { describe, it, expect } from "vitest";
import { connectFourPop10Plugin } from "./index.js";
import type { ConnectState } from "./state.js";

const S = { dummy: false } as never;

describe("connect-four-pop10 plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(connectFourPop10Plugin.id).toBe("connect-four-pop10");
    expect(connectFourPop10Plugin.title).toBe("Connect Four (Pop 10)");
    expect(connectFourPop10Plugin.category).toBe("board");
    expect(connectFourPop10Plugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof connectFourPop10Plugin.description).toBe("string");
    expect(connectFourPop10Plugin.description.length).toBeGreaterThan(0);
    expect(connectFourPop10Plugin.settings).toBeDefined();
    expect(typeof connectFourPop10Plugin.settings).toBe("object");
    expect(typeof connectFourPop10Plugin.initialState).toBe("function");
    expect(typeof connectFourPop10Plugin.reducer).toBe("function");
    expect(typeof connectFourPop10Plugin.isTerminal).toBe("function");
    expect(connectFourPop10Plugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = connectFourPop10Plugin.initialState(42, S);
    const b = connectFourPop10Plugin.initialState(42, S);
    expect(a.board.length).toBe(b.board.length);
    expect(a.board.length).toBe(42);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(a.turn).toBe("P");
    expect(a.phase).toBe("playing");
    expect(a.result).toBeNull();
    expect(a.score).toBe(0);
    expect(a.pieces).toBe(0);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(connectFourPop10Plugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing as P and null when game is done or it is not P's turn", () => {
    expect(typeof connectFourPop10Plugin.hint).toBe("function");

    const playing = connectFourPop10Plugin.initialState(7, S);
    const playingHint = connectFourPop10Plugin.hint!(playing);
    expect(playingHint).not.toBeNull();
    if (playingHint !== null) {
      expect(typeof playingHint.selector).toBe("string");
      expect(playingHint.selector.length).toBeGreaterThan(0);
      expect(playingHint.selector).toBe(".cn-cell:not(.p):not(.c)");
      if (playingHint.pulses !== undefined) {
        expect(typeof playingHint.pulses).toBe("number");
        expect(playingHint.pulses).toBeGreaterThan(0);
      }
    }

    const done: ConnectState = { ...playing, phase: "done" };
    expect(connectFourPop10Plugin.hint!(done)).toBeNull();
    expect(connectFourPop10Plugin.isTerminal(done)).toEqual({ score: done.score });

    const cpuTurn: ConnectState = { ...playing, turn: "C" };
    expect(connectFourPop10Plugin.hint!(cpuTurn)).toBeNull();
  });
});
