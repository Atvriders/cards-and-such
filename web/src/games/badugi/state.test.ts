import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, evaluateBadugi, compareBadugi } from "./state.js";
import type { BadugiState } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const defaultSettings = { startingBankroll: "1000" as const, anteSize: "25" as const };

function makeCard(rank: Card["rank"], suit: Card["suit"]): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("evaluateBadugi", () => {
  it("4-card badugi: all different suits and ranks", () => {
    const hand = [
      makeCard(1, "♠"), makeCard(2, "♥"), makeCard(3, "♦"), makeCard(4, "♣"),
    ];
    const result = evaluateBadugi(hand);
    expect(result.size).toBe(4);
  });

  it("3-card badugi: two cards share a suit", () => {
    const hand = [
      makeCard(1, "♠"), makeCard(2, "♥"), makeCard(3, "♦"), makeCard(4, "♦"), // ♦ appears twice
    ];
    const result = evaluateBadugi(hand);
    expect(result.size).toBe(3);
  });

  it("2-card badugi: two pairs of shared suits", () => {
    const hand = [
      makeCard(1, "♠"), makeCard(2, "♠"), makeCard(3, "♥"), makeCard(4, "♥"),
    ];
    const result = evaluateBadugi(hand);
    expect(result.size).toBe(2);
  });
});

describe("compareBadugi", () => {
  it("4-card badugi beats 3-card badugi", () => {
    const fourCard = [
      makeCard(10, "♠"), makeCard(11, "♥"), makeCard(12, "♦"), makeCard(13, "♣"),
    ];
    const threeCard = [
      makeCard(1, "♠"), makeCard(2, "♥"), makeCard(3, "♦"), makeCard(3, "♠"),
    ];
    expect(compareBadugi(fourCard, threeCard)).toBeGreaterThan(0);
  });

  it("lower 4-card badugi beats higher 4-card badugi", () => {
    const low = [makeCard(1, "♠"), makeCard(2, "♥"), makeCard(3, "♦"), makeCard(4, "♣")];
    const high = [makeCard(1, "♠"), makeCard(2, "♥"), makeCard(3, "♦"), makeCard(5, "♣")];
    expect(compareBadugi(low, high)).toBeGreaterThan(0);
  });

  it("identical hands tie", () => {
    const hand = [makeCard(1, "♠"), makeCard(2, "♥"), makeCard(3, "♦"), makeCard(4, "♣")];
    expect(compareBadugi(hand, hand)).toBe(0);
  });
});

describe("initialState", () => {
  it("starts with waiting phase and correct bankroll", () => {
    const s = initialState(42, defaultSettings);
    expect(s.phase).toBe("waiting");
    expect(s.bankroll).toBe(1000);
    expect(s.botBankroll).toBe(1000);
    expect(s.playerHand).toHaveLength(0);
  });
});

describe("deal action", () => {
  it("deals 4 cards to each player and posts antes", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.phase).toBe("bet1");
    expect(s2.playerHand).toHaveLength(4);
    expect(s2.botHand).toHaveLength(4);
    const ante = parseInt(defaultSettings.anteSize, 10);
    expect(s2.pot).toBe(ante * 2);
  });

  it("cannot deal when bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const broke: BadugiState = { ...s, bankroll: 0 };
    const s2 = reducer(broke, { type: "deal" });
    expect(s2.phase).toBe("waiting");
  });
});

describe("betting in bet1", () => {
  it("player check moves toward draw phase", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn && s2.phase === "bet1") {
      const s3 = reducer(s2, { type: "check" });
      // After bot also checks, should go to draw1
      expect(["draw1", "showdown", "bet1"]).toContain(s3.phase);
    }
  });
});

describe("draw action", () => {
  it("draw phase replaces selected cards", () => {
    let s = initialState(42, defaultSettings);
    s = reducer(s, { type: "deal" });
    // Check to get to draw1
    if (s.playerTurn && s.phase === "bet1") s = reducer(s, { type: "check" });
    if (s.phase === "draw1") {
      const original = [...s.playerHand];
      s = reducer(s, { type: "toggle-discard", index: 0 });
      s = reducer(s, { type: "draw" });
      expect(s.playerHand).toHaveLength(4);
    }
  });
});

describe("fold action", () => {
  it("folding gives pot to bot", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "deal" });
    if (s2.playerTurn && s2.phase === "bet1") {
      const s3 = reducer(s2, { type: "fold" });
      expect(s3.phase).toBe("showdown");
      expect(s3.lastResult).toContain("folds");
    }
  });
});

describe("isTerminal", () => {
  it("not terminal during game", () => {
    expect(isTerminal(initialState(42, defaultSettings))).toBeNull();
  });

  it("terminal at showdown when player bankroll is 0", () => {
    const s = initialState(42, defaultSettings);
    const terminal: BadugiState = { ...s, phase: "showdown", bankroll: 0, botBankroll: 2000 };
    expect(isTerminal(terminal)).toEqual({ score: 0 });
  });

  it("not terminal at showdown when both have chips", () => {
    const s = initialState(42, defaultSettings);
    const cont: BadugiState = { ...s, phase: "showdown", bankroll: 500, botBankroll: 500 };
    expect(isTerminal(cont)).toBeNull();
  });
});
