import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bestOmahaHand } from "./state.js";
import type { OmahaState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: "1000" as const, blinds: "5/10" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("bestOmahaHand", () => {
  it("must use exactly 2 hole + 3 community", () => {
    const hole = [makeCard(1, "♠"), makeCard(1, "♥"), makeCard(13, "♦"), makeCard(13, "♣")];
    const community = [makeCard(1, "♦"), makeCard(13, "♥"), makeCard(2, "♣"), makeCard(3, "♣"), makeCard(4, "♠")];
    const best = bestOmahaHand(hole, community);
    expect(best).toHaveLength(5);
    // Best hand should use 2 hole + 3 community
    const holeUsed = best.filter(c => hole.some(h => h.id === c.id)).length;
    const commUsed = best.filter(c => community.some(h => h.id === c.id)).length;
    expect(holeUsed).toBe(2);
    expect(commUsed).toBe(3);
  });

  it("returns partial cards if fewer than 3 community cards", () => {
    const hole = [makeCard(1, "♠"), makeCard(2, "♥"), makeCard(3, "♦"), makeCard(4, "♣")];
    const community: Card[] = [makeCard(5, "♠"), makeCard(6, "♥")];
    const best = bestOmahaHand(hole, community);
    expect(best.length).toBeGreaterThan(0);
  });
});

describe("initialState", () => {
  it("starts with correct bankroll and waiting phase", () => {
    const s = initialState(42, defaultSettings);
    expect(s.bankroll).toBe(1000);
    expect(s.botBankroll).toBe(1000);
    expect(s.phase).toBe("waiting");
    expect(s.playerHole).toHaveLength(0);
  });
});

describe("deal action", () => {
  it("deals 4 hole cards to each player", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.playerHole).toHaveLength(4);
    expect(s2.botHole).toHaveLength(4);
  });

  it("posts blinds from bankrolls", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    const totalDeducted = (s.bankroll - s2.bankroll) + (s.botBankroll - s2.botBankroll);
    expect(totalDeducted).toBe(15); // small(5) + big(10)
  });

  it("does not deal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: OmahaState = { ...s, bankroll: 0 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("waiting");
  });
});

describe("fold action", () => {
  it("fold during player turn gives pot to bot", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn) {
      const s3 = reducer(s2, { type: "fold" });
      expect(s3.phase).toBe("showdown");
      expect(s3.lastResult).toContain("folds");
    }
  });
});

describe("isTerminal", () => {
  it("not terminal during game", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("terminal when bankroll exhausted at showdown", () => {
    const s = initialState(42, defaultSettings);
    const terminal: OmahaState = { ...s, phase: "showdown", bankroll: 0, botBankroll: 2000 };
    expect(isTerminal(terminal)).toEqual({ score: 0 });
  });

  it("terminal when bot bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const terminal: OmahaState = { ...s, phase: "showdown", bankroll: 2000, botBankroll: 0 };
    expect(isTerminal(terminal)).toEqual({ score: 2000 });
  });
});

describe("full hand", () => {
  it("can fold and play multiple hands", () => {
    let s = initialState(7, defaultSettings);
    for (let i = 0; i < 3; i++) {
      if (s.bankroll <= 0 || s.botBankroll <= 0) break;
      s = reducer(s, { type: "deal" });
      if (s.playerTurn) s = reducer(s, { type: "fold" });
    }
    expect(s.handsPlayed).toBeGreaterThan(0);
  });
});
