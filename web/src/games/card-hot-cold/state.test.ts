import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
const S = { rounds: "5" as const };
describe("CardHotCold", () => {
  it("initializes correctly", () => {
    const s = initialState(42, S);
    expect(s.phase).toBe("playing");
    expect(s.guess).toBeNull();
    expect(s.score).toBe(0);
  });
  it("guessing reveals and sets phase", () => {
    const s = initialState(42, S);
    const s2 = reducer(s, { type: "guess", choice: "hot" });
    expect(s2.phase).toBe("revealed");
    expect(s2.guess).toBe("hot");
  });
  it("correct guess scores 10", () => {
    let found = false;
    for (let seed = 0; seed < 30; seed++) {
      const s = initialState(seed, S);
      const s2h = reducer(s, { type: "guess", choice: "hot" });
      const s2c = reducer(s, { type: "guess", choice: "cold" });
      if (s2h.score === 10 || s2c.score === 10) { found = true; break; }
    }
    expect(found).toBe(true);
  });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "guess", choice: "hot" });
      s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
