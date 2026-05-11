import { describe, it, expect } from "vitest";
import { brazilianDraughtsPlugin } from "./index.js";

const S = { dummy: false } as const;

describe("brazilian-draughts plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(brazilianDraughtsPlugin.id).toBe("brazilian-draughts");
    expect(brazilianDraughtsPlugin.title).toBe("Brazilian Draughts");
    expect(brazilianDraughtsPlugin.category).toBe("board");
    expect(brazilianDraughtsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof brazilianDraughtsPlugin.description).toBe("string");
    expect(brazilianDraughtsPlugin.description.length).toBeGreaterThan(0);
    expect(brazilianDraughtsPlugin.settings).toBeDefined();
    expect(typeof brazilianDraughtsPlugin.settings).toBe("object");
    expect(typeof brazilianDraughtsPlugin.initialState).toBe("function");
    expect(typeof brazilianDraughtsPlugin.reducer).toBe("function");
    expect(typeof brazilianDraughtsPlugin.isTerminal).toBe("function");
    expect(brazilianDraughtsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = brazilianDraughtsPlugin.initialState(1234, S);
    const b = brazilianDraughtsPlugin.initialState(1234, S);
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(b.turn);
    expect(a.moves).toBe(b.moves);
    expect(a.result).toBe(b.result);
    expect(a.phase).toBe(b.phase);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.board.length).toBe(64);
    expect(a.turn).toBe("P");
    expect(a.moves).toBe(0);
    expect(a.result).toBeNull();
    expect(a.phase).toBe("playing");
    expect(brazilianDraughtsPlugin.isTerminal(a)).toBeNull();

    const done = { ...a, phase: "done" as const, score: 77 };
    const term = brazilianDraughtsPlugin.isTerminal(done);
    expect(term).not.toBeNull();
    expect(term!.score).toBe(77);
  });

  it("hint returns either a HintTarget with a non-empty selector or null", () => {
    expect(typeof brazilianDraughtsPlugin.hint).toBe("function");
    const state = brazilianDraughtsPlugin.initialState(7, S);
    const result = brazilianDraughtsPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
