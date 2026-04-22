import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SecretNumberSettings } from "./state.js";

const noLies: SecretNumberSettings = { range: "100", lies: "0" };
const withLies: SecretNumberSettings = { range: "100", lies: "2" };

describe("SecretNumber initialState", () => {
  it("secret is within range", () => {
    const s = initialState(42, noLies);
    expect(s.secret).toBeGreaterThanOrEqual(1);
    expect(s.secret).toBeLessThanOrEqual(100);
  });

  it("starts with zero attempts and no history", () => {
    const s = initialState(42, noLies);
    expect(s.attempts).toBe(0);
    expect(s.history).toHaveLength(0);
    expect(s.gameOver).toBe(false);
  });

  it("liesRemaining matches lies setting", () => {
    expect(initialState(1, noLies).liesRemaining).toBe(0);
    expect(initialState(1, withLies).liesRemaining).toBe(2);
  });
});

describe("SecretNumber reducer", () => {
  it("set-guess clamps to valid range", () => {
    const s = initialState(42, noLies);
    const s2 = reducer(s, { type: "set-guess", value: 999 });
    expect(s2.currentGuess).toBeLessThanOrEqual(100);
    const s3 = reducer(s, { type: "set-guess", value: -5 });
    expect(s3.currentGuess).toBeGreaterThanOrEqual(1);
  });

  it("correct guess wins the game (no lies)", () => {
    const s = initialState(42, noLies);
    const s2 = reducer(s, { type: "set-guess", value: s.secret });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.gameOver).toBe(true);
    expect(s3.winner).toBe("player");
  });

  it("hints are correct when no lies configured", () => {
    const s = initialState(42, noLies);
    // Guess 1 — if secret > 1, hint should be "higher"
    if (s.secret > 1) {
      const s2 = reducer(s, { type: "set-guess", value: 1 });
      const s3 = reducer(s2, { type: "submit" });
      expect(s3.lastHint).toBe("higher");
    }
  });

  it("game ends when attempts are exhausted", () => {
    let s = initialState(99, noLies);
    // Guess wrong until out of attempts
    let iters = 0;
    while (!s.gameOver && iters < 100) {
      const wrong = s.secret === 1 ? 2 : 1;
      s = reducer(s, { type: "set-guess", value: wrong });
      s = reducer(s, { type: "submit" });
      iters++;
    }
    expect(s.gameOver).toBe(true);
  });

  it("restart creates a fresh state", () => {
    let s = initialState(42, noLies);
    s = reducer(s, { type: "set-guess", value: s.secret });
    s = reducer(s, { type: "submit" });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.attempts).toBe(0);
    expect(s2.gameOver).toBe(false);
  });

  it("lies setting allows lied hints (liesUsed increments)", () => {
    // Run many seeds and check that liesUsed can become > 0
    let liesObserved = false;
    for (let seed = 0; seed < 100 && !liesObserved; seed++) {
      let s = initialState(seed, withLies);
      for (let i = 0; i < 20 && !s.gameOver; i++) {
        const wrong = s.secret === 1 ? 2 : 1;
        s = reducer(s, { type: "set-guess", value: wrong });
        s = reducer(s, { type: "submit" });
        if (s.liesUsed > 0) liesObserved = true;
      }
    }
    expect(liesObserved).toBe(true);
  });
});

describe("SecretNumber isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(42, noLies))).toBeNull();
  });

  it("returns positive score on win", () => {
    const s = initialState(42, noLies);
    const s2 = reducer(s, { type: "set-guess", value: s.secret });
    const s3 = reducer(s2, { type: "submit" });
    expect(isTerminal(s3)!.score).toBeGreaterThan(0);
  });

  it("returns 0 on loss", () => {
    let s = initialState(99, noLies);
    while (!s.gameOver) {
      const wrong = s.secret === 1 ? 2 : 1;
      s = reducer(s, { type: "set-guess", value: wrong });
      s = reducer(s, { type: "submit" });
    }
    if (!s.winner) {
      expect(isTerminal(s)!.score).toBe(0);
    }
  });
});
