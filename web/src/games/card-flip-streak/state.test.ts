import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s0 = () => initialState(42, { rounds: "10" });

describe("CardFlipStreak", () => {
  it("starts with score 0, round 1, picking phase", () => {
    const s = s0();
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("picking");
  });

  it("flip reveals a card", () => {
    const s = s0();
    const s2 = reducer(s, { type: "flip" });
    expect(s2.flipped).not.toBeNull();
  });

  it("red card increases streak and score", () => {
    // Find a seed where first card is red
    let found = false;
    for (let seed = 1; seed < 100; seed++) {
      const s = initialState(seed, { rounds: "10" });
      const s2 = reducer(s, { type: "flip" });
      if (s2.lastRed) {
        expect(s2.streak).toBe(1);
        expect(s2.score).toBeGreaterThan(0);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("isTerminal returns score when gameover", () => {
    const s = { ...s0(), phase: "gameover" as const };
    expect(isTerminal(s)?.score).toBeDefined();
  });
});
