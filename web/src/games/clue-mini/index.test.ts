import { describe, it, expect } from "vitest";
import { clueMiniPlugin } from "./index.js";
import type { ClueMiniState } from "./state.js";

const S = {} as never;

describe("clue-mini plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(clueMiniPlugin.id).toBe("clue-mini");
    expect(clueMiniPlugin.title).toBe("Clue Mini");
    expect(clueMiniPlugin.category).toBe("board");
    expect(clueMiniPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof clueMiniPlugin.description).toBe("string");
    expect(clueMiniPlugin.description.length).toBeGreaterThan(0);
    expect(clueMiniPlugin.settings).toBeDefined();
    expect(typeof clueMiniPlugin.settings).toBe("object");
    expect(typeof clueMiniPlugin.initialState).toBe("function");
    expect(typeof clueMiniPlugin.reducer).toBe("function");
    expect(typeof clueMiniPlugin.isTerminal).toBe("function");
    expect(clueMiniPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = clueMiniPlugin.initialState(123, S);
    const b = clueMiniPlugin.initialState(123, S);
    expect(a.answer.join(",")).toBe(b.answer.join(","));
    expect(a.current.join(",")).toBe(b.current.join(","));
    expect(a.guesses.length).toBe(0);
    expect(a.phase).toBe("guess");
    expect(a.answer.length).toBe(3);
    expect(clueMiniPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget during guess phase and null when terminal", () => {
    expect(typeof clueMiniPlugin.hint).toBe("function");
    const state = clueMiniPlugin.initialState(7, S);
    const result = clueMiniPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-deduction-/);
      expect(result.pulses).toBe(3);
    }

    // Force a non-guess phase to exercise the null branch of hint().
    const won: ClueMiniState = { ...state, phase: "won" };
    expect(clueMiniPlugin.hint!(won)).toBeNull();
  });
});
