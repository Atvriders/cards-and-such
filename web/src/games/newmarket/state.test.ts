import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, BOODLE_CARDS, cardMatchesBoodle } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = { dummy: "off" as const };

function c(rank: Card["rank"], suit: Card["suit"] = "♠"): Card {
  return { rank, suit, id: `${suit}${rank}` };
}

describe("BOODLE_CARDS", () => {
  it("has 4 boodle cards", () => expect(BOODLE_CARDS.length).toBe(4));
  it("includes 10♥", () => expect(BOODLE_CARDS.some(b => b.rank === 10 && b.suit === "♥")).toBe(true));
  it("includes K♠", () => expect(BOODLE_CARDS.some(b => b.rank === 13 && b.suit === "♠")).toBe(true));
});

describe("cardMatchesBoodle", () => {
  it("10♥ matches boodle index 0", () => expect(cardMatchesBoodle(c(10, "♥"))).toBe(0));
  it("K♠ matches boodle index 3", () => expect(cardMatchesBoodle(c(13, "♠"))).toBe(3));
  it("non-boodle returns -1", () => expect(cardMatchesBoodle(c(5, "♠"))).toBe(-1));
});

describe("initialState", () => {
  it("deals cards to 4 players", () => {
    const s = initialState(1, settings);
    s.hands.forEach(h => expect(h.length).toBeGreaterThan(0));
  });
  it("has 4 boodle pots with chips", () => {
    const s = initialState(1, settings);
    expect(s.boodlePot.length).toBe(4);
    s.boodlePot.forEach(p => expect(p).toBeGreaterThan(0));
  });
  it("phase is betting", () => expect(initialState(1, settings).phase).toBe("betting"));
  it("player starts with 20 chips", () => expect(initialState(1, settings).playerChips).toBe(20));
});

describe("reducer", () => {
  it("placeBet transitions to playing", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "placeBet", amount: 0 });
    expect(s2.phase).toBe("playing");
  });
  it("placeBet deducts chips and adds to pots", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "placeBet", amount: 1 });
    expect(s2.playerChips).toBe(19);
    s2.boodlePot.forEach(p => expect(p).toBeGreaterThan(s.boodlePot[0]!));
  });
  it("invalid card returns same state in playing phase", () => {
    const s = { ...initialState(1, settings), phase: "playing" as const };
    const s2 = reducer(s, { type: "playCard", cardId: "nonexistent" });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("null in betting phase", () => expect(isTerminal(initialState(1, settings))).toBeNull());
  it("returns score when done", () => {
    const s = { ...initialState(1, settings), phase: "done" as const };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
    expect(result!.score).toBeLessThanOrEqual(100);
  });
});
