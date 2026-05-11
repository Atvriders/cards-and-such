import { describe, it, expect } from "vitest";
import { cardCanyonPlugin } from "./index.js";
import type { CardCanyonState } from "./state.js";

const S = { dummy: false };

describe("card-canyon plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardCanyonPlugin.id).toBe("card-canyon");
    expect(cardCanyonPlugin.title).toBe("Card Canyon");
    expect(cardCanyonPlugin.category).toBe("cards");
    expect(cardCanyonPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardCanyonPlugin.description).toBe("string");
    expect(cardCanyonPlugin.description.length).toBeGreaterThan(0);
    expect(cardCanyonPlugin.settings).toBeDefined();
    expect(typeof cardCanyonPlugin.initialState).toBe("function");
    expect(typeof cardCanyonPlugin.reducer).toBe("function");
    expect(typeof cardCanyonPlugin.isTerminal).toBe("function");
    expect(cardCanyonPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cardCanyonPlugin.initialState(42, S);
    const b = cardCanyonPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.rngSeed).toBe(42);
    expect(a.round).toBe(1);
    expect(a.hand).toEqual([]);
    expect(a.sum).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("dealing");
    expect(a.lastPts).toBe(0);
    expect(cardCanyonPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget when not terminal and null when terminal", () => {
    expect(typeof cardCanyonPlugin.hint).toBe("function");
    const state = cardCanyonPlugin.initialState(7, S);
    const result = cardCanyonPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector).toBe('[data-testid="hint-target-card-canyon-primary"]');
    expect(result!.pulses).toBe(3);

    const done: CardCanyonState = { ...state, phase: "done" };
    expect(cardCanyonPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(cardCanyonPlugin.hint!(done)).toBeNull();
  });
});
