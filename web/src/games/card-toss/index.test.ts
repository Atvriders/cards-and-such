import { describe, it, expect } from "vitest";
import { cardTossPlugin } from "./index.js";
import type { CardTossSettings, CardTossState } from "./state.js";
import { TOTAL_CARDS } from "./state.js";

const S: CardTossSettings = { dummy: false };

describe("cardTossPlugin shape", () => {
  it("has correct identity, category, players, description and required plugin fields", () => {
    expect(cardTossPlugin.id).toBe("card-toss");
    expect(cardTossPlugin.title).toBe("Card Toss");
    expect(cardTossPlugin.category).toBe("cards");
    expect(cardTossPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardTossPlugin.description).toBe("string");
    expect(cardTossPlugin.description.length).toBeGreaterThan(0);
    expect(typeof cardTossPlugin.howToPlay).toBe("string");
    expect(cardTossPlugin.settings).toBeDefined();
    expect(cardTossPlugin.settings.dummy.kind).toBe("boolean");
    expect(cardTossPlugin.settings.dummy.default).toBe(false);
    expect(typeof cardTossPlugin.initialState).toBe("function");
    expect(typeof cardTossPlugin.reducer).toBe("function");
    expect(typeof cardTossPlugin.isTerminal).toBe("function");
    expect(typeof cardTossPlugin.hint).toBe("function");
    expect(cardTossPlugin.component).toBeDefined();
  });

  it("initialState is deterministic by seed and isTerminal is null on a fresh state", () => {
    const a = cardTossPlugin.initialState(42, S);
    const b = cardTossPlugin.initialState(42, S);
    const c = cardTossPlugin.initialState(43, S);

    expect(a.deck.length).toBe(TOTAL_CARDS);
    expect(a.idx).toBe(0);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("playing");
    expect(a.lastResult).toBe("");
    expect(a.current).toBe(a.deck[0]);

    // same seed -> identical deck contents and order
    expect(b.deck).toEqual(a.deck);
    expect(b.current).toBe(a.current);

    // different seed should (very likely) produce a different first card or ordering
    const sameOrder = a.deck.every((card, i) => card === c.deck[i]);
    expect(sameOrder).toBe(false);

    expect(cardTossPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while playing and null when terminal", () => {
    const playing = cardTossPlugin.initialState(7, S);
    const target = cardTossPlugin.hint!(playing);
    expect(target).not.toBeNull();
    expect(target!.selector).toBe('[data-testid="hint-target-card-toss-primary"]');
    expect(target!.pulses).toBe(3);

    const done: CardTossState = { ...playing, phase: "done", current: null };
    expect(cardTossPlugin.isTerminal(done)).toEqual({ score: done.score });
    expect(cardTossPlugin.hint!(done)).toBeNull();
  });
});
