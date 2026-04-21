import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkBingo } from "./state.js";

const defaultSettings = { difficulty: "medium" as const };

describe("initialState", () => {
  it("creates a 5x5 card with FREE center", () => {
    const s = initialState(42, defaultSettings);
    expect(s.card.length).toBe(5);
    expect(s.card[0]!.length).toBe(5);
    expect(s.card[2]![2]).toBe(0); // FREE
    expect(s.marked[2]![2]).toBe(true); // FREE is pre-marked
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(77, defaultSettings);
    const s2 = initialState(77, defaultSettings);
    expect(s1.card).toEqual(s2.card);
    expect(s1.drawOrder).toEqual(s2.drawOrder);
  });

  it("draw order contains all 75 numbers exactly once", () => {
    const s = initialState(42, defaultSettings);
    const sorted = [...s.drawOrder].sort((a, b) => a - b);
    expect(sorted.length).toBe(75);
    expect(sorted[0]).toBe(1);
    expect(sorted[74]).toBe(75);
  });

  it("creates correct number of opponent cards for medium", () => {
    const s = initialState(42, defaultSettings);
    expect(s.opponentCards.length).toBe(3); // medium = 3 opponents
  });
});

describe("checkBingo", () => {
  it("detects row bingo", () => {
    const marked = Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => r === 0)
    );
    expect(checkBingo(marked)).toBe(true);
  });

  it("detects column bingo", () => {
    const marked = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, (_, c) => c === 2)
    );
    expect(checkBingo(marked)).toBe(true);
  });

  it("detects diagonal bingo", () => {
    const marked = Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => r === c)
    );
    expect(checkBingo(marked)).toBe(true);
  });

  it("returns false for incomplete card", () => {
    const marked = Array.from({ length: 5 }, () => Array(5).fill(false));
    expect(checkBingo(marked)).toBe(false);
  });
});

describe("reducer — draw", () => {
  it("draws a number and increments drawCount", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.drawCount).toBe(1);
    expect(s2.currentNumber).toBe(s.drawOrder[0]);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(42, defaultSettings), gameOver: true };
    const s2 = reducer(s, { type: "draw" });
    expect(s2).toBe(s);
  });
});

describe("reducer — mark", () => {
  it("marks a matching number when drawn", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "draw" });
    const drawn = s2.currentNumber!;
    // Find the cell with this number
    let targetRow = -1, targetCol = -1;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (s2.card[r]![c] === drawn) { targetRow = r; targetCol = c; }
      }
    }
    if (targetRow !== -1) {
      const s3 = reducer(s2, { type: "mark", row: targetRow, col: targetCol });
      expect(s3.marked[targetRow]![targetCol]).toBe(true);
    } else {
      // Number not on card — mark should be no-op
      const s3 = reducer(s2, { type: "mark", row: 0, col: 0 });
      expect(s3.marked).toEqual(s2.marked);
    }
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns positive score for player win", () => {
    const s = { ...initialState(42, defaultSettings), gameOver: true, playerWon: true, drawCount: 20 };
    const t = isTerminal(s);
    expect(t!.score).toBeGreaterThan(0);
  });

  it("returns 0 for loss", () => {
    const s = { ...initialState(42, defaultSettings), gameOver: true, playerWon: false, opponentWon: 0 };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
