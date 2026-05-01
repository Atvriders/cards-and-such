import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, shortDeck, bestFiveSD, TOTAL_HANDS } from "./state.js";
import { compareHandsSD } from "../_shared/poker.js";

const S = { startingBankroll: "1000" as const, smallBlind: "10" as const };

describe("Short Deck Hold'em heads-up", () => {
  it("short deck has 36 cards (no 2s/3s/4s/5s)", () => {
    const d = shortDeck();
    expect(d).toHaveLength(36);
    expect(d.every((c) => c.rank === 1 || c.rank >= 6)).toBe(true);
  });

  it("starts in preflop", () => {
    expect(initialState(1, S).phase).toBe("preflop");
  });

  it("deal posts blinds and 2 hole cards each", () => {
    const s = reducer(initialState(2, S), { type: "deal" });
    expect(s.player.hole).toHaveLength(2);
    expect(s.cpu.hole).toHaveLength(2);
    expect(s.pot).toBe(30);
  });

  it("flush beats full house in short-deck ranking", () => {
    // Two hands: full house vs flush
    const fh = [
      { suit: "♠" as const, rank: 13 as const, id: "1" },
      { suit: "♥" as const, rank: 13 as const, id: "2" },
      { suit: "♦" as const, rank: 13 as const, id: "3" },
      { suit: "♠" as const, rank: 12 as const, id: "4" },
      { suit: "♥" as const, rank: 12 as const, id: "5" },
    ];
    const fl = [
      { suit: "♠" as const, rank: 6 as const, id: "1" },
      { suit: "♠" as const, rank: 8 as const, id: "2" },
      { suit: "♠" as const, rank: 10 as const, id: "3" },
      { suit: "♠" as const, rank: 11 as const, id: "4" },
      { suit: "♠" as const, rank: 1 as const, id: "5" },
    ];
    const fhRank = bestFiveSD(fh);
    const flRank = bestFiveSD(fl);
    expect(fhRank.class).toBe("full-house");
    expect(flRank.class).toBe("flush");
    // In short-deck, flush > full house
    expect(compareHandsSD(flRank, fhRank)).toBeGreaterThan(0);
  });

  it("A-6-7-8-9 is a valid straight in short deck", () => {
    const cards = [
      { suit: "♠" as const, rank: 1 as const, id: "1" },
      { suit: "♥" as const, rank: 6 as const, id: "2" },
      { suit: "♦" as const, rank: 7 as const, id: "3" },
      { suit: "♣" as const, rank: 8 as const, id: "4" },
      { suit: "♠" as const, rank: 9 as const, id: "5" },
    ];
    expect(bestFiveSD(cards).class).toBe("straight");
  });

  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("game ends in <= TOTAL_HANDS", () => {
    let s = initialState(3, S);
    for (let i = 0; i < TOTAL_HANDS + 2; i++) {
      s = reducer(s, { type: "deal" });
      s = reducer(s, { type: "fold" });
    }
    expect(s.handsPlayed).toBeLessThanOrEqual(TOTAL_HANDS);
  });
});
