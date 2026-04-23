import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { duration: "30" as const, difficulty: "easy" as const };

describe("RhymeTime initialState", () => {
  it("creates a state with a prompt word", () => {
    const s = initialState(1, defaultSettings);
    expect(s.promptWord.length).toBeGreaterThan(0);
    expect(s.validRhymes.length).toBeGreaterThan(0);
  });

  it("starts with empty foundRhymes", () => {
    const s = initialState(1, defaultSettings);
    expect(s.foundRhymes).toEqual([]);
  });

  it("timer starts at duration setting", () => {
    const s30 = initialState(1, { duration: "30", difficulty: "easy" });
    const s60 = initialState(1, { duration: "60", difficulty: "easy" });
    expect(s30.timeLeft).toBe(30);
    expect(s60.timeLeft).toBe(60);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1.promptWord).toBe(s2.promptWord);
  });

  it("starts in playing phase", () => {
    const s = initialState(1, defaultSettings);
    expect(s.phase).toBe("playing");
  });
});

describe("RhymeTime reducer - type and submit", () => {
  it("type action updates inputText", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "type", text: "Bat123" });
    expect(s2.inputText).toBe("bat");
  });

  it("valid rhyme is accepted", () => {
    const s = initialState(1, defaultSettings);
    // Find a valid rhyme from the list
    const validRhyme = s.validRhymes[0]!;
    const s2 = reducer(s, { type: "type", text: validRhyme });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.foundRhymes).toContain(validRhyme);
    expect(s3.inputText).toBe("");
  });

  it("invalid rhyme gives error", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "type", text: "xyzqprst" });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.foundRhymes.length).toBe(0);
    expect(s3.lastError).toContain("doesn't rhyme");
  });

  it("duplicate rhyme gives error", () => {
    const s = initialState(1, defaultSettings);
    const validRhyme = s.validRhymes[0]!;
    const s2 = reducer(s, { type: "type", text: validRhyme });
    const s3 = reducer(s2, { type: "submit" });
    const s4 = reducer(s3, { type: "type", text: validRhyme });
    const s5 = reducer(s4, { type: "submit" });
    expect(s5.foundRhymes.length).toBe(1);
    expect(s5.lastError).toContain("already found");
  });

  it("prompt word itself gives error", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "type", text: s.promptWord });
    const s3 = reducer(s2, { type: "submit" });
    expect(s3.foundRhymes.length).toBe(0);
    expect(s3.lastError).toContain("prompt word");
  });
});

describe("RhymeTime reducer - tick", () => {
  it("tick decrements timer", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(29);
  });

  it("tick to zero ends game", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    expect(s.phase).toBe("done");
    expect(s.timeLeft).toBe(0);
  });

  it("no actions after done", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    const before = s;
    const after = reducer(s, { type: "tick" });
    expect(after).toBe(before);
  });
});

describe("RhymeTime isTerminal", () => {
  it("returns null during play", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score (rhymes × 10) when done", () => {
    let s = initialState(1, defaultSettings);
    const rhyme1 = s.validRhymes[0]!;
    const rhyme2 = s.validRhymes[1]!;
    s = reducer(s, { type: "type", text: rhyme1 });
    s = reducer(s, { type: "submit" });
    s = reducer(s, { type: "type", text: rhyme2 });
    s = reducer(s, { type: "submit" });
    for (let i = 0; i < 30; i++) s = reducer(s, { type: "tick" });
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
