import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("sjavs initialState", () => {
  it("deals 8 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 8)).toBe(true);
  });

  it("trump is always clubs", () => {
    const s = initialState(42, DEF);
    expect(s.trumpSuit).toBe("♣");
  });

  it("starts in playing phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic", () => {
    const s1 = initialState(88, DEF);
    const s2 = initialState(88, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });
});

describe("sjavs legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    expect(legalPlays(s, 0).length).toBe(8);
  });

  it("must follow led suit", () => {
    const s = initialState(42, DEF);
    const hand = [
      { suit: "♥" as const, rank: 5 as const, id: "h5" },
      { suit: "♦" as const, rank: 3 as const, id: "d3" },
    ];
    const trick = [{ seat: 1, card: { suit: "♥" as const, rank: 9 as const, id: "h9" } }];
    const ms = { ...s, hands: [hand, [], [], []], currentTrick: trick, turn: 0 };
    const legal = legalPlays(ms, 0);
    expect(legal.every(c => c.suit === "♥")).toBe(true);
  });
});

describe("sjavs full game", () => {
  it("completes a game", () => {
    let s = initialState(15, DEF);
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

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, DEF);
    expect(isTerminal(s)).toBeNull();
  });
});
