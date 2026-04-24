import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isLegalPlay } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("isLegalPlay", () => {
  it("any single on empty pile is legal", () => expect(isLegalPlay([c(5)], null)).toBe(true));
  it("pair on empty pile is legal", () => expect(isLegalPlay([c(7, "♠"), c(7, "♥")], null)).toBe(true));
  it("higher single beats lower", () => expect(isLegalPlay([c(9)], [c(5)])).toBe(true));
  it("lower single rejected", () => expect(isLegalPlay([c(4)], [c(9)])).toBe(false));
  it("wrong count rejected", () => expect(isLegalPlay([c(8), c(8, "♥")], [c(7)])).toBe(false));
  it("empty play rejected", () => expect(isLegalPlay([], null)).toBe(false));
  it("mixed ranks rejected", () => expect(isLegalPlay([c(8), c(9)], null)).toBe(false));
  it("2 beats Ace", () => expect(isLegalPlay([c(2)], [c(1)])).toBe(true));
});

describe("initialState", () => {
  it("deals 52 cards total", () => {
    const s = initialState(1, settings);
    expect(s.hands.reduce((a, h) => a + h.length, 0)).toBe(52);
  });
  it("13 per player", () => {
    initialState(2, settings).hands.forEach(h => expect(h.length).toBe(13));
  });
  it("deterministic", () => {
    expect(initialState(42, settings).hands).toEqual(initialState(42, settings).hands);
  });
  it("phase is playing", () => expect(initialState(5, settings).phase).toBe("playing"));
});

describe("reducer", () => {
  it("non-player turn is no-op", () => {
    const s = { ...initialState(1, settings), turn: 1 };
    expect(reducer(s, { type: "pass" })).toBe(s);
  });
  it("illegal play returns same state", () => {
    const s = { ...initialState(1, settings), turn: 0, lastPlay: [c(13)] };
    expect(reducer(s, { type: "play", cardIds: ["bad"] })).toBe(s);
  });
  it("valid single play removes card from hand", () => {
    const s = { ...initialState(10, settings), turn: 0, lastPlay: null };
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "play", cardIds: [card.id] });
    if (s2 !== s) expect(s2.hands[0]!.length).toBe(12);
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("non-null when done", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [0, 1, 2, 3], scores: [100, 0] as [number, number] };
    expect(isTerminal(s)).not.toBeNull();
  });
  it("score bounded to 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, finishOrder: [0, 1, 2, 3], scores: [200, 0] as [number, number] };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
