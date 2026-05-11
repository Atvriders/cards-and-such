import { describe, it, expect } from "vitest";
import { cardPopBetPlugin } from "./index.js";
import type { CardPopBetState } from "./state.js";

const S = { rounds: "10" as const };

describe("card-pop-bet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPopBetPlugin.id).toBe("card-pop-bet");
    expect(cardPopBetPlugin.title).toBe("Card Pop Bet");
    expect(cardPopBetPlugin.category).toBe("cards");
    expect(cardPopBetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPopBetPlugin.description).toBe("string");
    expect(cardPopBetPlugin.description.length).toBeGreaterThan(0);
    expect(cardPopBetPlugin.settings).toBeDefined();
    expect(typeof cardPopBetPlugin.settings).toBe("object");
    expect(typeof cardPopBetPlugin.initialState).toBe("function");
    expect(typeof cardPopBetPlugin.reducer).toBe("function");
    expect(typeof cardPopBetPlugin.isTerminal).toBe("function");
    expect(cardPopBetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh start", () => {
    const a = cardPopBetPlugin.initialState(42, S);
    const b = cardPopBetPlugin.initialState(42, S);
    expect(a).toEqual(b);
    expect(a.coins).toBe(100);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("betting");
    expect(a.card).toBeNull();
    expect(cardPopBetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget on a non-terminal state and null when terminal", () => {
    expect(typeof cardPopBetPlugin.hint).toBe("function");
    const state = cardPopBetPlugin.initialState(7, S);
    const result = cardPopBetPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe('[data-testid="hint-target-card-pop-bet-primary"]');
      if (result.pulses !== undefined) {
        expect(typeof result.pulses).toBe("number");
        expect(result.pulses).toBeGreaterThan(0);
      }
    }

    const finished: CardPopBetState = { ...state, phase: "gameover" };
    expect(cardPopBetPlugin.hint!(finished)).toBeNull();
    expect(cardPopBetPlugin.isTerminal(finished)).toEqual({ score: finished.coins });
  });
});
