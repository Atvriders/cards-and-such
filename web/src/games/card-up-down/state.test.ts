import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { rounds: "10" as const };

describe("CardUpDown initialState", () => {
  it("starts with a current card and guessing phase", () => {
    const s = initialState(1, def);
    expect(s.phase).toBe("guessing");
    expect(s.currentCard).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, def);
    const s2 = initialState(42, def);
    expect(s1.currentCard).toBe(s2.currentCard);
  });

  it("maxRounds matches settings", () => {
    expect(initialState(1, def).maxRounds).toBe(10);
    expect(initialState(1, { rounds: "20" }).maxRounds).toBe(20);
  });

  it("starts with zero score", () => {
    expect(initialState(1, def).score).toBe(0);
  });
});

describe("CardUpDown reducer", () => {
  it("guess transitions to reveal phase", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "guess", dir: "up" });
    expect(["reveal", "gameover"]).toContain(s2.phase);
  });

  it("next advances round", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "guess", dir: "up" });
    if (s2.phase === "reveal") {
      const s3 = reducer(s2, { type: "next" });
      expect(s3.round).toBe(2);
    }
  });

  it("correct guess awards points", () => {
    const s = initialState(1, def);
    const s2 = reducer(s, { type: "guess", dir: "up" });
    const s3 = reducer(s, { type: "guess", dir: "down" });
    const scores = [s2.score, s3.score];
    expect(scores.some(x => x > 0)).toBe(true);
  });

  it("gameover when maxRounds reached", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "guess", dir: "up" });
      if (s.phase === "reveal") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("gameover");
  });
});

describe("CardUpDown isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, def))).toBeNull();
  });

  it("returns score when gameover", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "guess", dir: "up" });
      if (s.phase === "reveal") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
