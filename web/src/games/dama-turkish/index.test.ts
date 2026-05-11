import { describe, it, expect } from "vitest";
import { damaTurkishPlugin } from "./index.js";

const S = { dummy: false } as never;

describe("dama-turkish plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(damaTurkishPlugin.id).toBe("dama-turkish");
    expect(damaTurkishPlugin.title).toBe("Dama (Turkish)");
    expect(damaTurkishPlugin.category).toBe("board");
    expect(damaTurkishPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof damaTurkishPlugin.description).toBe("string");
    expect(damaTurkishPlugin.description.length).toBeGreaterThan(0);
    expect(damaTurkishPlugin.settings).toBeDefined();
    expect(typeof damaTurkishPlugin.settings).toBe("object");
    expect(typeof damaTurkishPlugin.initialState).toBe("function");
    expect(typeof damaTurkishPlugin.reducer).toBe("function");
    expect(typeof damaTurkishPlugin.isTerminal).toBe("function");
    expect(damaTurkishPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = damaTurkishPlugin.initialState(42, S);
    const b = damaTurkishPlugin.initialState(42, S);
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(b.turn);
    expect(a.moves).toBe(b.moves);
    expect(a.result).toBe(b.result);
    expect(a.phase).toBe(b.phase);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.phase).toBe("playing");
    expect(a.turn).toBe("P");
    expect(a.moves).toBe(0);
    expect(a.result).toBeNull();
    expect(damaTurkishPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof damaTurkishPlugin.hint).toBe("function");
    const state = damaTurkishPlugin.initialState(5, S);
    const result = damaTurkishPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".dtk-board");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }
  });
});
