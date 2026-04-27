import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, toRoman, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("RomanNumeralsMini", () => {
  it("starts in playing with 20 rounds", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.rounds.length).toBe(TOTAL_ROUNDS);
  });
  it("toRoman handles common values", () => {
    expect(toRoman(1)).toBe("I");
    expect(toRoman(4)).toBe("IV");
    expect(toRoman(9)).toBe("IX");
    expect(toRoman(40)).toBe("XL");
    expect(toRoman(50)).toBe("L");
    expect(toRoman(99)).toBe("XCIX");
  });
  it("each round's correct value matches its Roman", () => {
    const s = initialState(1, S);
    for (const r of s.rounds) {
      expect(r.choices[r.correct]).toBe(r.value);
      expect(toRoman(r.value)).toBe(r.roman);
    }
  });
  it("correct selection scores 10", () => {
    const s = initialState(1, S);
    const r = s.rounds[0]!;
    const s2 = reducer(reducer(s, { type: "select", choice: r.correct }), { type: "submit" });
    expect(s2.score).toBeGreaterThanOrEqual(10);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
