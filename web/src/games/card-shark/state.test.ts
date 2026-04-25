import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, cardValue } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { decks: "1" as const, rounds: "10" as const };

function makeCard(rank: number, suit: Card["suit"]): Card {
  return { rank: rank as Card["rank"], suit, id: `${suit}${rank}` };
}

describe("initialState", () => {
  it("starts with score 0, round 1, not over", () => {
    const s = initialState(1, settings);
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
    expect(s.over).toBe(false);
    expect(s.streak).toBe(0);
  });

  it("has currentCard and nextCard set", () => {
    const s = initialState(1, settings);
    expect(s.currentCard).not.toBeNull();
    expect(s.nextCard).not.toBeNull();
  });
});

describe("cardValue", () => {
  it("returns 14 for Ace (rank 1)", () => {
    expect(cardValue(makeCard(1, "♠"))).toBe(14);
  });

  it("returns face rank for J/Q/K", () => {
    expect(cardValue(makeCard(11, "♥"))).toBe(11);
    expect(cardValue(makeCard(13, "♣"))).toBe(13);
  });

  it("returns numeric value for 2-10", () => {
    expect(cardValue(makeCard(7, "♦"))).toBe(7);
  });
});

describe("higher action", () => {
  it("marks correct when next card is higher", () => {
    const s = initialState(1, settings);
    const lowCard = makeCard(2, "♠");
    const highCard = makeCard(10, "♥");
    const forced = { ...s, currentCard: lowCard, nextCard: highCard, shoe: [lowCard, highCard] as readonly Card[] };
    const after = reducer(forced, { type: "higher" });
    expect(after.lastResult).toBe("correct");
    expect(after.streak).toBe(1);
    expect(after.score).toBeGreaterThan(0);
  });

  it("marks wrong when next card is lower", () => {
    const s = initialState(1, settings);
    const highCard = makeCard(10, "♠");
    const lowCard = makeCard(2, "♥");
    const forced = { ...s, currentCard: highCard, nextCard: lowCard, shoe: [highCard, lowCard] as readonly Card[] };
    const after = reducer(forced, { type: "higher" });
    expect(after.lastResult).toBe("wrong");
    expect(after.streak).toBe(0);
  });
});

describe("lower action", () => {
  it("marks correct when next card is lower", () => {
    const s = initialState(1, settings);
    const highCard = makeCard(13, "♣");
    const lowCard = makeCard(3, "♦");
    const forced = { ...s, currentCard: highCard, nextCard: lowCard, shoe: [highCard, lowCard] as readonly Card[] };
    const after = reducer(forced, { type: "lower" });
    expect(after.lastResult).toBe("correct");
  });
});

describe("tie", () => {
  it("records tie when cards are equal value", () => {
    const s = initialState(1, settings);
    const card1 = makeCard(7, "♠");
    const card2 = makeCard(7, "♥");
    const forced = { ...s, currentCard: card1, nextCard: card2, shoe: [card1, card2] as readonly Card[] };
    const after = reducer(forced, { type: "higher" });
    expect(after.lastResult).toBe("tie");
  });
});

describe("game ends after maxRounds", () => {
  it("sets over=true after all rounds played", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < s.maxRounds; i++) {
      s = reducer(s, { type: "higher" });
    }
    expect(s.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 650 };
    expect(isTerminal(s)!.score).toBe(650);
  });
});
