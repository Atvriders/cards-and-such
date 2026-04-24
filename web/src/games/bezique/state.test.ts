import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("bezique initialState", () => {
  it("deals 8 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands[0]!.length).toBe(8);
    expect(s.hands[1]!.length).toBe(8);
  });

  it("stock has 48 cards", () => {
    const s = initialState(42, DEF);
    expect(s.stock.length).toBe(48);
  });

  it("starts in stock phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("stock");
  });

  it("is deterministic", () => {
    const s1 = initialState(77, DEF);
    const s2 = initialState(77, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });
});

describe("bezique legalPlays", () => {
  it("all cards legal in stock phase", () => {
    const s = initialState(42, DEF);
    expect(legalPlays(s, 0).length).toBe(8);
  });
});

describe("bezique reducer", () => {
  it("playing a card creates trick and advances", () => {
    const s = initialState(42, DEF);
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "play", cardId: card.id });
    expect(["stock", "tricks", "done"].includes(s2.phase)).toBe(true);
  });

  it("isTerminal returns null during play", () => {
    expect(isTerminal(initialState(1, DEF))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = initialState(1, DEF);
    const done = { ...s, phase: "done" as const, playerScore: 200, botScore: 100 };
    expect(isTerminal(done)).not.toBeNull();
    expect(isTerminal(done)!.score).toBeGreaterThan(50);
  });

  it("completes a full game", () => {
    let s = initialState(11, DEF);
    let iter = 0;
    while (s.phase !== "done" && iter < 200) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0 && s.turn === 0) {
        s = reducer(s, { type: "play", cardId: legal[0]!.id });
      }
      iter++;
    }
    expect(["done", "stock", "tricks"].includes(s.phase)).toBe(true);
  });
});
