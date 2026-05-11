import { describe, it, expect } from "vitest";
import { cardFlagPolePlugin } from "./index.js";
import type { CardFlagPoleSettings } from "./state.js";

const S: CardFlagPoleSettings = { dummy: false };

describe("cardFlagPolePlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cardFlagPolePlugin.id).toBe("card-flag-pole");
    expect(cardFlagPolePlugin.title).toBe("Card Flag Pole");
    expect(cardFlagPolePlugin.category).toBe("cards");
    expect(cardFlagPolePlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardFlagPolePlugin.description).toBe("string");
    expect(cardFlagPolePlugin.description.length).toBeGreaterThan(0);
    expect(cardFlagPolePlugin.settings).toBeDefined();
    expect(cardFlagPolePlugin.settings.dummy.kind).toBe("boolean");
    expect(cardFlagPolePlugin.settings.dummy.default).toBe(false);
    expect(typeof cardFlagPolePlugin.initialState).toBe("function");
    expect(typeof cardFlagPolePlugin.reducer).toBe("function");
    expect(typeof cardFlagPolePlugin.isTerminal).toBe("function");
    expect(typeof cardFlagPolePlugin.hint).toBe("function");
    expect(cardFlagPolePlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cardFlagPolePlugin.initialState(42, S);
    const b = cardFlagPolePlugin.initialState(42, S);
    const c = cardFlagPolePlugin.initialState(43, S);
    expect(a.rngSeed).toBe(42);
    expect(a.deck.length).toBe(52);
    expect(a.drawn).toEqual([]);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("drawing");
    // same seed -> same deck ordering
    expect(b.deck).toEqual(a.deck);
    // different seed should (very likely) produce a different ordering
    const sameOrder = a.deck.every((card, i) => card === c.deck[i]);
    expect(sameOrder).toBe(false);
    expect(cardFlagPolePlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while drawing and null when phase is done", () => {
    const drawing = cardFlagPolePlugin.initialState(7, S);
    const target = cardFlagPolePlugin.hint!(drawing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-card-flag-pole-primary"]');
    expect(target!.pulses).toBe(3);

    // Force phase to "done" — hint should return null.
    const done = { ...drawing, phase: "done" as const };
    expect(cardFlagPolePlugin.hint!(done)).toBeNull();
  });
});
