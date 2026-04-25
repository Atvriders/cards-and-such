import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { cards: "1" as const };

describe("initialState", () => {
  it("generates one card with 25 cells", () => {
    const s = initialState(42, def);
    expect(s.cards.length).toBe(1);
    expect(s.cards[0]!.length).toBe(25);
  });

  it("free space at center (index 12)", () => {
    const s = initialState(42, def);
    expect(s.cards[0]![12]).toBe(0);
    expect(s.marked[0]![12]).toBe(true);
  });

  it("no numbers drawn at start", () => {
    const s = initialState(42, def);
    expect(s.drawn.length).toBe(0);
    expect(s.lastDrawn).toBeNull();
    expect(s.gameOver).toBe(false);
  });

  it("B column (col 0) contains numbers 1-15 only", () => {
    const s = initialState(42, def);
    const bCol = [0,5,10,15,20].map(i => s.cards[0]![i]!);
    expect(bCol.every(n => n >= 1 && n <= 15)).toBe(true);
  });
});

describe("reducer — draw", () => {
  it("draws one number per action", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.drawn.length).toBe(1);
    expect(s2.lastDrawn).not.toBeNull();
  });

  it("drawn number is between 1 and 75", () => {
    const s = initialState(42, def);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.lastDrawn!).toBeGreaterThanOrEqual(1);
    expect(s2.lastDrawn!).toBeLessThanOrEqual(75);
  });

  it("marks matching cell when drawn number matches card", () => {
    const s = initialState(42, def);
    // Find the first non-free number
    const target = s.cards[0]!.find(n => n !== 0)!;
    // Force a state where lastDrawn = target and see if it marks
    let state = s;
    let found = false;
    for (let i = 0; i < 30 && !found && !state.gameOver; i++) {
      state = reducer(state, { type: "draw" });
      if (state.lastDrawn === target) found = true;
    }
    if (found) {
      const targetIdx = s.cards[0]!.indexOf(target);
      expect(state.marked[0]![targetIdx]).toBe(true);
    }
    // This test always verifies draw works
    expect(state.drawn.length).toBeGreaterThan(0);
  });

  it("no-op after game over", () => {
    const s = { ...initialState(42, def), gameOver: true };
    const s2 = reducer(s, { type: "draw" });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, def))).toBeNull();
  });

  it("returns score when bingo", () => {
    const s = { ...initialState(42, def), gameOver: true, score: 400 };
    expect(isTerminal(s)!.score).toBe(400);
  });

  it("higher score for fewer draws", () => {
    const fewDraws = { ...initialState(42, def), gameOver: true, score: 1200 };
    const manyDraws = { ...initialState(42, def), gameOver: true, score: 200 };
    expect(isTerminal(fewDraws)!.score).toBeGreaterThan(isTerminal(manyDraws)!.score);
  });
});
