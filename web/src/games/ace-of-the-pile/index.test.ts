import { describe, it, expect } from "vitest";
import { aceOfThePilePlugin } from "./index.js";
import type { AceOfThePileState } from "./state.js";

const S = {} as never;

describe("ace-of-the-pile plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(aceOfThePilePlugin.id).toBe("ace-of-the-pile");
    expect(aceOfThePilePlugin.title).toBe("Ace of the Pile");
    expect(aceOfThePilePlugin.category).toBe("solitaire");
    expect(aceOfThePilePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof aceOfThePilePlugin.description).toBe("string");
    expect(aceOfThePilePlugin.description.length).toBeGreaterThan(0);
    expect(typeof aceOfThePilePlugin.howToPlay).toBe("string");
    expect(aceOfThePilePlugin.settings).toBeDefined();
    expect(typeof aceOfThePilePlugin.settings).toBe("object");
    expect(typeof aceOfThePilePlugin.initialState).toBe("function");
    expect(typeof aceOfThePilePlugin.reducer).toBe("function");
    expect(typeof aceOfThePilePlugin.isTerminal).toBe("function");
    expect(aceOfThePilePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = aceOfThePilePlugin.initialState(123, S);
    const b = aceOfThePilePlugin.initialState(123, S);
    const aIds = a.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.cards.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    expect(a.score).toBe(0);
    expect(a.movesMade).toBe(0);
    expect(a.won).toBe(false);
    expect(aceOfThePilePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a pile-* selector, and null when all piles are empty", () => {
    expect(typeof aceOfThePilePlugin.hint).toBe("function");
    const state = aceOfThePilePlugin.initialState(7, S);
    const result = aceOfThePilePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector).toMatch(/^\[data-testid="pile-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Drain all piles to force hint() to fall through to the final `return null`.
    const emptied: AceOfThePileState = {
      ...state,
      piles: state.piles.map((p) => ({ ...p, cards: [] })),
    };
    expect(aceOfThePilePlugin.hint!(emptied)).toBeNull();
  });
});
