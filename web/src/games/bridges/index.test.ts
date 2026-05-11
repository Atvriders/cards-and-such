import { describe, it, expect } from "vitest";
import { bridgesPlugin } from "./index.js";

const S = { difficulty: "easy" } as const;

describe("bridges plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bridgesPlugin.id).toBe("bridges");
    expect(bridgesPlugin.title).toBe("Bridges");
    expect(bridgesPlugin.category).toBe("board");
    expect(bridgesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bridgesPlugin.description).toBe("string");
    expect(bridgesPlugin.description.length).toBeGreaterThan(0);
    expect(bridgesPlugin.settings).toBeDefined();
    expect(typeof bridgesPlugin.settings).toBe("object");
    expect(typeof bridgesPlugin.initialState).toBe("function");
    expect(typeof bridgesPlugin.reducer).toBe("function");
    expect(typeof bridgesPlugin.isTerminal).toBe("function");
    expect(bridgesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh puzzle", () => {
    const a = bridgesPlugin.initialState(42, S);
    const b = bridgesPlugin.initialState(42, S);
    expect(a.puzzle).toEqual(b.puzzle);
    expect(a.bridges).toEqual([]);
    expect(a.bridges).toEqual(b.bridges);
    expect(a.won).toBe(false);
    expect(a.moves).toBe(0);
    expect(bridgesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof bridgesPlugin.hint).toBe("function");
    const state = bridgesPlugin.initialState(5, S);
    const result = bridgesPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-bridges-action"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When won is true, hint returns null.
    const wonState = { ...state, won: true };
    expect(bridgesPlugin.hint!(wonState)).toBeNull();
  });
});
