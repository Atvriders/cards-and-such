import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings5 = { roundsToWin: "5" as const };
const settings3 = { roundsToWin: "3" as const };

describe("initialState", () => {
  it("creates a 52-card deck", () => {
    const s = initialState(42, settings5);
    expect(s.deck.length).toBe(52);
    expect(s.playerWins).toBe(0);
    expect(s.botWins).toBe(0);
    expect(s.done).toBe(false);
  });

  it("deck is deterministic for same seed", () => {
    const s1 = initialState(7, settings5);
    const s2 = initialState(7, settings5);
    expect(s1.deck[0]!.rank).toBe(s2.deck[0]!.rank);
    expect(s1.deck[0]!.suit).toBe(s2.deck[0]!.suit);
  });
});

describe("reducer", () => {
  it("deals two cards per draw", () => {
    const s = initialState(1, settings5);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.deck.length).toBe(50);
    expect(s2.playerCard).not.toBeNull();
    expect(s2.botCard).not.toBeNull();
  });

  it("records correct lastResult", () => {
    const s = initialState(1, settings5);
    const s2 = reducer(s, { type: "draw" });
    const { playerCard, botCard, lastResult } = s2;
    if (playerCard!.rank > botCard!.rank) expect(lastResult).toBe("player");
    else if (botCard!.rank > playerCard!.rank) expect(lastResult).toBe("bot");
    else expect(lastResult).toBe("tie");
  });

  it("done after player reaches roundsToWin", () => {
    let s = initialState(42, settings3);
    s = { ...s, playerWins: 2 };
    // Find a scenario where player wins next round
    // Force deck with high player card
    s = { ...s, deck: [{ rank: 14, suit: "♠" }, { rank: 2, suit: "♣" }, ...s.deck.slice(2)] };
    const s2 = reducer(s, { type: "draw" });
    expect(s2.playerWins).toBe(3);
    expect(s2.done).toBe(true);
    expect(s2.playerWon).toBe(true);
  });

  it("is no-op when done", () => {
    const s = { ...initialState(1, settings5), done: true };
    const s2 = reducer(s, { type: "draw" });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, settings5))).toBeNull();
  });

  it("returns higher score for player win than loss", () => {
    const won = { ...initialState(1, settings5), done: true, playerWon: true, playerWins: 5 };
    const lost = { ...initialState(1, settings5), done: true, playerWon: false, playerWins: 2 };
    expect(isTerminal(won)!.score).toBeGreaterThan(isTerminal(lost)!.score);
  });

  it("score is playerWins*100 for win", () => {
    const s = { ...initialState(1, settings5), done: true, playerWon: true, playerWins: 5 };
    expect(isTerminal(s)!.score).toBe(500);
  });
});
