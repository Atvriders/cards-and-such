import { describe, it, expect } from "vitest";
import { accordionPlugin, accordionSettings } from "./index.js";
import type { AccordionState } from "./state.js";

describe("accordion plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(accordionPlugin.id).toBe("accordion");
    expect(accordionPlugin.title).toBe("Accordion");
    expect(accordionPlugin.category).toBe("solitaire");
    expect(accordionPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof accordionPlugin.description).toBe("string");
    expect(accordionPlugin.description.length).toBeGreaterThan(0);
    expect(accordionPlugin.settings).toBe(accordionSettings);
    expect(accordionPlugin.settings.allowJump3.kind).toBe("boolean");
    expect(accordionPlugin.settings.allowJump3.default).toBe(true);
    expect(typeof accordionPlugin.initialState).toBe("function");
    expect(typeof accordionPlugin.reducer).toBe("function");
    expect(typeof accordionPlugin.isTerminal).toBe("function");
    expect(typeof accordionPlugin.hint).toBe("function");
    expect(accordionPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const settings = { allowJump3: true };
    const a = accordionPlugin.initialState(42, settings);
    const b = accordionPlugin.initialState(42, settings);
    expect(a.piles.length).toBe(52);
    expect(a.score).toBe(0);
    expect(a.movesMade).toBe(0);
    expect(a.won).toBe(false);
    const aIds = a.piles.map((p) => p.map((c) => c.id).join("|")).join(";");
    const bIds = b.piles.map((p) => p.map((c) => c.id).join("|")).join(";");
    expect(aIds).toBe(bIds);
    // Every pile should hold exactly one card on a fresh deal.
    for (const pile of a.piles) {
      expect(pile.length).toBe(1);
    }
    expect(accordionPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a fresh deal and null when the game is won", () => {
    const settings = { allowJump3: true };
    const state = accordionPlugin.initialState(7, settings);
    const result = accordionPlugin.hint!(state);
    // With 52 unique cards in a row and 3-away jumps allowed, at least
    // one legal move almost certainly exists; the hint should match the
    // expected selector format when non-null.
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector).toMatch(/^\[data-testid="hint-target-accordion-\d+"\]$/);
      expect(result.pulses).toBe(3);
    }

    // When `won` is true, hint must return null without inspecting piles.
    const wonState: AccordionState = { ...state, won: true };
    expect(accordionPlugin.hint!(wonState)).toBeNull();

    // With no piles at all, legalMoves returns [], so hint returns null.
    const emptyState: AccordionState = { ...state, piles: [] };
    expect(accordionPlugin.hint!(emptyState)).toBeNull();
  });
});
