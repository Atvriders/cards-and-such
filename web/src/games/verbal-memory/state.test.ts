import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings3Easy = { lives: "3" as const, difficulty: "easy" as const };
const settings5Med = { lives: "5" as const, difficulty: "medium" as const };

describe("VerbalMemory initialState", () => {
  it("starts with score 0, not ended, no lastResult", () => {
    const s = initialState(42, settings3Easy);
    expect(s.score).toBe(0);
    expect(s.ended).toBe(false);
    expect(s.lastResult).toBeNull();
  });

  it("has the correct number of lives", () => {
    const s = initialState(42, settings3Easy);
    expect(s.lives).toBe(3);
    const s2 = initialState(42, settings5Med);
    expect(s2.lives).toBe(5);
  });

  it("same seed produces same queue", () => {
    const s1 = initialState(7, settings3Easy);
    const s2 = initialState(7, settings3Easy);
    expect(s1.queue).toEqual(s2.queue);
  });

  it("generates a non-empty queue", () => {
    const s = initialState(1, settings5Med);
    expect(s.queue.length).toBeGreaterThan(10);
  });
});

describe("VerbalMemory seen/new actions", () => {
  it("marking a new word as NEW is correct and increments score", () => {
    const s = initialState(42, settings3Easy);
    const s2 = reducer(s, { type: "new" });
    expect(s2.score).toBe(1);
    expect(s2.lives).toBe(3);
    expect(s2.lastResult).toBe("correct");
  });

  it("marking a new word as SEEN is wrong and loses a life", () => {
    const s = initialState(42, settings3Easy);
    const s2 = reducer(s, { type: "seen" });
    expect(s2.score).toBe(0);
    expect(s2.lives).toBe(2);
    expect(s2.lastResult).toBe("wrong");
  });

  it("marking a previously seen word as SEEN is correct", () => {
    const s = initialState(42, settings3Easy);
    // Mark first word as new (correct)
    const s2 = reducer(s, { type: "new" });
    const firstWord = s.queue[0]!;
    // Manually set current to point to same word again
    const reseenState = { ...s2, currentIndex: s2.currentIndex, seen: [firstWord], queue: [firstWord, ...s2.queue] };
    const s3 = reducer(reseenState, { type: "seen" });
    expect(s3.lastResult).toBe("correct");
  });

  it("game ends when lives reach 0", () => {
    let s = initialState(42, settings3Easy);
    // Force all words to be new, mark SEEN repeatedly to drain lives
    for (let i = 0; i < 3 && !s.ended; i++) {
      s = reducer(s, { type: "seen" });
    }
    expect(s.ended).toBe(true);
  });
});

describe("VerbalMemory isTerminal", () => {
  it("returns null while running", () => {
    const s = initialState(42, settings3Easy);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when ended", () => {
    const s = { ...initialState(42, settings3Easy), ended: true, score: 7 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(7);
  });

  it("no actions after ended", () => {
    const s = { ...initialState(42, settings3Easy), ended: true, score: 5 };
    const s2 = reducer(s, { type: "new" });
    expect(s2.score).toBe(5);
  });
});
