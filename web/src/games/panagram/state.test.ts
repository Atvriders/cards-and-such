import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("panagram", () => {
  it("initialState has 7 letters", () => {
    const s = initialState(1);
    expect(s.allLetters).toHaveLength(7);
    expect(s.centerLetter).toBeTruthy();
    expect(s.outerLetters).toHaveLength(6);
  });

  it("letter action appends to current", () => {
    let s = initialState(2);
    s = reducer(s, { type: "letter", char: s.centerLetter });
    expect(s.current).toBe(s.centerLetter);
  });

  it("backspace removes last letter", () => {
    let s = initialState(3);
    s = reducer(s, { type: "letter", char: s.centerLetter });
    s = reducer(s, { type: "backspace" });
    expect(s.current).toBe("");
  });

  it("submit on too-short word rejects it", () => {
    let s = initialState(4);
    s = reducer(s, { type: "letter", char: s.centerLetter });
    s = reducer(s, { type: "submit" });
    expect(s.message).toMatch(/Too short/i);
    expect(s.found).toHaveLength(0);
  });

  it("endGame transitions to done", () => {
    let s = initialState(5);
    s = reducer(s, { type: "endGame" });
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
