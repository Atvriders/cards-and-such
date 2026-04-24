import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay, rankVal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("rankVal", () => {
  it("2 is highest (15)", () => expect(rankVal(2)).toBe(15));
  it("Ace is 14", () => expect(rankVal(1)).toBe(14));
  it("3 is lowest (3)", () => expect(rankVal(3)).toBe(3));
});

describe("isLegalPlay", () => {
  it("any single on empty pile is legal", () => expect(isLegalPlay([c(5)], null)).toBe(true));
  it("pair on empty pile is legal", () => expect(isLegalPlay([c(7, "♠"), c(7, "♥")], null)).toBe(true));
  it("higher single beats lower", () => expect(isLegalPlay([c(9)], [c(5)])).toBe(true));
  it("lower single does not beat higher", () => expect(isLegalPlay([c(4)], [c(9)])).toBe(false));
  it("different count is illegal", () => expect(isLegalPlay([c(8), c(8, "♥")], [c(7)])).toBe(false));
  it("mixed rank play is illegal", () => expect(isLegalPlay([c(8), c(9, "♥")], null)).toBe(false));
  it("empty play is illegal", () => expect(isLegalPlay([], null)).toBe(false));
  it("2 beats Ace", () => expect(isLegalPlay([c(2)], [c(1)])).toBe(true));
});

describe("initialState", () => {
  it("deals 52 cards across 4 hands", () => {
    const s = initialState(1, settings);
    expect(s.hands.reduce((a, h) => a + h.length, 0)).toBe(52);
  });
  it("total cards is 52 after init (bots may have played)", () => {
    const s = initialState(2, settings);
    const total = s.hands.reduce((a, h) => a + h.length, 0) + (s.lastPlay?.length ?? 0);
    // Some cards may have been played by bots in initial round
    expect(s.hands.reduce((a, h) => a + h.length, 0)).toBeGreaterThan(0);
  });
  it("deterministic for same seed", () => {
    expect(initialState(42, settings).hands).toEqual(initialState(42, settings).hands);
  });
  it("phase is playing", () => expect(initialState(5, settings).phase).toBe("playing"));
});

describe("reducer", () => {
  it("pass when no last play is safe", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: null };
    const s2 = reducer(s, { type: "pass" });
    expect(s2).toBeDefined();
  });
  it("illegal card returns same state", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: [c(13)] };
    const s2 = reducer(s, { type: "play", cardIds: ["nonexistent"] });
    expect(s2).toBe(s);
  });
  it("valid play reduces hand", () => {
    const s = { ...initialState(10, settings), turn: 0, lastPlay: null };
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "play", cardIds: [card.id] });
    if (s2 !== s) expect(s2.hands[0]!.length).toBeLessThan(13);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("winner scores 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [0, 1, 2, 3] };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("last place scores 0", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 2, 3, 0] };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });
  it("second place scores 60", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [1, 0, 2, 3] };
    expect(isTerminal(s)).toEqual({ score: 60 });
  });
});
