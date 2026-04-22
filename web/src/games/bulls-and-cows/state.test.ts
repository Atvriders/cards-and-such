import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  computeFeedback,
  MAX_GUESSES,
} from "./state.js";

describe("Bulls and Cows", () => {
  it("generates a secret with the right length and unique digits (no repeats)", () => {
    const s = initialState(42, { codeLength: "4", allowRepeats: false });
    expect(s.secret).toHaveLength(4);
    const unique = new Set(s.secret);
    expect(unique.size).toBe(4);
    for (const d of s.secret) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(9);
    }
  });

  it("generates a 3-digit secret", () => {
    const s = initialState(7, { codeLength: "3", allowRepeats: false });
    expect(s.secret).toHaveLength(3);
    expect(s.codeLength).toBe(3);
  });

  it("computeFeedback: all correct gives all bulls", () => {
    const fb = computeFeedback([1, 2, 3, 4], [1, 2, 3, 4]);
    expect(fb.bulls).toBe(4);
    expect(fb.cows).toBe(0);
  });

  it("computeFeedback: rotated digits gives all cows", () => {
    const fb = computeFeedback([1, 2, 3, 4], [4, 1, 2, 3]);
    expect(fb.bulls).toBe(0);
    expect(fb.cows).toBe(4);
  });

  it("computeFeedback: completely wrong gives 0 bulls 0 cows", () => {
    const fb = computeFeedback([1, 2, 3, 4], [5, 6, 7, 8]);
    expect(fb.bulls).toBe(0);
    expect(fb.cows).toBe(0);
  });

  it("submitting the correct guess wins and scores correctly", () => {
    const s = initialState(99, { codeLength: "4", allowRepeats: false });
    // Type each digit of the secret
    let s2 = s;
    for (const d of s.secret) {
      s2 = reducer(s2, { type: "typeDigit", digit: String(d) });
    }
    const next = reducer(s2, { type: "submit" });
    expect(next.winner).toBe("player");
    expect(next.score).toBe(1000); // first guess
    expect(isTerminal(next)?.score).toBe(1000);
  });

  it("exceeding MAX_GUESSES sets winner to house", () => {
    let s = initialState(0, { codeLength: "4", allowRepeats: false });
    // Find digits not in secret for a guaranteed wrong guess
    const notInSecret = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !s.secret.includes(d));
    const wrongDigits = notInSecret.slice(0, 4);
    for (let i = 0; i < MAX_GUESSES; i++) {
      s = { ...s, currentGuess: wrongDigits.join("") };
      s = reducer(s, { type: "submit" });
    }
    expect(s.winner).toBe("house");
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("backspace removes last typed digit", () => {
    const s = initialState(1, { codeLength: "4", allowRepeats: false });
    let s2 = reducer(s, { type: "typeDigit", digit: "3" });
    s2 = reducer(s2, { type: "typeDigit", digit: "7" });
    s2 = reducer(s2, { type: "backspace" });
    expect(s2.currentGuess).toBe("3");
  });

  it("rejects duplicate digits when allowRepeats is false", () => {
    const s = initialState(1, { codeLength: "4", allowRepeats: false });
    let s2 = reducer(s, { type: "typeDigit", digit: "5" });
    s2 = reducer(s2, { type: "typeDigit", digit: "5" }); // duplicate
    expect(s2.currentGuess).toBe("5"); // not added
  });
});
