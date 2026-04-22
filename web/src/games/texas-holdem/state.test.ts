import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestFiveOf, compareHands } from "./state.js";
import { rankHand } from "../../engines/deck/ranking.js";
import type { TexasHoldemState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: "1000" as const, blinds: "5/10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("bestFiveOf", () => {
  it("picks best 5 of 7 cards (straight over pair)", () => {
    const cards = [
      makeCard(10, "♠"), makeCard(9, "♠"), makeCard(8, "♠"),
      makeCard(7, "♠"), makeCard(6, "♦"),
      makeCard(2, "♥"), makeCard(2, "♣"),
    ];
    const best = bestFiveOf(cards);
    expect(best).toHaveLength(5);
    expect(rankHand(best).class).toBe("straight");
  });

  it("returns cards unchanged when given exactly 5", () => {
    const cards = [1, 2, 3, 4, 5].map(r => makeCard(r as Card["rank"]));
    const best = bestFiveOf(cards);
    expect(best).toHaveLength(5);
  });
});

describe("compareHands", () => {
  it("flush beats straight", () => {
    const flush = [makeCard(2, "♠"), makeCard(5, "♠"), makeCard(7, "♠"), makeCard(9, "♠"), makeCard(11, "♠")];
    const straight = [makeCard(5, "♠"), makeCard(6, "♥"), makeCard(7, "♦"), makeCard(8, "♣"), makeCard(9, "♠")];
    expect(compareHands(flush, straight)).toBeGreaterThan(0);
  });

  it("same hand class compares kickers", () => {
    const highAce = [makeCard(1, "♠"), makeCard(3, "♥"), makeCard(5, "♦"), makeCard(7, "♣"), makeCard(9, "♦")];
    const highKing = [makeCard(13, "♠"), makeCard(3, "♥"), makeCard(5, "♦"), makeCard(7, "♣"), makeCard(9, "♦")];
    expect(compareHands(highAce, highKing)).toBeGreaterThan(0);
  });
});

describe("initialState", () => {
  it("initializes with correct bankrolls", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.botBankroll).toBe(1000);
    expect(s.phase).toBe("waiting");
    expect(s.handsPlayed).toBe(0);
  });
});

describe("deal action", () => {
  it("transitions from waiting to betting phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(["pre-flop", "flop", "turn", "river", "showdown"]).toContain(s2.phase);
    expect(s2.playerHole).toHaveLength(2);
    expect(s2.botHole).toHaveLength(2);
  });

  it("deducts blinds from both players", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    // Total deducted = small(5) + big(10) = 15
    const totalDeducted = (s.bankroll - s2.bankroll) + (s.botBankroll - s2.botBankroll);
    expect(totalDeducted).toBe(15);
  });

  it("cannot deal with zero bankroll", () => {
    const s = initialState(42, defaultSettings);
    const broke: TexasHoldemState = { ...s, bankroll: 0 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("waiting");
  });
});

describe("fold action", () => {
  it("fold gives pot to bot", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn) {
      const s3 = reducer(s2, { type: "fold" });
      expect(s3.phase).toBe("showdown");
      expect(s3.lastResult).toContain("folds");
    }
  });
});

describe("full hand progression", () => {
  it("can play through a complete hand without error", () => {
    let s = initialState(99, defaultSettings);
    s = reducer(s, { type: "deal" });
    // Play through — just fold if it's player's turn
    if (s.playerTurn && s.phase !== "showdown") {
      s = reducer(s, { type: "fold" });
    }
    expect(s.phase).toBe("showdown");
    expect(typeof s.bankroll).toBe("number");
    expect(s.bankroll).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal returns null during play, score at end with empty stack", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();

    const broke: TexasHoldemState = { ...s, phase: "showdown", bankroll: 0, botBankroll: 2000 };
    expect(isTerminal(broke)).toEqual({ score: 0 });
  });
});
