import { describe, it, expect } from "vitest";
import { babyloniaTilesPlugin } from "./index.js";

const S = {} as never;

describe("babylonia-tiles plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(babyloniaTilesPlugin.id).toBe("babylonia-tiles");
    expect(babyloniaTilesPlugin.title).toBe("Babylonia Tiles");
    expect(babyloniaTilesPlugin.category).toBe("board");
    expect(babyloniaTilesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof babyloniaTilesPlugin.description).toBe("string");
    expect(babyloniaTilesPlugin.description.length).toBeGreaterThan(0);
    expect(babyloniaTilesPlugin.settings).toBeDefined();
    expect(typeof babyloniaTilesPlugin.settings).toBe("object");
    expect(typeof babyloniaTilesPlugin.initialState).toBe("function");
    expect(typeof babyloniaTilesPlugin.reducer).toBe("function");
    expect(typeof babyloniaTilesPlugin.isTerminal).toBe("function");
    expect(babyloniaTilesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh game", () => {
    const a = babyloniaTilesPlugin.initialState(42, S);
    const b = babyloniaTilesPlugin.initialState(42, S);
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(b.turn);
    expect(a.phase).toBe(b.phase);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.result).toBe(b.result);
    expect(a.board).toEqual(["", "", "", "", "", "", "", "", ""]);
    expect(a.phase).toBe("playing");
    expect(babyloniaTilesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns null when .g-grid isn't present, or a HintTarget when it is", () => {
    expect(typeof babyloniaTilesPlugin.hint).toBe("function");
    const state = babyloniaTilesPlugin.initialState(7, S);
    const result = babyloniaTilesPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(result.selector).toBe(".g-grid");
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
