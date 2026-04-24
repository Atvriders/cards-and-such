import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settingsEasy60 = { duration: "60" as const, difficulty: "easy" as const };
const settingsMed30 = { duration: "30" as const, difficulty: "medium" as const };

describe("TypingWords initialState", () => {
  it("starts with empty input, 0 correct, 0 elapsed, not ended", () => {
    const s = initialState(42, settingsEasy60);
    expect(s.input).toBe("");
    expect(s.correct).toBe(0);
    expect(s.elapsed).toBe(0);
    expect(s.ended).toBe(false);
  });

  it("generates a non-empty word list", () => {
    const s = initialState(1, settingsEasy60);
    expect(s.words.length).toBeGreaterThan(10);
  });

  it("same seed produces same word list", () => {
    const s1 = initialState(7, settingsEasy60);
    const s2 = initialState(7, settingsEasy60);
    expect(s1.words).toEqual(s2.words);
  });

  it("currentIndex starts at 0", () => {
    const s = initialState(99, settingsMed30);
    expect(s.currentIndex).toBe(0);
  });
});

describe("TypingWords tick", () => {
  it("advances elapsed time", () => {
    const s = initialState(42, settingsMed30);
    const s2 = reducer(s, { type: "tick", dt: 5 });
    expect(s2.elapsed).toBeCloseTo(5);
  });

  it("ends game when elapsed >= duration", () => {
    const s = initialState(42, settingsMed30);
    const s2 = reducer(s, { type: "tick", dt: 30 });
    expect(s2.ended).toBe(true);
  });

  it("no tick after ended", () => {
    const s = initialState(42, settingsMed30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const again = reducer(ended, { type: "tick", dt: 5 });
    expect(again.elapsed).toBe(30);
  });
});

describe("TypingWords type and submit", () => {
  it("type action updates input", () => {
    const s = initialState(42, settingsEasy60);
    const s2 = reducer(s, { type: "type", text: "the" });
    expect(s2.input).toBe("the");
  });

  it("space auto-submits and advances index", () => {
    const s = initialState(42, settingsEasy60);
    const word = s.words[0]!;
    const s2 = reducer(s, { type: "type", text: word + " " });
    expect(s2.currentIndex).toBe(1);
    expect(s2.input).toBe("");
  });

  it("correct word increments correct count", () => {
    const s = initialState(42, settingsEasy60);
    const word = s.words[0]!;
    const s2 = reducer({ ...s, input: word }, { type: "submit" });
    expect(s2.correct).toBe(1);
    expect(s2.incorrect).toBe(0);
  });

  it("wrong word increments incorrect count", () => {
    const s = initialState(42, settingsEasy60);
    const s2 = reducer({ ...s, input: "zzzzz" }, { type: "submit" });
    expect(s2.incorrect).toBe(1);
    expect(s2.correct).toBe(0);
  });
});

describe("TypingWords isTerminal", () => {
  it("returns null while running", () => {
    const s = initialState(42, settingsEasy60);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score object when ended", () => {
    const s = initialState(42, settingsMed30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    const result = isTerminal(ended);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
  });

  it("score is 0 when no words typed", () => {
    const s = initialState(42, settingsMed30);
    const ended = reducer(s, { type: "tick", dt: 30 });
    expect(isTerminal(ended)?.score).toBe(0);
  });

  it("score increases with correct words", () => {
    const s = initialState(42, settingsMed30);
    const withCorrect = { ...s, correct: 20, incorrect: 0, ended: true };
    const result = isTerminal(withCorrect);
    expect(result?.score).toBeGreaterThan(0);
  });
});
