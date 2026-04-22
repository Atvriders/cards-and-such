import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  computeFeedback,
  CODE_LENGTH,
  MAX_GUESSES,
  MAX_HINTS,
  COLORS,
  type CBColor,
} from "./state.js";

describe("Code Breaker", () => {
  it("generates a valid 5-color secret", () => {
    const s = initialState(42, {});
    expect(s.secret).toHaveLength(CODE_LENGTH);
    for (const c of s.secret) {
      expect(COLORS).toContain(c);
    }
    expect(s.hintsLeft).toBe(MAX_HINTS);
  });

  it("computeFeedback: all correct gives 5 bulls 0 cows", () => {
    const code: CBColor[] = ["red", "green", "blue", "yellow", "pink"];
    const fb = computeFeedback(code, code);
    expect(fb.bulls).toBe(5);
    expect(fb.cows).toBe(0);
  });

  it("computeFeedback: rotated gives 0 bulls and all cows", () => {
    const code: CBColor[] = ["red", "orange", "yellow", "green", "blue"];
    const rotated: CBColor[] = ["orange", "yellow", "green", "blue", "red"];
    const fb = computeFeedback(code, rotated);
    expect(fb.bulls).toBe(0);
    expect(fb.cows).toBe(5);
  });

  it("useHint reveals first position and decrements hintsLeft", () => {
    const s = initialState(7, {});
    const s2 = reducer(s, { type: "useHint" });
    expect(s2.hintsLeft).toBe(MAX_HINTS - 1);
    expect(s2.revealed[0]).toBe(true);
    expect(s2.currentGuess[0]).toBe(s.secret[0]);
  });

  it("submitting correct guess wins", () => {
    const s = initialState(99, {});
    // Fill current guess with secret
    let s2 = s;
    for (let i = 0; i < CODE_LENGTH; i++) {
      s2 = reducer(s2, { type: "setColor", pos: i, color: s.secret[i]! });
    }
    const next = reducer(s2, { type: "submit" });
    expect(next.winner).toBe("player");
    expect(next.score).toBeGreaterThan(0);
    expect(isTerminal(next)?.score).toBe(next.score);
  });

  it("running out of guesses sets winner to house", () => {
    let s = initialState(0, {});
    const wrong: CBColor[] = ["red", "red", "red", "red", "red"];
    for (let i = 0; i < MAX_GUESSES; i++) {
      s = { ...s, currentGuess: [...wrong] };
      s = reducer(s, { type: "submit" });
      if (s.winner !== null) break;
    }
    expect(s.winner).toBe("house");
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("setColor updates the selected position", () => {
    const s = initialState(1, {});
    const s2 = reducer(s, { type: "setColor", pos: 2, color: "purple" });
    expect(s2.currentGuess[2]).toBe("purple");
    expect(s2.selectedPos).toBe(3); // auto-advance
  });
});
