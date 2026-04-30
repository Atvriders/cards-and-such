import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, handTotal, bjValue, isBlackjack, MIN_BET, STARTING_BANKROLL } from "./state.js";
const S = { dummy: false };

describe("MiniBlackjack", () => {
  it("starts in betting with starting bankroll and empty hands", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("betting");
    expect(s.bankroll).toBe(STARTING_BANKROLL);
    expect(s.player.length).toBe(0);
    expect(s.dealer.length).toBe(0);
  });

  it("deal action gives 2 cards each and enters player phase", () => {
    const s = reducer(initialState(2, S), { type: "deal", bet: 10 });
    expect(s.player.length).toBe(2);
    expect(s.dealer.length).toBe(2);
    // either player phase or settled (immediate blackjack possible)
    expect(["player", "settle", "done"]).toContain(s.phase);
    expect(s.bet).toBe(10);
  });

  it("ace counts as 11 then 1 if needed", () => {
    expect(bjValue({ suit: "♠", rank: 1, id: "a" })).toBe(11);
    const aces = [
      { suit: "♠" as const, rank: 1 as const, id: "1" },
      { suit: "♥" as const, rank: 1 as const, id: "2" },
      { suit: "♦" as const, rank: 1 as const, id: "3" },
    ];
    expect(handTotal(aces)).toBe(13); // 11+1+1
  });

  it("isBlackjack detects 21 with 2 cards", () => {
    const bj = [
      { suit: "♠" as const, rank: 1 as const, id: "a" },
      { suit: "♥" as const, rank: 13 as const, id: "k" },
    ];
    expect(isBlackjack(bj)).toBe(true);
  });

  it("hit then stand resolves and updates bankroll", () => {
    let s = reducer(initialState(3, S), { type: "deal", bet: 10 });
    while (s.phase === "player" && handTotal(s.player) < 12) {
      s = reducer(s, { type: "hit" });
    }
    if (s.phase === "player") s = reducer(s, { type: "stand" });
    expect(["settle", "done"]).toContain(s.phase);
    expect(typeof s.bankroll).toBe("number");
  });

  it("isTerminal null until done", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("MIN_BET is positive", () => {
    expect(MIN_BET).toBeGreaterThan(0);
  });
});
