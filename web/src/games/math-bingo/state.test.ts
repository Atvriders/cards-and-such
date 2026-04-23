import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkBingo, FREE_CENTER } from "./state.js";

const easySettings = { difficulty: "easy" as const };
const hardSettings = { difficulty: "hard" as const };

describe("initialState", () => {
  it("creates a 25-cell card with FREE center", () => {
    const s = initialState(42, easySettings);
    expect(s.card).toHaveLength(25);
    expect(s.marked[FREE_CENTER]).toBe(true);
    expect(s.card[FREE_CENTER]).toBe(0);
    expect(s.done).toBe(false);
    expect(s.problemsDrawn).toBe(0);
  });

  it("all non-center marked cells start as false", () => {
    const s = initialState(1, easySettings);
    const nonCenter = s.marked.filter((_, i) => i !== FREE_CENTER);
    expect(nonCenter.every((v) => !v)).toBe(true);
  });
});

describe("checkBingo", () => {
  it("detects row bingo", () => {
    const marked = Array(25).fill(false);
    [0, 1, 2, 3, 4].forEach((i) => (marked[i] = true));
    expect(checkBingo(marked)).toBe(true);
  });

  it("detects diagonal bingo", () => {
    const marked = Array(25).fill(false);
    [0, 6, 12, 18, 24].forEach((i) => (marked[i] = true));
    expect(checkBingo(marked)).toBe(true);
  });

  it("no false positive for partial line", () => {
    const marked = Array(25).fill(false);
    [0, 1, 2, 3].forEach((i) => (marked[i] = true));
    expect(checkBingo(marked)).toBe(false);
  });
});

describe("reducer — draw", () => {
  it("increments problemsDrawn", () => {
    const s = initialState(42, easySettings);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.problemsDrawn).toBe(1);
    expect(s2.problem).not.toBeNull();
  });

  it("done after 30 draws without bingo", () => {
    let s = initialState(99, easySettings);
    // Remove winning condition by making a card with values that won't appear
    s = { ...s, card: s.card.map((_, i) => (i === FREE_CENTER ? 0 : 9999)) };
    for (let i = 0; i < 30; i++) {
      s = reducer(s, { type: "draw" });
    }
    expect(s.done).toBe(true);
    expect(s.won).toBe(false);
  });

  it("no-op when done", () => {
    const s = { ...initialState(1, easySettings), done: true };
    const s2 = reducer(s, { type: "draw" });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, easySettings))).toBeNull();
  });

  it("no-bingo scores 0", () => {
    const s = { ...initialState(1, easySettings), done: true, won: false };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("bingo scores 500 + efficiency bonus", () => {
    const s = { ...initialState(1, easySettings), done: true, won: true, problemsDrawn: 20 };
    expect(isTerminal(s)!.score).toBe(500 + (30 - 20) * 10); // 600
  });

  it("hard difficulty same scoring formula", () => {
    const s = { ...initialState(1, hardSettings), done: true, won: true, problemsDrawn: 15 };
    expect(isTerminal(s)!.score).toBe(500 + 150); // 650
  });
});
