import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s0 = () => initialState(42, { rounds: "10" });

describe("CardPickStreak", () => {
  it("starts with score 0 and two options", () => {
    const s = s0();
    expect(s.score).toBe(0);
    expect(s.options.length).toBe(2);
    expect(s.phase).toBe("picking");
  });

  it("picking an option changes phase to revealed", () => {
    const s = s0();
    const s2 = reducer(s, { type: "pick", index: 0 });
    expect(s2.phase).toBe("revealed");
    expect(s2.chosen).toBe(0);
  });

  it("correct pick increases score", () => {
    const s = s0();
    const [a, b] = s.options;
    const higherIdx: 0 | 1 = (a % 13) >= (b % 13) ? 0 : 1;
    const s2 = reducer(s, { type: "pick", index: higherIdx });
    expect(s2.lastCorrect).toBe(true);
    expect(s2.score).toBeGreaterThan(0);
  });

  it("isTerminal returns null while playing and score at gameover", () => {
    const s = s0();
    expect(isTerminal(s)).toBeNull();
    const s2 = { ...s, phase: "gameover" as const };
    expect(isTerminal(s2)?.score).toBeDefined();
  });
});
