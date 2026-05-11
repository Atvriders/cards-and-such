import { describe, it, expect } from "vitest";
import { bohnenspielPlugin } from "./index.js";
import type { AbsState } from "./state.js";

describe("bohnenspiel plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bohnenspielPlugin.id).toBe("bohnenspiel");
    expect(bohnenspielPlugin.title).toBe("Bohnenspiel");
    expect(bohnenspielPlugin.category).toBe("board");
    expect(bohnenspielPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bohnenspielPlugin.description).toBe("string");
    expect(bohnenspielPlugin.description.length).toBeGreaterThan(0);
    expect(typeof bohnenspielPlugin.howToPlay).toBe("string");
    expect(bohnenspielPlugin.settings).toBeDefined();
    expect(bohnenspielPlugin.settings.dummy.kind).toBe("boolean");
    expect(bohnenspielPlugin.settings.dummy.default).toBe(false);
    expect(typeof bohnenspielPlugin.initialState).toBe("function");
    expect(typeof bohnenspielPlugin.reducer).toBe("function");
    expect(typeof bohnenspielPlugin.isTerminal).toBe("function");
    expect(typeof bohnenspielPlugin.hint).toBe("function");
    expect(bohnenspielPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on a fresh state", () => {
    const a = bohnenspielPlugin.initialState(42, { dummy: false });
    const b = bohnenspielPlugin.initialState(42, { dummy: false });

    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.turn).toBe("P");
    expect(a.moves).toBe(0);
    expect(a.result).toBeNull();
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.board.length).toBe(25);
    expect(a.board.every((c) => c === null)).toBe(true);

    expect(bohnenspielPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing on the human turn and null otherwise", () => {
    const state = bohnenspielPlugin.initialState(7, { dummy: false });
    const result = bohnenspielPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector).toBe(".ab-cell:not(.p):not(.c)");
      expect(result.pulses).toBe(3);
    }

    // hint returns null when the phase is done.
    const done: AbsState = { ...state, phase: "done", result: "draw" };
    expect(bohnenspielPlugin.hint!(done)).toBeNull();

    // hint returns null when it is not the human's turn.
    const botTurn: AbsState = { ...state, turn: "C" };
    expect(bohnenspielPlugin.hint!(botTurn)).toBeNull();
  });
});
