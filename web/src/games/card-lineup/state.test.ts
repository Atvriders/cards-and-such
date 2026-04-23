import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isSorted, cardValue } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("creates 9 cards that are not sorted (or sorted differently)", () => {
    const s = initialState(42, settings);
    expect(s.cards).toHaveLength(9);
    expect(s.moves).toBe(0);
    expect(s.solved).toBe(false);
    expect(s.selected).toBeNull();
  });

  it("all 9 cards are unique", () => {
    const s = initialState(1, settings);
    const keys = s.cards.map((c) => `${c.rank}${c.suit}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(9);
  });
});

describe("isSorted", () => {
  it("returns true for ascending cards", () => {
    const cards = [
      { rank: 2 as const, suit: "♠" as const },
      { rank: 3 as const, suit: "♠" as const },
      { rank: 4 as const, suit: "♠" as const },
    ];
    expect(isSorted(cards)).toBe(true);
  });

  it("returns false for descending", () => {
    const cards = [
      { rank: 5 as const, suit: "♠" as const },
      { rank: 3 as const, suit: "♠" as const },
    ];
    expect(isSorted(cards)).toBe(false);
  });
});

describe("reducer — select / swap", () => {
  it("select sets selected index", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "select", idx: 3 });
    expect(s2.selected).toBe(3);
  });

  it("select same again deselects", () => {
    const s = { ...initialState(42, settings), selected: 3 };
    const s2 = reducer(s, { type: "select", idx: 3 });
    expect(s2.selected).toBeNull();
  });

  it("swap exchanges two cards and increments moves", () => {
    const s = { ...initialState(42, settings), selected: 0 };
    const cardA = s.cards[0]!;
    const cardB = s.cards[2]!;
    const s2 = reducer(s, { type: "swap", idx: 2 });
    expect(s2.cards[0]!.rank).toBe(cardB.rank);
    expect(s2.cards[2]!.rank).toBe(cardA.rank);
    expect(s2.moves).toBe(1);
    expect(s2.selected).toBeNull();
  });

  it("no-op when done", () => {
    const s = { ...initialState(42, settings), solved: true };
    const s2 = reducer(s, { type: "select", idx: 0 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null while unsolved", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("score = max(0, 200 - moves*10)", () => {
    const s = { ...initialState(1, settings), solved: true, moves: 5 };
    expect(isTerminal(s)!.score).toBe(150);
  });

  it("score floor is 0", () => {
    const s = { ...initialState(1, settings), solved: true, moves: 100 };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("perfect solve in 0 swaps scores 200 (pre-sorted edge)", () => {
    const s = { ...initialState(1, settings), solved: true, moves: 0 };
    expect(isTerminal(s)!.score).toBe(200);
  });
});
