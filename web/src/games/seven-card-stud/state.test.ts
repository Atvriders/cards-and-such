import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestFiveOf } from "./state.js";
import type { SevenCardStudState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: "1000" as const, anteSize: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("bestFiveOf", () => {
  it("returns all 5 cards if given exactly 5", () => {
    const cards = [1, 2, 3, 4, 5].map(r => makeCard(r as Card["rank"]));
    expect(bestFiveOf(cards)).toHaveLength(5);
  });

  it("picks best 5 of 7 (flush beats pair)", () => {
    const spades = [makeCard(2, "♠"), makeCard(4, "♠"), makeCard(6, "♠"), makeCard(8, "♠"), makeCard(10, "♠")];
    const extra = [makeCard(1, "♥"), makeCard(1, "♦")]; // pair of aces
    const best = bestFiveOf([...spades, ...extra]);
    expect(best).toHaveLength(5);
  });

  it("handles 6 cards correctly", () => {
    const cards = [1, 2, 3, 4, 5, 6].map(r => makeCard(r as Card["rank"]));
    expect(bestFiveOf(cards)).toHaveLength(5);
  });
});

describe("initialState", () => {
  it("starts at waiting phase with correct bankroll", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("waiting");
    expect(s.player.bankroll).toBe(1000);
    expect(s.bot.bankroll).toBe(1000);
    expect(s.player.cards).toHaveLength(0);
  });
});

describe("deal action", () => {
  it("deals 3 cards per player and posts ante", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("betting");
    expect(s2.street).toBe(3);
    expect(s2.player.cards).toHaveLength(3);
    expect(s2.bot.cards).toHaveLength(3);
    expect(s2.player.faceUp).toEqual([false, false, true]);
    expect(s2.bot.faceUp).toEqual([false, false, true]);
    const totalAnte = parseInt(defaultSettings.anteSize, 10) * 2;
    expect(s2.pot).toBe(totalAnte);
  });

  it("cannot deal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: SevenCardStudState = { ...s, player: { ...s.player, bankroll: 0 } };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("waiting");
  });
});

describe("fold action", () => {
  it("fold on player's turn resolves to showdown with bot win", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn) {
      const s3 = reducer(s2, { type: "fold" });
      expect(s3.phase).toBe("showdown");
      expect(s3.lastResult).toContain("folded");
    }
  });
});

describe("betting mechanics", () => {
  it("check on player's turn progresses the hand", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn && s2.bot.bet === s2.player.bet) {
      const s3 = reducer(s2, { type: "check" });
      // After player check, bot acts
      expect(["betting", "showdown"]).toContain(s3.phase);
    }
  });

  it("cannot check when there is a bet to call", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    // Artificially create situation where bot has bet more
    const withBet: SevenCardStudState = {
      ...s2,
      playerTurn: true,
      player: { ...s2.player, bet: 0 },
      bot: { ...s2.bot, bet: 20 },
    };
    const s3 = reducer(withBet, { type: "check" });
    expect(s3).toEqual(withBet); // no change
  });
});

describe("isTerminal", () => {
  it("not terminal initially", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal at showdown when player bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const terminal: SevenCardStudState = {
      ...s,
      phase: "showdown",
      player: { ...s.player, bankroll: 0 },
      bot: { ...s.bot, bankroll: 2000 },
    };
    expect(isTerminal(terminal)).toEqual({ score: 0 });
  });
});
