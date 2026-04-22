import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, razzRank, compareRazz } from "./state.js";
import type { RazzState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: "1000" as const, anteSize: "10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("razzRank", () => {
  it("returns 5 lowest cards sorted ascending", () => {
    const cards = [1, 2, 3, 4, 5, 10, 13].map(r => makeCard(r as Card["rank"], "♠"));
    const rank = razzRank(cards);
    expect(rank).toEqual([1, 2, 3, 4, 5]);
  });

  it("ace is low (rank=1)", () => {
    const cards = [1, 2, 3, 4, 5].map(r => makeCard(r as Card["rank"], "♠"));
    const rank = razzRank(cards);
    expect(rank[0]).toBe(1); // ace = 1, lowest
  });
});

describe("compareRazz", () => {
  it("A-2-3-4-5 beats A-2-3-4-6", () => {
    const hand1 = [1, 2, 3, 4, 5, 10, 13].map(r => makeCard(r as Card["rank"]));
    const hand2 = [1, 2, 3, 4, 6, 10, 13].map(r => makeCard(r as Card["rank"]));
    expect(compareRazz(hand1, hand2)).toBeGreaterThan(0);
  });

  it("lower hand wins", () => {
    const low = [1, 2, 3, 4, 5, 7, 9].map(r => makeCard(r as Card["rank"]));
    const high = [1, 2, 3, 4, 8, 7, 9].map(r => makeCard(r as Card["rank"]));
    expect(compareRazz(low, high)).toBeGreaterThan(0);
  });

  it("identical hands tie", () => {
    const h = [1, 2, 3, 4, 5, 6, 7].map(r => makeCard(r as Card["rank"]));
    expect(compareRazz(h, h)).toBe(0);
  });
});

describe("initialState", () => {
  it("starts with waiting phase and correct bankrolls", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("waiting");
    expect(s.player.bankroll).toBe(1000);
    expect(s.bot.bankroll).toBe(1000);
    expect(s.player.cards).toHaveLength(0);
  });
});

describe("deal action", () => {
  it("deals 3 cards each and posts antes", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("betting");
    expect(s2.street).toBe(3);
    expect(s2.player.cards).toHaveLength(3);
    expect(s2.bot.cards).toHaveLength(3);
    const ante = parseInt(defaultSettings.anteSize, 10);
    expect(s2.pot).toBe(ante * 2);
  });

  it("3rd street has 2 face-down and 1 face-up", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.player.faceUp).toEqual([false, false, true]);
    expect(s2.bot.faceUp).toEqual([false, false, true]);
  });

  it("cannot deal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: RazzState = { ...s, player: { ...s.player, bankroll: 0 } };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("waiting");
  });
});

describe("fold action", () => {
  it("player fold resolves showdown in bot's favor", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn) {
      const s3 = reducer(s2, { type: "fold" });
      expect(s3.phase).toBe("showdown");
      expect(s3.lastResult).toContain("folded");
    }
  });
});

describe("isTerminal", () => {
  it("not terminal initially", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal when player is out of chips at showdown", () => {
    const s = initialState(42, defaultSettings);
    const terminal: RazzState = {
      ...s,
      phase: "showdown",
      player: { ...s.player, bankroll: 0 },
      bot: { ...s.bot, bankroll: 2000 },
    };
    expect(isTerminal(terminal)).toEqual({ score: 0 });
  });

  it("not terminal when both players still have chips", () => {
    const s = initialState(42, defaultSettings);
    const cont: RazzState = {
      ...s,
      phase: "showdown",
      player: { ...s.player, bankroll: 500 },
      bot: { ...s.bot, bankroll: 500 },
    };
    expect(isTerminal(cont)).toBeNull();
  });
});
