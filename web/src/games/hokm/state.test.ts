import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("hokm initialState", () => {
  it("deals 13 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 13)).toBe(true);
  });

  it("starts in chooseTrump phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("chooseTrump");
  });

  it("is deterministic", () => {
    const s1 = initialState(11, DEF);
    const s2 = initialState(11, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("hakem is player 0", () => {
    const s = initialState(1, DEF);
    expect(s.hakem).toBe(0);
  });
});

describe("hokm chooseTrump", () => {
  it("choosing trump transitions to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "chooseTrump", suit: "♥" });
    expect(s2.phase).toBe("playing");
    expect(s2.trumpSuit).toBe("♥");
  });
});

describe("hokm legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "chooseTrump", suit: "♠" });
    if (s2.phase !== "playing" || s2.turn !== 0) return;
    expect(legalPlays(s2, 0).length).toBe(13);
  });
});

describe("hokm full game", () => {
  it("completes a game", () => {
    let s = initialState(6, DEF);
    s = reducer(s, { type: "chooseTrump", suit: "♣" });
    let iter = 0;
    while (s.phase === "playing" && iter < 200) {
      if (s.turn === 0) {
        const legal = legalPlays(s, 0);
        if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      }
      iter++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
