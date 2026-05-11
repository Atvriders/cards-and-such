import { describe, it, expect } from "vitest";
import { crossCluesPlugin } from "./index.js";

const SETTINGS = { difficulty: "easy" as const };

describe("cross-clues plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(crossCluesPlugin.id).toBe("cross-clues");
    expect(crossCluesPlugin.title).toBe("Cross Clues Mini");
    expect(crossCluesPlugin.category).toBe("board");
    expect(crossCluesPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof crossCluesPlugin.description).toBe("string");
    expect(crossCluesPlugin.description.length).toBeGreaterThan(0);
    expect(crossCluesPlugin.settings).toBeDefined();
    expect(typeof crossCluesPlugin.settings).toBe("object");
    expect(typeof crossCluesPlugin.initialState).toBe("function");
    expect(typeof crossCluesPlugin.reducer).toBe("function");
    expect(typeof crossCluesPlugin.isTerminal).toBe("function");
    expect(crossCluesPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = crossCluesPlugin.initialState(42, SETTINGS);
    const b = crossCluesPlugin.initialState(42, SETTINGS);
    expect(a.puzzleIdx).toBe(b.puzzleIdx);
    expect(a.rowCategories).toEqual(b.rowCategories);
    expect(a.colCategories).toEqual(b.colCategories);
    expect(a.answers).toEqual(b.answers);
    expect(a.playerGuesses).toEqual(b.playerGuesses);
    expect(a.activeCell).toBeNull();
    expect(a.hintsUsed).toBe(0);
    expect(a.hintRevealed).toEqual([]);
    expect(a.checked).toEqual({});
    expect(a.submitted).toBe(false);
    expect(a.won).toBe(false);
    expect(a.score).toBe(0);
    expect(crossCluesPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof crossCluesPlugin.hint).toBe("function");
    const state = crossCluesPlugin.initialState(7, SETTINGS);
    const result = crossCluesPlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".cc-btn");
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // When the game is marked as won, hint should fall through to null.
    const wonState = { ...state, won: true };
    expect(crossCluesPlugin.hint!(wonState)).toBeNull();
  });
});
