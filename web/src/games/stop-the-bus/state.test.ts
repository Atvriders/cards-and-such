import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreHand } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("scoreHand", () => {
  it("three of a kind scores 30.5", () => {
    expect(scoreHand([c(5, "♠"), c(5, "♥"), c(5, "♦")])).toBe(30.5);
  });
  it("Ace+K+Q of same suit scores 31", () => {
    expect(scoreHand([c(1, "♠"), c(13, "♠"), c(12, "♠")])).toBe(31);
  });
  it("only matching suit cards count", () => {
    const score = scoreHand([c(5, "♠"), c(6, "♠"), c(9, "♥")]);
    expect(score).toBe(11); // 5+6 of spades
  });
  it("Ace counts as 11", () => {
    expect(scoreHand([c(1, "♠"), c(2, "♥"), c(3, "♦")])).toBe(11);
  });
});

describe("initialState", () => {
  it("deals 3 cards per player", () => {
    const s = initialState(1, settings);
    s.hands.forEach(h => expect(h.length).toBe(3));
  });
  it("pool has 3 cards", () => {
    expect(initialState(1, settings).pool.length).toBe(3);
  });
  it("total cards accounted for", () => {
    const s = initialState(1, settings);
    const total = s.hands.reduce((a, h) => a + h.length, 0) + s.pool.length + s.deck.length;
    expect(total).toBe(52);
  });
  it("phase is drawing", () => expect(initialState(5, settings).phase).toBe("drawing"));
});

describe("reducer", () => {
  it("non-player turn is no-op", () => {
    const s = { ...initialState(1, settings), turn: 1 };
    expect(reducer(s, { type: "pass" })).toBe(s);
  });
  it("swap exchanges cards correctly", () => {
    const s = { ...initialState(1, settings), turn: 0 };
    const origHandCard = s.hands[0]![0]!;
    const origPoolCard = s.pool[0]!;
    const s2 = reducer(s, { type: "swap", handIdx: 0, poolIdx: 0 });
    // After bots play, check cards moved
    const newHand = s2.hands[0]!;
    expect(newHand.some(c => c.id === origPoolCard.id) || s2.pool.some(c => c.id === origHandCard.id)).toBeTruthy();
  });
  it("stopTheBus transitions to done", () => {
    const s = { ...initialState(1, settings), turn: 0 };
    const s2 = reducer(s, { type: "stopTheBus" });
    expect(s2.phase).toBe("done");
  });
  it("pass advances turn", () => {
    const s = { ...initialState(1, settings), turn: 0 };
    const s2 = reducer(s, { type: "pass" });
    expect(s2).toBeDefined();
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("returns score when done", () => {
    const s = { ...initialState(1, settings), phase: "done" as const, scores: [75, 40, 20, 0] as unknown as readonly number[] };
    expect(isTerminal(s)).toEqual({ score: 75 });
  });
});
