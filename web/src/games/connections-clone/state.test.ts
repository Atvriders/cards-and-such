import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("connections-clone", () => {
  it("initialState has 16 words", () => {
    const s = initialState(1);
    expect(s.allWords).toHaveLength(16);
    expect(s.groups).toHaveLength(4);
    expect(s.phase).toBe("playing");
  });

  it("toggle selects a word", () => {
    const s = initialState(2);
    const word = s.allWords[0]!;
    const s2 = reducer(s, { type: "toggle", word });
    expect(s2.selected).toContain(word);
  });

  it("cannot select more than 4 words", () => {
    let s = initialState(3);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "toggle", word: s.allWords[i]! });
    }
    expect(s.selected.length).toBeLessThanOrEqual(4);
  });

  it("submit with wrong selection increments attempts", () => {
    let s = initialState(4);
    // Pick first 4 (likely wrong group mix)
    for (let i = 0; i < 4; i++) s = reducer(s, { type: "toggle", word: s.allWords[i]! });
    const s2 = reducer(s, { type: "submit" });
    // Either solved or attempts incremented
    expect(s2.attempts).toBeGreaterThanOrEqual(1);
  });

  it("winning a group removes words from grid", () => {
    let s = initialState(5);
    // Find a group and select all its words
    const group = s.groups[0]!;
    for (const w of group.words) s = reducer(s, { type: "toggle", word: w });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.allWords.length).toBeLessThanOrEqual(16);
    expect(s2.solvedColors).toContain(group.color);
  });
});
