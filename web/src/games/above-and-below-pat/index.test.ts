import { describe, it, expect } from "vitest";
import { aboveAndBelowPatPlugin } from "./index.js";

const S = { dummy: false };

describe("above-and-below-pat plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aboveAndBelowPatPlugin.id).toBe("above-and-below-pat");
    expect(aboveAndBelowPatPlugin.title).toBe("Above and Below");
    expect(aboveAndBelowPatPlugin.category).toBe("solitaire");
    expect(aboveAndBelowPatPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aboveAndBelowPatPlugin.description).toBe("string");
    expect(aboveAndBelowPatPlugin.description.length).toBeGreaterThan(0);
    expect(aboveAndBelowPatPlugin.settings).toBeDefined();
    expect(typeof aboveAndBelowPatPlugin.settings).toBe("object");
    expect(typeof aboveAndBelowPatPlugin.initialState).toBe("function");
    expect(typeof aboveAndBelowPatPlugin.reducer).toBe("function");
    expect(typeof aboveAndBelowPatPlugin.isTerminal).toBe("function");
    expect(aboveAndBelowPatPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = aboveAndBelowPatPlugin.initialState(42, S);
    const b = aboveAndBelowPatPlugin.initialState(42, S);
    expect(a.deck).toEqual(b.deck);
    expect(a.hand).toEqual(b.hand);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.hand.length).toBe(5);
    expect(a.deck.length).toBe(52);
    expect(aboveAndBelowPatPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null once terminal", () => {
    expect(typeof aboveAndBelowPatPlugin.hint).toBe("function");
    const state = aboveAndBelowPatPlugin.initialState(7, S);
    const result = aboveAndBelowPatPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="play-restart-btn"]');
    expect(result!.pulses).toBe(3);

    // Force terminal phase: hint must fall through to null.
    const doneState = { ...state, phase: "done" as const };
    expect(aboveAndBelowPatPlugin.isTerminal(doneState)).toEqual({ score: doneState.score });
    expect(aboveAndBelowPatPlugin.hint!(doneState)).toBeNull();
  });
});
