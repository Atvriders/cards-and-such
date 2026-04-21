import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { range: "100" as const, maxAttempts: "7" as const };

describe("initialState", () => {
  it("generates secret in correct range", () => {
    const s = initialState(42, defaultSettings);
    expect(s.secret).toBeGreaterThanOrEqual(1);
    expect(s.secret).toBeLessThanOrEqual(100);
    expect(s.attempts).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.secret).toBe(s2.secret);
  });

  it("respects range setting", () => {
    const s = initialState(1, { range: "1000" as const, maxAttempts: "10" as const });
    expect(s.range).toBe(1000);
    expect(s.maxAttempts).toBe(10);
  });
});

describe("reducer — set-guess", () => {
  it("updates current guess", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "set-guess", value: 75 });
    expect(s2.currentGuess).toBe(75);
  });

  it("clamps guess to valid range", () => {
    const s = initialState(42, defaultSettings);
    expect(reducer(s, { type: "set-guess", value: 0 }).currentGuess).toBe(1);
    expect(reducer(s, { type: "set-guess", value: 999 }).currentGuess).toBe(100);
  });
});

describe("reducer — submit", () => {
  it("records guess in history", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(reducer(s, { type: "set-guess", value: 50 }), { type: "submit" });
    expect(s2.history.length).toBe(1);
    expect(s2.history[0]!.guess).toBe(50);
    expect(["higher", "lower", "correct"]).toContain(s2.history[0]!.hint);
  });

  it("wins when guessing the secret", () => {
    const s = initialState(42, defaultSettings);
    const correct = s.secret;
    const s2 = reducer(reducer(s, { type: "set-guess", value: correct }), { type: "submit" });
    expect(s2.winner).toBe("player");
    expect(s2.gameOver).toBe(true);
    expect(s2.hint).toBe("correct");
  });

  it("game over when out of attempts", () => {
    const s = initialState(42, defaultSettings);
    let state = s;
    // Make wrong guesses until out of attempts
    const wrong = s.secret === 1 ? 2 : 1;
    for (let i = 0; i < s.maxAttempts; i++) {
      state = reducer(reducer(state, { type: "set-guess", value: wrong }), { type: "submit" });
    }
    expect(state.gameOver).toBe(true);
    expect(state.winner).toBeNull();
  });

  it("is no-op after game over", () => {
    const s = initialState(42, defaultSettings);
    const correct = s.secret;
    let state = reducer(reducer(s, { type: "set-guess", value: correct }), { type: "submit" });
    expect(state.gameOver).toBe(true);
    const prev = state;
    state = reducer(state, { type: "submit" });
    expect(state).toBe(prev);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("score formula: (maxAttempts - attempts + 1) * 100", () => {
    const s = initialState(42, defaultSettings);
    const won = { ...s, gameOver: true, winner: "player" as const, attempts: 3 };
    const t = isTerminal(won);
    expect(t!.score).toBe((7 - 3 + 1) * 100); // 500
  });

  it("score = 0 for failed game", () => {
    const s = initialState(42, defaultSettings);
    const lost = { ...s, gameOver: true, winner: null };
    expect(isTerminal(lost)!.score).toBe(0);
  });
});
