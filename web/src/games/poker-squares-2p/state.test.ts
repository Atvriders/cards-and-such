import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreHand, scoreGrid } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };
const c = (rank: Card["rank"], suit: Card["suit"] = "♠"): Card => ({ rank, suit, id: `${suit}${rank}` });

describe("scoreHand", () => {
  it("royal flush scores 100", () => {
    const hand = [c(10, "♠"), c(11, "♠"), c(12, "♠"), c(13, "♠"), c(1, "♠")];
    expect(scoreHand(hand)).toBe(100);
  });
  it("straight flush scores 75", () => {
    const hand = [c(3, "♠"), c(4, "♠"), c(5, "♠"), c(6, "♠"), c(7, "♠")];
    expect(scoreHand(hand)).toBe(75);
  });
  it("four of a kind scores 50", () => {
    const hand = [c(9, "♠"), c(9, "♥"), c(9, "♦"), c(9, "♣"), c(5, "♠")];
    expect(scoreHand(hand)).toBe(50);
  });
  it("full house scores 25", () => {
    const hand = [c(7, "♠"), c(7, "♥"), c(7, "♦"), c(3, "♠"), c(3, "♥")];
    expect(scoreHand(hand)).toBe(25);
  });
  it("flush scores 20", () => {
    const hand = [c(2, "♠"), c(4, "♠"), c(7, "♠"), c(9, "♠"), c(11, "♠")];
    expect(scoreHand(hand)).toBe(20);
  });
  it("straight scores 15", () => {
    const hand = [c(5, "♠"), c(6, "♥"), c(7, "♦"), c(8, "♣"), c(9, "♠")];
    expect(scoreHand(hand)).toBe(15);
  });
  it("three of a kind scores 10", () => {
    const hand = [c(4, "♠"), c(4, "♥"), c(4, "♦"), c(7, "♠"), c(9, "♠")];
    expect(scoreHand(hand)).toBe(10);
  });
  it("pair scores 2", () => {
    const hand = [c(6, "♠"), c(6, "♥"), c(3, "♦"), c(8, "♠"), c(11, "♠")];
    expect(scoreHand(hand)).toBe(2);
  });
  it("incomplete hand scores 0", () => {
    expect(scoreHand([c(5), null, c(6), c(7), c(8)])).toBe(0);
  });
});

describe("scoreGrid", () => {
  it("empty grid scores 0", () => expect(scoreGrid(Array(25).fill(null))).toBe(0));
  it("full grid with all pairs scores > 0", () => {
    const grid = Array(25).fill(null).map((_, i) => c([3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 1, 1, 2][i] as Card["rank"]));
    expect(scoreGrid(grid)).toBeGreaterThan(0);
  });
});

describe("initialState", () => {
  it("has 24 cards in deck + 1 current", () => {
    const s = initialState(1, settings);
    expect(s.deck.length).toBe(51);
    expect(s.currentCard).not.toBeNull();
  });
  it("grids are empty", () => {
    const s = initialState(1, settings);
    expect(s.playerGrid.every(c => c === null)).toBe(true);
    expect(s.botGrid.every(c => c === null)).toBe(true);
  });
  it("phase is placing", () => expect(initialState(1, settings).phase).toBe("placing"));
  it("deterministic", () => expect(initialState(42, settings).currentCard).toEqual(initialState(42, settings).currentCard));
});

describe("reducer", () => {
  it("placing card fills cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", cellIndex: 0 });
    expect(s2.playerGrid[0]).not.toBeNull();
    expect(s2.cardsPlaced).toBe(1);
  });
  it("placing on occupied cell is no-op", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", cellIndex: 0 });
    const s3 = reducer(s2, { type: "place", cellIndex: 0 });
    expect(s3).toBe(s2);
  });
  it("placing all 25 cards ends game", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 25; i++) s = reducer(s, { type: "place", cellIndex: i });
    expect(s.phase).toBe("done");
  });
  it("bot also places on each turn", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", cellIndex: 5 });
    expect(s2.botGrid.filter(Boolean).length).toBe(1);
  });
});

describe("isTerminal", () => {
  it("null while placing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("player win scores 100", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, playerScore: 50, botScore: 20 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
  it("tie scores 50", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, playerScore: 30, botScore: 30 };
    expect(isTerminal(s)).toEqual({ score: 50 });
  });
  it("loss scores 10", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, playerScore: 10, botScore: 40 };
    expect(isTerminal(s)).toEqual({ score: 10 });
  });
});
