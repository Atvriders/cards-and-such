import { describe, it, expect } from "vitest";
import { cardUpDownPlugin } from "./index.js";
import type { CardUpDownState } from "./state.js";

const S = { rounds: "10" } as const;

describe("card-up-down plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardUpDownPlugin.id).toBe("card-up-down");
    expect(cardUpDownPlugin.title).toBe("Card Up Down");
    expect(cardUpDownPlugin.category).toBe("cards");
    expect(cardUpDownPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardUpDownPlugin.description).toBe("string");
    expect(cardUpDownPlugin.description.length).toBeGreaterThan(0);
    expect(cardUpDownPlugin.settings).toBeDefined();
    expect(typeof cardUpDownPlugin.settings).toBe("object");
    expect(typeof cardUpDownPlugin.initialState).toBe("function");
    expect(typeof cardUpDownPlugin.reducer).toBe("function");
    expect(typeof cardUpDownPlugin.isTerminal).toBe("function");
    expect(cardUpDownPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardUpDownPlugin.initialState(123, S);
    const b = cardUpDownPlugin.initialState(123, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.currentCard).toBe(b.currentCard);
    expect(a.pos).toBe(0);
    expect(a.round).toBe(1);
    expect(a.score).toBe(0);
    expect(a.streak).toBe(0);
    expect(a.phase).toBe("guessing");
    expect(a.maxRounds).toBe(10);
    expect(cardUpDownPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns either null or a HintTarget with a non-empty selector", () => {
    expect(typeof cardUpDownPlugin.hint).toBe("function");
    const state = cardUpDownPlugin.initialState(7, S);

    // Default guessing-phase hint: up button.
    const guessingHint = cardUpDownPlugin.hint!(state);
    expect(guessingHint).not.toBeNull();
    expect(typeof guessingHint!.selector).toBe("string");
    expect(guessingHint!.selector.length).toBeGreaterThan(0);
    expect(guessingHint!.selector).toBe('[data-testid="hint-target-card-up-down-up"]');
    expect(guessingHint!.pulses).toBe(3);

    // Reveal-phase hint: next button.
    const revealState: CardUpDownState = { ...state, phase: "reveal" };
    const revealHint = cardUpDownPlugin.hint!(revealState);
    expect(revealHint).not.toBeNull();
    expect(revealHint!.selector).toBe('[data-testid="hint-target-card-up-down-next"]');
    expect(revealHint!.pulses).toBe(3);

    // Gameover phase returns null.
    const gameoverState: CardUpDownState = { ...state, phase: "gameover" };
    expect(cardUpDownPlugin.hint!(gameoverState)).toBeNull();
    expect(cardUpDownPlugin.isTerminal(gameoverState)).toEqual({ score: state.score });
  });
});
