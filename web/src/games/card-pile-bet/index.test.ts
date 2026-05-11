import { describe, it, expect } from "vitest";
import { cardPileBetPlugin } from "./index.js";

const S = { rounds: "12" } as const;

describe("card-pile-bet plugin", () => {
  it("exposes the expected plugin shape", () => {
    expect(cardPileBetPlugin.id).toBe("card-pile-bet");
    expect(cardPileBetPlugin.title).toBe("Card Pile Bet");
    expect(cardPileBetPlugin.category).toBe("cards");
    expect(cardPileBetPlugin.players).toEqual({ min: 1, max: 1, multiplayer: false });
    expect(typeof cardPileBetPlugin.description).toBe("string");
    expect(cardPileBetPlugin.description.length).toBeGreaterThan(0);
    expect(cardPileBetPlugin.settings).toBeDefined();
    expect(typeof cardPileBetPlugin.settings).toBe("object");
    expect(typeof cardPileBetPlugin.initialState).toBe("function");
    expect(typeof cardPileBetPlugin.reducer).toBe("function");
    expect(typeof cardPileBetPlugin.isTerminal).toBe("function");
    expect(cardPileBetPlugin.component).toBeDefined();
  });

  it("initialState is deterministic under the same seed and isTerminal is null on fresh deal", () => {
    const a = cardPileBetPlugin.initialState(42, S);
    const b = cardPileBetPlugin.initialState(42, S);
    expect(a.pile).toEqual(b.pile);
    expect(a.topCard).toBe(b.topCard);
    expect(a.round).toBe(1);
    expect(a.maxRounds).toBe(12);
    expect(a.score).toBe(0);
    expect(a.phase).toBe("betting");
    expect(a.bet).toBeNull();
    expect(a.result).toBeNull();
    expect(a.nextCard).toBeNull();
    expect(a.pile.length).toBe(51);
    expect(cardPileBetPlugin.isTerminal(a)).toBeNull();
  });

  it("hint returns a HintTarget during betting/reveal and null in gameover", () => {
    expect(typeof cardPileBetPlugin.hint).toBe("function");
    const state = cardPileBetPlugin.initialState(7, S);
    const hint = cardPileBetPlugin.hint!(state);
    expect(hint).not.toBeNull();
    expect(hint!.selector).toBe(".bet-btn");
    expect(hint!.pulses).toBe(3);

    const gameover = { ...state, phase: "gameover" as const };
    expect(cardPileBetPlugin.hint!(gameover)).toBeNull();
  });
});
