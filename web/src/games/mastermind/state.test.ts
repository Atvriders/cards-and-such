import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  computeFeedback,
  CODE_LENGTH,
  MAX_GUESSES,
  COLORS,
  type Color,
} from "./state.js";

describe("Mastermind", () => {
  it("generates a valid secret code of length 4", () => {
    const s = initialState(42, {});
    expect(s.secret).toHaveLength(CODE_LENGTH);
    for (const c of s.secret) {
      expect(COLORS).toContain(c);
    }
  });

  it("computeFeedback: all correct gives 4 blacks 0 whites", () => {
    const code: Color[] = ["red", "green", "blue", "yellow"];
    const fb = computeFeedback(code, code);
    expect(fb.blacks).toBe(4);
    expect(fb.whites).toBe(0);
  });

  it("computeFeedback: all wrong colors gives 0 blacks 0 whites", () => {
    const secret: Color[] = ["red", "red", "red", "red"];
    const guess: Color[] = ["blue", "blue", "blue", "blue"];
    const fb = computeFeedback(secret, guess);
    expect(fb.blacks).toBe(0);
    expect(fb.whites).toBe(0);
  });

  it("computeFeedback: correct colors wrong positions gives 0 blacks and whites", () => {
    const secret: Color[] = ["red", "green", "blue", "yellow"];
    const guess: Color[] = ["green", "blue", "yellow", "red"];
    const fb = computeFeedback(secret, guess);
    expect(fb.blacks).toBe(0);
    expect(fb.whites).toBe(4);
  });

  it("submitting the correct guess sets winner to player and computes score", () => {
    const s = initialState(99, {});
    // Set current guess to the secret
    const s2 = { ...s, currentGuess: [...s.secret] as Color[] };
    const next = reducer(s2, { type: "submit" });
    expect(next.winner).toBe("player");
    expect(next.score).toBe((MAX_GUESSES + 1 - 1) * 100); // 1000 first guess
    expect(isTerminal(next)?.score).toBe(next.score);
  });

  it("exceeding MAX_GUESSES sets winner to codemaker", () => {
    let s = initialState(0, {});
    // Make wrong guesses
    const wrongGuess: Color[] = ["red", "red", "red", "red"];
    for (let i = 0; i < MAX_GUESSES; i++) {
      // ensure wrong guess (skip if happens to match secret)
      const guess = s.secret.every((c, idx) => wrongGuess[idx] === c) ? ["blue", "blue", "blue", "blue"] as Color[] : wrongGuess;
      s = reducer({ ...s, currentGuess: guess }, { type: "submit" });
    }
    expect(s.winner).toBe("codemaker");
    expect(isTerminal(s)?.score).toBe(0);
  });

  it("setColor action updates current guess", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "setColor", pos: 2, color: "purple" });
    expect(next.currentGuess[2]).toBe("purple");
    expect(next.currentGuess[0]).toBe(s.currentGuess[0]);
  });
});
