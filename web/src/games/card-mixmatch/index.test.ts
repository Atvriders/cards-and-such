import { describe, it, expect } from "vitest";
import { cardMixmatchPlugin } from "./index.js";
import type { CardMixmatchState } from "./state.js";

const S = { dummy: false };

describe("card-mixmatch plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardMixmatchPlugin.id).toBe("card-mixmatch");
    expect(cardMixmatchPlugin.title).toBe("Card Mixmatch");
    expect(cardMixmatchPlugin.category).toBe("cards");
    expect(cardMixmatchPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardMixmatchPlugin.description).toBe("string");
    expect(cardMixmatchPlugin.description.length).toBeGreaterThan(0);
    expect(cardMixmatchPlugin.settings).toBeDefined();
    expect(typeof cardMixmatchPlugin.settings).toBe("object");
    expect(typeof cardMixmatchPlugin.initialState).toBe("function");
    expect(typeof cardMixmatchPlugin.reducer).toBe("function");
    expect(typeof cardMixmatchPlugin.isTerminal).toBe("function");
    expect(cardMixmatchPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh state", () => {
    const a = cardMixmatchPlugin.initialState(42, S);
    const b = cardMixmatchPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.hand).toEqual([]);
    expect(a.phase).toBe("dealing");
    expect(cardMixmatchPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on fresh state and null when terminal", () => {
    expect(typeof cardMixmatchPlugin.hint).toBe("function");
    const state = cardMixmatchPlugin.initialState(5, S);
    const result = cardMixmatchPlugin.hint!(state);
    expect(result).not.toBeNull();
    expect(typeof result!.selector).toBe("string");
    expect(result!.selector.length).toBeGreaterThan(0);
    expect(result!.selector).toBe('[data-testid="hint-target-card-mixmatch-primary"]');
    expect(result!.pulses).toBe(3);

    const terminal: CardMixmatchState = { ...state, phase: "done" };
    expect(cardMixmatchPlugin.isTerminal(terminal)).toEqual({ score: terminal.score });
    expect(cardMixmatchPlugin.hint!(terminal)).toBeNull();
  });
});
