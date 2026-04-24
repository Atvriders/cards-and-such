import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, toRoman } from "./state.js";

const arabic10 = { direction: "to-arabic" as const, difficulty: "easy" as const, questions: "10" as const };
const roman10 = { direction: "to-roman" as const, difficulty: "medium" as const, questions: "10" as const };

describe("toRoman conversion", () => {
  it("converts 1 to I", () => expect(toRoman(1)).toBe("I"));
  it("converts 4 to IV", () => expect(toRoman(4)).toBe("IV"));
  it("converts 9 to IX", () => expect(toRoman(9)).toBe("IX"));
  it("converts 14 to XIV", () => expect(toRoman(14)).toBe("XIV"));
  it("converts 40 to XL", () => expect(toRoman(40)).toBe("XL"));
  it("converts 90 to XC", () => expect(toRoman(90)).toBe("XC"));
  it("converts 1984 to MCMLXXXIV", () => expect(toRoman(1984)).toBe("MCMLXXXIV"));
});

describe("RomanNumerals initialState", () => {
  it("starts with zero score", () => {
    const s = initialState(1, arabic10);
    expect(s.score).toBe(0);
    expect(s.phase).toBe("playing");
  });

  it("generates correct number of questions", () => {
    const s = initialState(1, arabic10);
    expect(s.questions.length).toBe(10);
  });

  it("same seed is deterministic", () => {
    const s1 = initialState(42, arabic10);
    const s2 = initialState(42, arabic10);
    expect(s1.questions[0]!.arabic).toBe(s2.questions[0]!.arabic);
  });

  it("roman field matches arabic field", () => {
    const s = initialState(7, roman10);
    for (const q of s.questions) {
      expect(q.roman).toBe(toRoman(q.arabic));
    }
  });
});

describe("RomanNumerals reducer (to-arabic)", () => {
  it("correct arabic answer scores 10", () => {
    const s = initialState(1, arabic10);
    const answer = String(s.questions[0]!.arabic);
    const s2 = reducer(reducer(s, { type: "type", text: answer }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.lastResult).toBe("correct");
  });

  it("wrong answer scores 0", () => {
    const s = initialState(1, arabic10);
    const s2 = reducer(reducer(s, { type: "type", text: "9999" }), { type: "submit" });
    expect(s2.score).toBe(0);
    expect(s2.lastResult).toBe("wrong");
  });
});

describe("RomanNumerals reducer (to-roman)", () => {
  it("correct roman answer scores 10", () => {
    const s = initialState(1, roman10);
    const answer = s.questions[0]!.roman;
    const s2 = reducer(reducer(s, { type: "type", text: answer }), { type: "submit" });
    expect(s2.score).toBe(10);
    expect(s2.lastResult).toBe("correct");
  });
});

describe("RomanNumerals isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, arabic10))).toBeNull();
  });

  it("returns score when done", () => {
    let s = initialState(1, arabic10);
    for (let i = 0; i < 10; i++) {
      s = reducer(s, { type: "type", text: String(s.questions[i]!.arabic) });
      s = reducer(s, { type: "submit" });
    }
    expect(isTerminal(s)).not.toBeNull();
    expect(isTerminal(s)!.score).toBe(100);
  });
});
