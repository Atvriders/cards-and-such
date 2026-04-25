import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, computeHints, CODE_DIGITS, MAX_ATTEMPTS } from "./state.js";

describe("SafeCracker", () => {
  it("initialState generates a valid code", () => {
    const s = initialState(42, {});
    expect(s.secret).toHaveLength(CODE_DIGITS);
    for (const d of s.secret) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(9);
    }
    expect(s.phase).toBe("playing");
  });

  it("computeHints: all exact", () => {
    const h = computeHints([1, 2, 3, 4], [1, 2, 3, 4]);
    expect(h.exact).toBe(4);
    expect(h.misplaced).toBe(0);
  });

  it("computeHints: all misplaced", () => {
    const h = computeHints([1, 2, 3, 4], [4, 3, 2, 1]);
    expect(h.exact).toBe(0);
    expect(h.misplaced).toBe(4);
  });

  it("computeHints: mixed", () => {
    const h = computeHints([1, 1, 2, 2], [1, 2, 3, 4]);
    expect(h.exact).toBe(1); // first 1
    expect(h.misplaced).toBe(1); // 2 is misplaced
  });

  it("setDigit updates current guess", () => {
    const s = initialState(1, {});
    const s2 = reducer(s, { type: "setDigit", pos: 2, digit: 7 });
    expect(s2.currentGuess[2]).toBe(7);
  });

  it("submitting the correct code wins", () => {
    let s = initialState(99, {});
    const s2 = { ...s, currentGuess: [...s.secret] };
    const result = reducer(s2, { type: "submit" });
    expect(result.phase).toBe("won");
    expect(result.score).toBeGreaterThan(0);
    expect(isTerminal(result)!.score).toBe(result.score);
  });

  it("exhausting attempts loses", () => {
    let s = initialState(0, {});
    // Force all wrong guesses by using a known bad code
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      // pick a digit far from secret to minimize chance of accidental win
      const wrongGuess = s.secret.map((d) => (d + 5) % 10);
      s = reducer({ ...s, currentGuess: wrongGuess }, { type: "submit" });
      if (s.phase !== "playing") break;
    }
    expect(s.phase).toBe("lost");
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("clear resets guess to zeros", () => {
    let s = initialState(2, {});
    s = reducer(s, { type: "setDigit", pos: 0, digit: 9 });
    s = reducer(s, { type: "clear" });
    expect(s.currentGuess.every((d) => d === 0)).toBe(true);
  });
});
