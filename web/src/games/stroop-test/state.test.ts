import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, calcScore } from "./state.js";

const settings20Med = { rounds: "20" as const, difficulty: "medium" as const };
const settings30Easy = { rounds: "30" as const, difficulty: "easy" as const };

describe("StroopTest initialState", () => {
  it("starts at index 0, not ended, 0 correct", () => {
    const s = initialState(42, settings20Med);
    expect(s.currentIndex).toBe(0);
    expect(s.ended).toBe(false);
    expect(s.correct).toBe(0);
  });

  it("deck has the right number of cards", () => {
    const s = initialState(42, settings20Med);
    expect(s.deck.length).toBe(20);
    const s2 = initialState(42, settings30Easy);
    expect(s2.deck.length).toBe(30);
  });

  it("same seed produces same deck", () => {
    const s1 = initialState(7, settings20Med);
    const s2 = initialState(7, settings20Med);
    expect(s1.deck).toEqual(s2.deck);
  });

  it("deck cards have valid color fields", () => {
    const s = initialState(1, settings20Med);
    const valid = ["red", "green", "blue", "yellow", "purple", "orange"];
    for (const card of s.deck) {
      expect(valid).toContain(card.word);
      expect(valid).toContain(card.ink);
    }
  });
});

describe("StroopTest answer action", () => {
  it("correct answer increments correct count", () => {
    const s = initialState(42, settings20Med);
    const ink = s.deck[0]!.ink;
    const s2 = reducer(s, { type: "answer", color: ink });
    expect(s2.correct).toBe(1);
    expect(s2.incorrect).toBe(0);
    expect(s2.lastResult).toBe("correct");
  });

  it("wrong answer increments incorrect count", () => {
    const s = initialState(42, settings20Med);
    const card = s.deck[0]!;
    // Find a color that is NOT the ink
    const wrong = ["red", "green", "blue", "yellow", "purple", "orange"].find(c => c !== card.ink)!;
    const s2 = reducer(s, { type: "answer", color: wrong as typeof card.ink });
    expect(s2.incorrect).toBe(1);
    expect(s2.correct).toBe(0);
    expect(s2.lastResult).toBe("wrong");
  });

  it("answering last card ends the game", () => {
    let s = initialState(42, settings20Med);
    for (let i = 0; i < 20; i++) {
      const ink = s.deck[s.currentIndex]!.ink;
      s = reducer(s, { type: "answer", color: ink });
    }
    expect(s.ended).toBe(true);
  });

  it("no action after ended", () => {
    const s = { ...initialState(42, settings20Med), ended: true, correct: 10 };
    const s2 = reducer(s, { type: "answer", color: "red" });
    expect(s2.correct).toBe(10);
  });
});

describe("StroopTest tick", () => {
  it("advances elapsed", () => {
    const s = initialState(42, settings20Med);
    const s2 = reducer(s, { type: "tick", dt: 1.5 });
    expect(s2.elapsed).toBeCloseTo(1.5);
  });
});

describe("StroopTest isTerminal and calcScore", () => {
  it("returns null while playing", () => {
    const s = initialState(42, settings20Med);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score object when ended", () => {
    const s = { ...initialState(42, settings20Med), ended: true };
    expect(isTerminal(s)).not.toBeNull();
  });

  it("calcScore is 0 with no answers", () => {
    const s = initialState(42, settings20Med);
    expect(calcScore(s)).toBe(0);
  });

  it("calcScore increases with correct answers", () => {
    const s = { ...initialState(42, settings20Med), correct: 15, incorrect: 0, elapsed: 10 };
    expect(calcScore(s)).toBeGreaterThan(0);
  });
});
