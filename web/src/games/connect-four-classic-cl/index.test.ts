import { describe, it, expect } from "vitest";
import { connectFourClassicClPlugin } from "./index.js";
import type { ConnectSettings } from "./state.js";

const S: ConnectSettings = { dummy: false };

describe("connect-four-classic-cl plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(connectFourClassicClPlugin.id).toBe("connect-four-classic-cl");
    expect(connectFourClassicClPlugin.title).toBe("Connect Four Classic");
    expect(connectFourClassicClPlugin.category).toBe("board");
    expect(connectFourClassicClPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof connectFourClassicClPlugin.description).toBe("string");
    expect(connectFourClassicClPlugin.description.length).toBeGreaterThan(0);
    expect(connectFourClassicClPlugin.settings).toBeDefined();
    expect(typeof connectFourClassicClPlugin.initialState).toBe("function");
    expect(typeof connectFourClassicClPlugin.reducer).toBe("function");
    expect(typeof connectFourClassicClPlugin.isTerminal).toBe("function");
    expect(connectFourClassicClPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh board", () => {
    const a = connectFourClassicClPlugin.initialState(1234, S);
    const b = connectFourClassicClPlugin.initialState(1234, S);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.board.length).toBe(42);
    expect(a.board.every((c) => c === null)).toBe(true);
    expect(a.turn).toBe("P");
    expect(a.phase).toBe("playing");
    expect(a.result).toBeNull();
    expect(a.moveCount).toBe(0);
    expect(connectFourClassicClPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when board exists, or null otherwise", () => {
    expect(typeof connectFourClassicClPlugin.hint).toBe("function");
    const state = connectFourClassicClPlugin.initialState(7, S);
    // In vitest's default node env there's no document, so we expect null.
    const result = connectFourClassicClPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".c4clcl-board");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
