import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CardBlastSettings } from "./state.js";

const s5: CardBlastSettings = { rounds: "5" };
const s8: CardBlastSettings = { rounds: "8" };

describe("CardBlast initialState", () => {
  it("starts with 7 cards in hand", () => {
    expect(initialState(1, s5).hand).toHaveLength(7);
  });

  it("starts with 0 score", () => {
    expect(initialState(1, s5).score).toBe(0);
  });

  it("round 1 of correct total", () => {
    const s = initialState(1, s5);
    expect(s.round).toBe(1);
    expect(s.totalRounds).toBe(5);
  });

  it("not game over initially", () => {
    expect(initialState(1, s8).gameOver).toBe(false);
  });
});

describe("CardBlast reducer", () => {
  it("toggle selects a card", () => {
    let s = initialState(1, s5);
    const cardId = s.hand[0]!.id;
    s = reducer(s, { type: "toggle", id: cardId });
    expect(s.selected).toContain(cardId);
  });

  it("toggle deselects already selected card", () => {
    let s = initialState(1, s5);
    const cardId = s.hand[0]!.id;
    s = reducer(s, { type: "toggle", id: cardId });
    s = reducer(s, { type: "toggle", id: cardId });
    expect(s.selected).not.toContain(cardId);
  });

  it("blast with no selection shows message", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "blast" });
    expect(s2.message).toContain("Select");
  });

  it("blast with cards increases score and advances round", () => {
    let s = initialState(1, s5);
    const cardId = s.hand[0]!.id;
    s = reducer(s, { type: "toggle", id: cardId });
    s = reducer(s, { type: "blast" });
    expect(s.round).toBe(2);
    expect(s.score).toBeGreaterThan(0);
  });

  it("restart resets state", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "toggle", id: s.hand[0]!.id });
    s = reducer(s, { type: "blast" });
    s = reducer(s, { type: "restart" });
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });
});

describe("CardBlast isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, s5), gameOver: true, score: 500 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(100);
  });

  it("score capped at 1000", () => {
    const s = { ...initialState(1, s5), gameOver: true, score: 99999 };
    expect(isTerminal(s)!.score).toBe(1000);
  });
});
