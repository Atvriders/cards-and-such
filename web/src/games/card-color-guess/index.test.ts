import { describe, it, expect } from "vitest";
import { cardColorGuessPlugin } from "./index.js";
import type { CardColorGuessState } from "./state.js";

const S = { rounds: "10" } as const;

describe("card-color-guess plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardColorGuessPlugin.id).toBe("card-color-guess");
    expect(cardColorGuessPlugin.title).toBe("Card Color Guess");
    expect(cardColorGuessPlugin.category).toBe("cards");
    expect(cardColorGuessPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardColorGuessPlugin.description).toBe("string");
    expect(cardColorGuessPlugin.description.length).toBeGreaterThan(0);
    expect(cardColorGuessPlugin.settings).toBeDefined();
    expect(typeof cardColorGuessPlugin.settings).toBe("object");
    expect(typeof cardColorGuessPlugin.initialState).toBe("function");
    expect(typeof cardColorGuessPlugin.reducer).toBe("function");
    expect(typeof cardColorGuessPlugin.isTerminal).toBe("function");
    expect(cardColorGuessPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardColorGuessPlugin.initialState(42, S);
    const b = cardColorGuessPlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.currentCard).toBe(b.currentCard);
    expect(a.score).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("guessing");
    expect(a.streak).toBe(0);
    expect(a.lastResult).toBeNull();
    expect(cardColorGuessPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget while guessing and null when game is over or revealing", () => {
    expect(typeof cardColorGuessPlugin.hint).toBe("function");
    const state = cardColorGuessPlugin.initialState(7, S);
    const result = cardColorGuessPlugin.hint!(state);
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(typeof result.selector).toBe("string");
      expect(result.selector.length).toBeGreaterThan(0);
      expect(result.selector).toBe(".bet-btn");
      expect(result.pulses).toBe(3);
    }

    const revealState: CardColorGuessState = { ...state, phase: "reveal" };
    expect(cardColorGuessPlugin.hint!(revealState)).toBeNull();

    const gameOverState: CardColorGuessState = { ...state, phase: "gameover" };
    expect(cardColorGuessPlugin.hint!(gameOverState)).toBeNull();
  });
});
