import { describe, it, expect } from "vitest";
import { conceptDeductionPlugin } from "./index.js";
import type { ConceptDeductionState } from "./state.js";

const S = { dummy: false };

describe("concept-deduction plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(conceptDeductionPlugin.id).toBe("concept-deduction");
    expect(conceptDeductionPlugin.title).toBe("Concept");
    expect(conceptDeductionPlugin.category).toBe("board");
    expect(conceptDeductionPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof conceptDeductionPlugin.description).toBe("string");
    expect(conceptDeductionPlugin.description.length).toBeGreaterThan(0);
    expect(conceptDeductionPlugin.settings).toBeDefined();
    expect(typeof conceptDeductionPlugin.settings).toBe("object");
    expect(typeof conceptDeductionPlugin.initialState).toBe("function");
    expect(typeof conceptDeductionPlugin.reducer).toBe("function");
    expect(typeof conceptDeductionPlugin.isTerminal).toBe("function");
    expect(conceptDeductionPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = conceptDeductionPlugin.initialState(42, S);
    const b = conceptDeductionPlugin.initialState(42, S);
    expect(a.answer).toEqual(b.answer);
    expect(a.current).toEqual(b.current);
    expect(a.phase).toBe("guess");
    expect(a.guesses).toEqual([]);
    expect(a.answer.length).toBe(3);
    expect(conceptDeductionPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null after game ends", () => {
    expect(typeof conceptDeductionPlugin.hint).toBe("function");
    const state = conceptDeductionPlugin.initialState(5, S);
    const result = conceptDeductionPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-deduction-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the engine into a non-guess phase to exercise the `null` branch.
    const ended: ConceptDeductionState = { ...state, phase: "won" };
    expect(conceptDeductionPlugin.hint!(ended)).toBeNull();
  });
});
