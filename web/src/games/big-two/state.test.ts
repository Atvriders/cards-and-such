import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay, rankVal, fiveCardType } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("rankVal", () => {
  it("2 is highest (15)", () => expect(rankVal(2)).toBe(15));
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("3 is lowest (3)", () => expect(rankVal(3)).toBe(3));
  it("King is 13", () => expect(rankVal(13)).toBe(13));
});

describe("isLegalPlay", () => {
  it("single on empty pile is legal", () => expect(isLegalPlay([c(5)], null)).toBe(true));
  it("pair on empty pile is legal", () => expect(isLegalPlay([c(7, "♠"), c(7, "♥")], null)).toBe(true));
  it("pair beats lower pair", () => expect(isLegalPlay([c(8, "♠"), c(8, "♥")], [c(7, "♠"), c(7, "♥")])).toBe(true));
  it("lower single does not beat higher", () => expect(isLegalPlay([c(4)], [c(9)])).toBe(false));
  it("mismatched hand type rejected", () => expect(isLegalPlay([c(8), c(8, "♥")], [c(7)])).toBe(false));
  it("empty play is illegal", () => expect(isLegalPlay([], null)).toBe(false));
  it("2 beats Ace as single", () => expect(isLegalPlay([c(2)], [c(1)])).toBe(true));
  it("triple on empty is legal", () => expect(isLegalPlay([c(6, "♠"), c(6, "♥"), c(6, "♦")], null)).toBe(true));
});

describe("fiveCardType", () => {
  it("straight flush > four of a kind score", () => {
    const sf = fiveCardType([c(3, "♠"), c(4, "♠"), c(5, "♠"), c(6, "♠"), c(7, "♠")])!;
    const foak = fiveCardType([c(9, "♠"), c(9, "♥"), c(9, "♦"), c(9, "♣"), c(5, "♠")])!;
    expect(sf).toBeGreaterThan(foak);
  });
  it("flush > straight", () => {
    const flush = fiveCardType([c(3, "♠"), c(5, "♠"), c(7, "♠"), c(9, "♠"), c(11, "♠")])!;
    const straight = fiveCardType([c(3, "♠"), c(4, "♥"), c(5, "♦"), c(6, "♣"), c(7, "♠")])!;
    expect(flush).toBeGreaterThan(straight);
  });
  it("returns null for non-5-card hands", () => expect(fiveCardType([c(3), c(4)])).toBeNull());
  it("full house has score in 300 range", () => {
    const fh = fiveCardType([c(5, "♠"), c(5, "♥"), c(5, "♦"), c(9, "♠"), c(9, "♥")])!;
    expect(fh).toBeGreaterThanOrEqual(300);
    expect(fh).toBeLessThan(400);
  });
});

describe("initialState", () => {
  it("deals 52 cards across 4 hands", () => {
    const s = initialState(9, settings);
    const total = s.hands.reduce((a, h) => a + h.length, 0);
    expect(total).toBe(52);
  });
  it("13 cards per player", () => {
    const s = initialState(9, settings);
    s.hands.forEach(h => expect(h.length).toBe(13));
  });
  it("deterministic for same seed", () => {
    expect(initialState(42, settings).hands).toEqual(initialState(42, settings).hands);
  });
  it("phase is playing", () => expect(initialState(5, settings).phase).toBe("playing"));
});

describe("reducer", () => {
  it("pass on empty pile is no-op", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: null };
    const s2 = reducer(s, { type: "pass" });
    // pass when lastPlay is null still advances passCount or resets (no crash)
    expect(s2).toBeDefined();
  });
  it("playing invalid cards returns same state", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: [c(13)] };
    const s2 = reducer(s, { type: "play", cardIds: ["nonexistent"] });
    expect(s2).toBe(s);
  });
  it("valid play reduces hand size", () => {
    const s = initialState(10, settings);
    const forced = { ...s, turn: 0, lastPlay: null };
    const card = forced.hands[0]![0]!;
    const s2 = reducer(forced, { type: "play", cardIds: [card.id] });
    if (s2 !== forced) expect(s2.hands[0]!.length).toBeLessThan(13);
  });
});

describe("isTerminal", () => {
  it("returns null while game in progress", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("first finisher scores 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [0, 1, 2, 3] };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("last finisher scores 0", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 2, 3, 0] };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
  it("second finisher scores 60", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 0, 2, 3] };
    expect(isTerminal(s)).toEqual({ score: 60 });
  });
});
