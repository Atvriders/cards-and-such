import { describe, it, expect } from "vitest";
import { bullsAndCowsPlugin } from "./index.js";
import type { BullsAndCowsState } from "./state.js";

const S = {} as never;

describe("bulls-and-cows plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(bullsAndCowsPlugin.id).toBe("bulls-and-cows");
    expect(bullsAndCowsPlugin.title).toBe("Bulls and Cows");
    expect(bullsAndCowsPlugin.category).toBe("board");
    expect(bullsAndCowsPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof bullsAndCowsPlugin.description).toBe("string");
    expect(bullsAndCowsPlugin.description.length).toBeGreaterThan(0);
    expect(bullsAndCowsPlugin.settings).toBeDefined();
    expect(typeof bullsAndCowsPlugin.settings).toBe("object");
    expect(typeof bullsAndCowsPlugin.initialState).toBe("function");
    expect(typeof bullsAndCowsPlugin.reducer).toBe("function");
    expect(typeof bullsAndCowsPlugin.isTerminal).toBe("function");
    expect(bullsAndCowsPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = bullsAndCowsPlugin.initialState(42, S);
    const b = bullsAndCowsPlugin.initialState(42, S);
    expect(a.answer.join(",")).toBe(b.answer.join(","));
    expect(a.current.join(",")).toBe(b.current.join(","));
    expect(a.guesses.length).toBe(0);
    expect(a.phase).toBe("guess");
    expect(a.answer.length).toBe(4);
    expect(bullsAndCowsPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget during guess phase and null when terminal", () => {
    expect(typeof bullsAndCowsPlugin.hint).toBe("function");
    const state = bullsAndCowsPlugin.initialState(5, S);
    const result = bullsAndCowsPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-deduction-/);
      expect(result.pulses).toBe(3);
    }

    // Force a non-guess phase to exercise the null branch of hint().
    const won: BullsAndCowsState = { ...state, phase: "won" };
    expect(bullsAndCowsPlugin.hint!(won)).toBeNull();
  });
});
