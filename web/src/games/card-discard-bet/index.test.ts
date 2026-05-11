import { describe, it, expect } from "vitest";
import { cardDiscardBetPlugin } from "./index.js";
import type { CardDiscardBetState } from "./state.js";

const S = { rounds: "10" } as const;

describe("card-discard-bet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardDiscardBetPlugin.id).toBe("card-discard-bet");
    expect(cardDiscardBetPlugin.title).toBe("Card Discard Bet");
    expect(cardDiscardBetPlugin.category).toBe("cards");
    expect(cardDiscardBetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardDiscardBetPlugin.description).toBe("string");
    expect(cardDiscardBetPlugin.description.length).toBeGreaterThan(0);
    expect(cardDiscardBetPlugin.settings).toBeDefined();
    expect(typeof cardDiscardBetPlugin.settings).toBe("object");
    expect(typeof cardDiscardBetPlugin.initialState).toBe("function");
    expect(typeof cardDiscardBetPlugin.reducer).toBe("function");
    expect(typeof cardDiscardBetPlugin.isTerminal).toBe("function");
    expect(cardDiscardBetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardDiscardBetPlugin.initialState(42, S);
    const b = cardDiscardBetPlugin.initialState(42, S);
    expect(a.deck.join(",")).toBe(b.deck.join(","));
    expect(a.currentCard).toBe(b.currentCard);
    expect(a.coins).toBe(0);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(10);
    expect(a.phase).toBe("decide");
    expect(cardDiscardBetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget keyed to the current phase, or null on gameover", () => {
    expect(typeof cardDiscardBetPlugin.hint).toBe("function");

    const decideState = cardDiscardBetPlugin.initialState(7, S);
    const decideHint = cardDiscardBetPlugin.hint!(decideState);
    expect(decideHint).not.toBeNull();
    expect(decideHint!.selector).toBe('[data-testid="hint-target-card-discard-bet-keep"]');
    expect(decideHint!.pulses).toBe(3);

    const resultState: CardDiscardBetState = { ...decideState, phase: "result" };
    const resultHint = cardDiscardBetPlugin.hint!(resultState);
    expect(resultHint).not.toBeNull();
    expect(resultHint!.selector).toBe('[data-testid="hint-target-card-discard-bet-next"]');
    expect(resultHint!.pulses).toBe(3);

    const gameoverState: CardDiscardBetState = { ...decideState, phase: "gameover" };
    expect(cardDiscardBetPlugin.hint!(gameoverState)).toBeNull();
    expect(cardDiscardBetPlugin.isTerminal(gameoverState)).toEqual({ score: gameoverState.coins });
  });
});
