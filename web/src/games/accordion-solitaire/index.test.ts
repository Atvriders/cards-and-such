import { describe, it, expect } from "vitest";
import { accordionSolitairePlugin } from "./index.js";
import type { AccordionSolitaireState } from "./state.js";

const S = {} as never;

describe("accordion-solitaire plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(accordionSolitairePlugin.id).toBe("accordion-solitaire");
    expect(accordionSolitairePlugin.title).toBe("Accordion");
    expect(accordionSolitairePlugin.category).toBe("solitaire");
    expect(accordionSolitairePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof accordionSolitairePlugin.description).toBe("string");
    expect(accordionSolitairePlugin.description.length).toBeGreaterThan(0);
    expect(accordionSolitairePlugin.settings).toBeDefined();
    expect(typeof accordionSolitairePlugin.settings).toBe("object");
    expect(typeof accordionSolitairePlugin.initialState).toBe("function");
    expect(typeof accordionSolitairePlugin.reducer).toBe("function");
    expect(typeof accordionSolitairePlugin.isTerminal).toBe("function");
    expect(typeof accordionSolitairePlugin.hint).toBe("function");
    expect(accordionSolitairePlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = accordionSolitairePlugin.initialState(42, S);
    const b = accordionSolitairePlugin.initialState(42, S);
    const aIds = a.cards.map((c) => (c ? c.id : "_")).join("|");
    const bIds = b.cards.map((c) => (c ? c.id : "_")).join("|");
    expect(aIds).toBe(bIds);
    expect(a.cards.length).toBe(52);
    expect(a.movesMade).toBe(0);
    expect(a.score).toBe(0);
    expect(a.won).toBe(false);
    expect(accordionSolitairePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    const state = accordionSolitairePlugin.initialState(5, S);
    const result = accordionSolitairePlugin.hint!(state);
    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toMatch(/^\[data-testid="hint-target-accordion-solitaire-/);
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    // Force the won-branch early return to null.
    const wonState: AccordionSolitaireState = { ...state, won: true };
    expect(accordionSolitairePlugin.hint!(wonState)).toBeNull();

    // Force the fall-through `return null` branch by emptying the board.
    const emptied: AccordionSolitaireState = { ...state, cards: [] };
    expect(accordionSolitairePlugin.hint!(emptied)).toBeNull();
  });
});
